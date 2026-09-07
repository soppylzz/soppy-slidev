import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import type { Ref } from "vue"
import { toRadian } from "@soppy-slidev/shared"

export function useRotateFit(rotate: Ref<number>) {
  const boxEl = ref<HTMLElement>()
  const fitEl = ref<HTMLElement>()
  /** true once the target's images are ready, so the container height is final */
  const ready = ref(false)
  /**
   * reactive translate offsets of the fit. the caller stacks `rotate(deg)` on
   * top of these — the rotation itself is owned outside of this composable
   */
  const offset = reactive({ x: 0, y: 0 })

  let observer: ResizeObserver | null = null

  /* =============== fit helpers =============== */
  /** back to the natural layout — no fit, no pinned container height */
  function clearFit() {
    offset.x = 0
    offset.y = 0
    const target = fitEl.value
    if (target) {
      target.style.width = ""
      target.style.height = ""
    }
    if (boxEl.value) boxEl.value.style.height = ""
  }

  function apply() {
    const box = boxEl.value
    const target = fitEl.value
    const deg = rotate.value
    if (!box || !target || !ready.value) return

    const wc = box.offsetWidth
    const hc = box.offsetHeight
    if (!wc || !hc) return

    if (!deg) {
      clearFit()
      return
    }
    const pin = `${hc}px`
    if (box.style.height !== pin) box.style.height = pin

    const rad = toRadian(deg)
    const cos = Math.cos(rad)
    const sin = Math.abs(Math.sin(rad))

    if (cos <= sin) {
      clearFit()
      return
    }

    const det = cos * cos - sin * sin
    const w = (wc * cos - hc * sin) / det
    const h = (hc * cos - wc * sin) / det
    if (w <= 0 || h <= 0) {
      clearFit()
      return
    }
    offset.x = (wc - w) / 2
    offset.y = (hc - h) / 2
    target.style.width = `${w}px`
    target.style.height = `${h}px`
  }

  /* =============== image readiness =============== */
  /**
   * wait until *every* image inside the target settles (loaded or errored);
   * a target with no image at all is ready immediately
   */
  let pending = 0

  function markReady() {
    if (--pending <= 0) ready.value = true
  }

  function checkReady() {
    const imgs = fitEl.value ? Array.from(fitEl.value.querySelectorAll("img")) : []
    pending = imgs.length
    if (pending === 0) {
      ready.value = true
      return
    }
    for (const img of imgs) {
      if (img.complete) markReady()
      else {
        img.addEventListener("load", markReady, { once: true })
        img.addEventListener("error", markReady, { once: true })
      }
    }
  }

  /* =============== lifecycle =============== */
  watch([rotate, ready], apply)

  onMounted(() => {
    observer = new ResizeObserver(apply)
    if (boxEl.value) observer.observe(boxEl.value)
    checkReady()
    apply()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    const imgs = fitEl.value?.querySelectorAll("img")
    imgs?.forEach((img) => {
      img.removeEventListener("load", markReady)
      img.removeEventListener("error", markReady)
    })
  })

  return { boxEl, fitEl, ready, offset }
}
