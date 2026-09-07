<template>
  <div ref="boxEl" class="soppy-view__box">
    <img
      ref="imgEl"
      class="soppy-view"
      :src="src"
      :alt="title ?? ''"
      draggable="false"
      @load="applyFit"
      @click="onClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { FitType } from "@soppy-slidev/shared"
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useView } from "../composables/useView"
import { useViewStore, openView } from "../stores/view"
import { computeFit } from "../utils/rect"

defineOptions({ name: "SoppyView" })

const props = withDefaults(
  defineProps<{
    src: string
    title?: string
    details?: string
    fit?: FitType
    expandable?: boolean
  }>(),
  {
    fit: "contain",
    expandable: false,
  }
)

const { uid, imgEl } = useView(props, () => props.expandable)
const store = useViewStore()

function onClick(e: MouseEvent) {
  if (!props.expandable) return
  e.stopPropagation()
  if (store.stage === "normal") openView(uid)
}

/* ==================== fit ==================== */
const boxEl = ref<HTMLElement>()
let observer: ResizeObserver | null = null

function applyFit() {
  const box = boxEl.value
  const img = imgEl.value
  if (!box || !img) return

  const bw = box.clientWidth
  const bh = box.clientHeight
  if (!bw || !bh) return

  const size = computeFit(
    { width: bw, height: bh },
    { width: img.naturalWidth, height: img.naturalHeight },
    props.fit
  )
  if (!(size.width > 0) || !(size.height > 0)) return

  img.style.width = `${size.width}px`
  img.style.height = `${size.height}px`
}

onMounted(() => {
  if (boxEl.value) {
    observer = new ResizeObserver(applyFit)
    observer.observe(boxEl.value)
  }
  applyFit()
})

watch(() => props.fit, applyFit, { flush: "post" })

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
