import { nextTick, onBeforeUnmount, ref, toValue, useTemplateRef } from "vue"
import type { MaybeRefOrGetter } from "vue"
import { debounce } from "lodash-es"
import { useEventListener } from "@vueuse/core"
import type { Position } from "@soppy-slidev/shared"

const FLIP: Record<Position, Position> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
}

export interface UsePopoverOptions {
  position: MaybeRefOrGetter<Position>
  autoPopover: MaybeRefOrGetter<boolean>
  showDelay?: number
  hideDelay?: number
  /** gap between the trigger and the tip, in px */
  gap?: number
  /** how close the arrow may sit to the tip edge, in px */
  arrowEdge?: number
}

export interface PopoverPose {
  left: number
  top: number
  /** where the arrow points (distance from the tip top-left), in px */
  ax: number
  ay: number
}

/**
 * Shared floating-layer behaviour used by Tooltip and Preview: teleport-safe
 * positioning (fixed to viewport), optional flip/clamp, and debounced
 * hover/focus reveal. The component owns the two template refs and the visuals;
 * this composable owns shown/side/pose, the reveal timers and window listeners.
 */
export function usePopover(options: UsePopoverOptions) {
  const showDelay = options.showDelay ?? 200
  const hideDelay = options.hideDelay ?? 150
  const gap = options.gap ?? 8
  const arrowEdge = options.arrowEdge ?? 6

  // template refs are bound by the same names in the host component template
  const triggerEl = useTemplateRef<HTMLElement>("triggerEl")
  const tipEl = useTemplateRef<HTMLElement>("tipEl")
  const shown = ref(false)
  const side = ref<Position>(toValue(options.position))
  const pos = ref<PopoverPose>({ left: 0, top: 0, ax: 0, ay: 0 })

  /* ==================== debounced show / hide ==================== */
  // both directions debounce, so a quick pass over the trigger or a trip onto
  // the tip does not flicker the popover
  const showSoon = debounce(show, showDelay)
  const hideSoon = debounce(hide, hideDelay)

  function onEnter() {
    hideSoon.cancel()
    if (!shown.value) showSoon()
  }

  function onLeave() {
    showSoon.cancel()
    hideSoon()
  }

  function cancelHide() {
    hideSoon.cancel()
  }

  function onFocusIn() {
    showSoon.cancel()
    hideSoon.cancel()
    show()
  }

  function onFocusOut() {
    showSoon.cancel()
    hideSoon.cancel()
    hide()
  }

  async function show() {
    if (shown.value) return
    shown.value = true
    side.value = toValue(options.position)
    await nextTick()
    applyPosition()
  }

  function hide() {
    shown.value = false
  }

  /* ==================== positioning ==================== */
  // the tip is teleported to body, so viewport coordinates from the trigger's
  // rect are also body coordinates; measure right after the tip renders
  function applyPosition() {
    const trigger = triggerEl.value
    const tip = tipEl.value
    if (!trigger || !tip) return

    const tr = trigger.getBoundingClientRect()
    const tw = tip.offsetWidth
    const th = tip.offsetHeight

    const at = (p: Position) => ({
      left:
        p === "left"
          ? tr.left - tw - gap
          : p === "right"
            ? tr.right + gap
            : tr.left + (tr.width - tw) / 2,
      top:
        p === "top"
          ? tr.top - th - gap
          : p === "bottom"
            ? tr.bottom + gap
            : tr.top + (tr.height - th) / 2,
    })

    let p = side.value
    let r = at(p)
    if (toValue(options.autoPopover)) {
      const overflow =
        p === "top"
          ? r.top < 0
          : p === "bottom"
            ? r.top + th > window.innerHeight
            : p === "left"
              ? r.left < 0
              : r.left + tw > window.innerWidth
      if (overflow) {
        p = FLIP[p]
        side.value = p
        r = at(p)
      }
      if (r.left < 0) r.left = 0
      if (r.left + tw > window.innerWidth) r.left = window.innerWidth - tw
      if (r.top < 0) r.top = 0
      if (r.top + th > window.innerHeight) r.top = window.innerHeight - th
    }

    // point the arrow at the trigger centre, clamped inside the tip
    const cx = tr.left + tr.width / 2
    const cy = tr.top + tr.height / 2
    pos.value = {
      left: r.left,
      top: r.top,
      ax: Math.min(Math.max(cx - r.left, arrowEdge), Math.max(tw - arrowEdge, arrowEdge)),
      ay: Math.min(Math.max(cy - r.top, arrowEdge), Math.max(th - arrowEdge, arrowEdge)),
    }
  }

  // reposition while shown (scrolling may be inside the slide, so capture)
  const stopScroll = useEventListener(window, "scroll", onWindowChange, {
    capture: true,
    passive: true,
  })
  const stopResize = useEventListener(window, "resize", onWindowChange)

  function onWindowChange() {
    if (shown.value) applyPosition()
  }

  onBeforeUnmount(() => {
    showSoon.cancel()
    hideSoon.cancel()
    stopScroll()
    stopResize()
  })

  return {
    triggerEl,
    tipEl,
    shown,
    side,
    pos,
    onEnter,
    onLeave,
    cancelHide,
    onFocusIn,
    onFocusOut,
  }
}
