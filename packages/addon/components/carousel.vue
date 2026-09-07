<template>
  <div class="soppy-carousel" :class="`soppy-carousel--${direction}`">
    <div
      ref="viewportEl"
      class="soppy-carousel__viewport"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
    >
      <div ref="trackEl" class="soppy-carousel__track">
        <div
          v-for="(name, trackIndex) in trackItems"
          :key="trackIndex"
          class="soppy-carousel__item"
        >
          <slot :name="name" :clone="isCloneTrack(trackIndex)" />
        </div>
      </div>

      <s-button
        v-if="swiper && itemCount > 1"
        text
        icon
        size="small"
        rounded="full"
        aria-label="previous"
        class="soppy-carousel__swiper soppy-carousel__swiper--prev"
        @click="prev"
      >
        <chevron :position="isHorizon ? 'left' : 'top'" />
      </s-button>
      <s-button
        v-if="swiper && itemCount > 1"
        text
        icon
        size="small"
        rounded="full"
        aria-label="next"
        class="soppy-carousel__swiper soppy-carousel__swiper--next"
        @click="next"
      >
        <chevron :position="isHorizon ? 'right' : 'bottom'" />
      </s-button>

      <div
        v-if="indicator && itemCount > 1"
        class="soppy-carousel__indicator"
        :class="`soppy-carousel__indicator--${indicatorAlign}`"
      >
        <button
          v-for="i in itemCount"
          :key="i"
          type="button"
          class="soppy-carousel__dot"
          :class="{ 'soppy-carousel__dot--active': i - 1 === currentIndex }"
          :aria-label="`go to item ${i - 1}`"
          @click="goTo(i - 1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SemiDirection } from "@soppy-slidev/shared"
import { easeInOutCubic, isHorizontal } from "@soppy-slidev/shared"
import { useSlots, ref, unref, onMounted, onUpdated, computed, watch, onBeforeUnmount } from "vue"
import { useEventListener, useIntervalFn, usePointerSwipe } from "@vueuse/core"
import { useSlideContext } from "@slidev/client"

import SButton from "./button.vue"

defineOptions({ name: "SoppyCarousel" })
const props = withDefaults(
  defineProps<{
    // play configuration
    loop?: boolean
    autoplay?: boolean
    interval?: number
    direction?: SemiDirection
    // ui configuration
    swiper?: boolean
    indicator?: boolean
    indicatorAlign?: "start" | "end"
  }>(),
  {
    interval: 3000,
    direction: "row",
    indicatorAlign: "end",
  }
)

const emit = defineEmits<{ (e: "change", index: number): void }>()
const slots = useSlots()

const viewportEl = ref<HTMLElement>()
const trackEl = ref<HTMLElement>()

/* ==================== misc ==================== */
const { $page, $nav } = useSlideContext()
const isCurrentPage = computed(() => {
  const page = unref($page)
  const nav = unref($nav)
  return !page || !nav?.currentPage || nav.currentPage === page
})

const isHorizon = computed(() => isHorizontal(props.direction))

/* ==================== items & track ==================== */
const itemNames = ref<string[]>([])
function refreshItems() {
  const next = Object.keys(slots)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
  const prev = itemNames.value

  if (next.length !== prev.length || next.some((key, i) => key !== prev[i])) {
    itemNames.value = next
  }
}

onMounted(refreshItems)
onUpdated(refreshItems)
const itemCount = computed(() => itemNames.value.length)

const LOOP_COPIES = 3

const trackItems = computed(() => {
  const count = itemCount.value
  if (!props.loop || count < 2) return itemNames.value
  return Array.from({ length: count * LOOP_COPIES }, (_, j) => itemNames.value[j % count])
})

const trackOffset = computed(() => (props.loop && itemCount.value > 1 ? itemCount.value : 0))

function isCloneTrack(trackIdx: number) {
  if (!props.loop || itemCount.value < 2) return false
  return trackIdx < trackOffset.value || trackIdx >= trackOffset.value + itemCount.value
}

/* ==================== offset & transform ==================== */
function clampOffset(raw: number) {
  const count = itemCount.value
  if (count < 1) return 0
  return Math.max(0, Math.min(count - 1, raw))
}

const pos = ref(0)
const offset = computed<number>({
  get: () => pos.value,
  set: (val) => {
    /**
     * loop: anchor pos into the real (middle) copy range — congruent positions
     * render identical content on the cloned track, so this is visually seamless
     * !loop: clamp to the real item range
     */
    pos.value = props.loop ? reAnchor(val) : clampOffset(val)
    updateTransform()
  },
})

const dragging = ref(false)

let pendingWrite = false
function updateTransform() {
  if (dragging.value) {
    if (pendingWrite) return
    pendingWrite = true

    requestAnimationFrame(() => {
      pendingWrite = false
      updateNow()
    })
    return
  }
  updateNow()
}

function updateNow() {
  const el = trackEl.value
  if (!el) return

  el.style.transition = "none"
  el.style.transform = transformFor(pos.value)
}

function transformFor(p: number): string {
  const px = -p * itemSize.value
  return props.direction === "row" ? `translate3d(${px}px, 0, 0)` : `translate3d(0, ${px}px, 0)`
}

const itemSize = ref(1)
function measureItemSize() {
  const item = trackEl.value?.firstElementChild as HTMLElement | undefined
  const size = item
    ? props.direction === "row"
      ? parseFloat(getComputedStyle(item).width)
      : parseFloat(getComputedStyle(item).height)
    : 1
  itemSize.value = Number.isFinite(size) && size > 0 ? size : 1
}

function posToIndex(p: number) {
  const count = itemCount.value
  if (count === 0) return 0
  const rounded = Math.round(p)
  if (!props.loop) return Math.max(0, Math.min(count - 1, rounded))
  return (((rounded - trackOffset.value) % count) + count) % count
}
function indexToPos(idx: number) {
  return idx + trackOffset.value
}

const currentIndex = computed(() => posToIndex(offset.value))

function reAnchor(p: number): number {
  const count = itemCount.value
  if (!props.loop || count < 2) return p
  return ((((p - trackOffset.value) % count) + count) % count) + trackOffset.value
}

/* ==================== animation ==================== */
let radId = 0
let currentResolve: (() => void) | null = null

const Duration = {
  MAX: 600,
  MIN: 300,
  SCALE: 100,
}

function cancel() {
  if (currentResolve) {
    currentResolve()
    currentResolve = null
    cancelAnimationFrame(radId)
  }
}

function animateTo(target: number): Promise<void> {
  cancel()

  return new Promise((resolve) => {
    const from = offset.value
    const dist = target - from

    if (dist === 0) {
      resolve()
      return
    }

    const duration = Math.max(Duration.MIN, Math.min(Duration.MAX, Math.abs(dist) * Duration.SCALE))
    const start = performance.now()
    currentResolve = resolve

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      offset.value = from + dist * easeInOutCubic(t)
      if (t < 1) {
        radId = requestAnimationFrame(step)
      } else {
        cancel()
        /**
         * change reports the item the carousel arrived on — the viewer switches
         * its active view from this
         */
        emit("change", posToIndex(target))
      }
    }

    radId = requestAnimationFrame(step)
  })
}

/* ==================== navigation ==================== */
function wrapTarget(fromPos: number, index: number): number {
  const count = itemCount.value
  const base = indexToPos(index)
  return base + Math.round((fromPos - base) / count) * count
}

function goTo(target: number, options?: { animate?: boolean }) {
  const { animate = true } = options ?? {}

  const count = itemCount.value
  if (count < 2) return

  const index = props.loop
    ? ((target % count) + count) % count
    : Math.max(0, Math.min(count - 1, target))

  if (!animate) {
    cancel()
    offset.value = indexToPos(index)
    emit("change", index)
    return
  }

  if (!props.loop) {
    animateTo(index)
    return
  }

  const fromPos = offset.value
  if (index === posToIndex(fromPos)) {
    emit("change", index)
    return
  }

  animateTo(wrapTarget(offset.value, index))
}
function prev() {
  goTo(posToIndex(offset.value - 1))
}
function next() {
  goTo(posToIndex(offset.value + 1))
}

function getIndex() {
  return currentIndex.value
}

/* ==================== drag & swipe ==================== */
let dragStartOffset = 0
/**
 * pointer is down but hasn't exceeded the swipe threshold yet;
 * a plain click (e.g. on prev/next buttons inside the viewport) must NOT interrupt the animation
 */
let dragArmed = false
/**
 * gesture's dominant axis is not the carousel axis — ignore it and let it bubble
 * so Slidev's page-level swipe navigation still handles cross-axis gestures
 */
let dragAxisRejected = false

const {
  distanceX,
  distanceY,
  stop: stopPointerSwipe,
} = usePointerSwipe(viewportEl, {
  threshold: 5,
  disableTextSelect: true,
  onSwipeStart() {
    if (itemCount.value < 2) return
    dragArmed = true
  },
  onSwipe() {
    // onSwipe only fires after the threshold is exceeded — a real drag starts here
    if (!dragArmed) return
    if (!dragging.value && !dragAxisRejected) {
      // axis lock: only engage on the carousel's own axis
      const gestureIsRow = Math.abs(distanceX.value) >= Math.abs(distanceY.value)
      if (gestureIsRow !== isHorizon.value) {
        dragAxisRejected = true
        return
      }
      dragging.value = true
      dragStartOffset = offset.value
      cancel()
      syncAutoPlay()
    }
    if (!dragging.value) return
    const distance = props.direction === "row" ? distanceX.value : distanceY.value
    offset.value = dragStartOffset + distance / itemSize.value
  },
  onSwipeEnd: onDragEnd,
})

/**
 * while the carousel consumes a drag, stop pointermove from bubbling to the page
 * root — Slidev's usePointerSwipe (touch swipe navigation, threshold 50) must not
 * see these moves or its onSwipeEnd would also navigate the slide
 */
useEventListener(viewportEl, "pointermove", (e) => {
  if (dragging.value) e.stopPropagation()
})

useEventListener(window, "pointerup", onDragEnd)
useEventListener(window, "pointercancel", onDragEnd)

function settle() {
  const pos = offset.value
  const rounded = Math.round(pos)
  if (rounded !== pos) {
    animateTo(rounded)
  } else {
    // offset setter already anchors pos
    emit("change", currentIndex.value)
  }
}

function onDragEnd() {
  dragArmed = false
  dragAxisRejected = false
  if (!dragging.value) return
  dragging.value = false
  settle()
  syncAutoPlay()
}

/* ==================== autoplay ==================== */

const hovered = ref(false)
const { pause, resume } = useIntervalFn(
  () => {
    if (!dragging.value) next()
  },
  props.interval,
  { immediate: false }
)

function onPointerEnter() {
  hovered.value = true
  syncAutoPlay()
}

function onPointerLeave() {
  hovered.value = false
  syncAutoPlay()
}

function syncAutoPlay() {
  if (!props.autoplay || hovered.value || dragging.value || !isCurrentPage.value) {
    pause()
  } else {
    resume()
  }
}

/* ==================== lifecycle ==================== */
watch(itemCount, () => {
  // offset setter re-anchors with the new itemCount
  // eslint-disable-next-line no-self-assign
  offset.value = offset.value
})

watch(() => $nav.value.currentPage, syncAutoPlay)
watch(() => props.autoplay, syncAutoPlay)

onMounted(() => {
  measureItemSize()
  const el = viewportEl.value
  // usePointerSwipe hardcodes pan-y; vertical carousels need the other axis
  if (el) el.style.touchAction = props.direction === "row" ? "pan-y" : "pan-x"
  offset.value = trackOffset.value

  syncAutoPlay()

  const ro = new ResizeObserver(() => {
    measureItemSize()
    // trigger custom computed ref update
    // eslint-disable-next-line no-self-assign
    offset.value = offset.value
  })
  if (el) ro.observe(el)
  onBeforeUnmount(() => ro.disconnect())
})

onBeforeUnmount(() => {
  cancel()
  stopPointerSwipe()
})

defineExpose({ prev, next, goTo, getIndex })
</script>
