<template>
  <div
    ref="stageEl"
    class="soppy-viewer-item"
    :class="{ 'soppy-viewer-item--zoomed': scale > 1 }"
    :style="{ touchAction: scale > 1 ? 'none' : 'pan-y' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <img
      ref="imgEl"
      class="soppy-viewer-item__img"
      :src="item.src"
      :alt="item.title ?? ''"
      draggable="false"
      :style="imgStyl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useElementSize } from "@vueuse/core"
import { registerTarget, unregisterTarget, type ViewItem } from "../stores/view"

defineOptions({ name: "SoppyViewerItem" })

const props = withDefaults(
  defineProps<{
    item: ViewItem
    active?: boolean
    // false for the carousel loop clones — only the real copy registers its target
    canonical?: boolean
  }>(),
  {
    active: false,
    canonical: true,
  }
)

const MAX_SCALE = 4
const ZOOM_STEP = 1.25

const stageEl = ref<HTMLElement>()
const imgEl = ref<HTMLImageElement>()

/**
 * content size at scale 1 (the img's layout box, unaffected by the transform) —
 * reactive, so img load and container resize re-measure automatically
 */
const { width: contentW, height: contentH } = useElementSize(imgEl)

const scale = ref(1)
const tx = ref(0)
const ty = ref(0)

let panning = false
let lastX = 0
let lastY = 0

const imgStyl = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
}))

/* ==================== zoom ==================== */
// single-axis pan/zoom math — kept local until a second consumer appears
function overflowHalf(size: number, axis: number, scale: number) {
  return Math.max(0, (size * scale - axis) / 2)
}

function clampPan(pan: number, size: number, axis: number, scale: number) {
  const bound = overflowHalf(size, axis, scale)
  return Math.max(-bound, Math.min(bound, pan))
}

function anchorPan(pan: number, point: number, axis: number, k: number) {
  const centre = axis / 2
  return point - centre - k * (point - centre - pan)
}

// scaling is anchored to the stage centre (content is centred at scale 1)
function setScale(next: number, anchor?: { x: number; y: number }) {
  const target = Math.max(1, Math.min(MAX_SCALE, next))
  const stage = stageEl.value
  if (!stage) return
  if (target === 1) {
    reset()
    return
  }
  const rect = stage.getBoundingClientRect()
  const k = target / scale.value
  const cx = rect.width / 2
  const cy = rect.height / 2
  const ax = anchor?.x ?? cx
  const ay = anchor?.y ?? cy
  // keep the point under the anchor fixed while the scale changes
  tx.value = clampPan(anchorPan(tx.value, ax, rect.width, k), contentW.value, rect.width, target)
  ty.value = clampPan(anchorPan(ty.value, ay, rect.height, k), contentH.value, rect.height, target)
  scale.value = target
}

function reset() {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}

function zoomBy(delta: number) {
  setScale(scale.value * (delta > 0 ? ZOOM_STEP : 1 / ZOOM_STEP))
}

function onWheel(e: WheelEvent) {
  const rect = stageEl.value?.getBoundingClientRect()
  if (!rect) return
  setScale(scale.value * (e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP), {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  })
}

/* ==================== pointer pan ==================== */
/**
 * pan only when zoomed; at scale 1 the pointer passes through so the carousel
 * underneath can swipe to switch items
 */
function onPointerDown(e: PointerEvent) {
  if (scale.value <= 1) return
  panning = true
  lastX = e.clientX
  lastY = e.clientY
  e.stopPropagation()
  stageEl.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!panning) return
  const rect = stageEl.value?.getBoundingClientRect()
  if (!rect) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  tx.value = clampPan(tx.value + dx, contentW.value, rect.width, scale.value)
  ty.value = clampPan(ty.value + dy, contentH.value, rect.height, scale.value)
  e.stopPropagation()
}

function onPointerUp(e: PointerEvent) {
  panning = false
  if (scale.value > 1) e.stopPropagation()
}

/* ==================== lifecycle ==================== */
watch(
  () => props.active,
  (active) => {
    if (active) reset()
  }
)

onMounted(() => {
  if (props.canonical) {
    const el = imgEl.value
    if (el) registerTarget(props.item.id, { el, zoomBy, reset })
  }
})

onBeforeUnmount(() => {
  if (props.canonical) unregisterTarget(props.item.id)
})
</script>
