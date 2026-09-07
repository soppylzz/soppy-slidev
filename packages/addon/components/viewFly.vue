<template>
  <img ref="flyEl" class="soppy-view-fly" alt="" draggable="false" />
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({ name: "SoppyViewFly" })

/**
 * the element's CSS size stays fixed at the lens size for a whole run; pose()
 * moves/scales/rotates it about its own centre
 */
const flyEl = ref<HTMLImageElement>()
const base = {
  width: 0,
  height: 0,
}

function activate(src: string, width: number, height: number) {
  const el = flyEl.value
  if (!el) return

  Object.assign(base, { width, height })
  el.src = src
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  el.style.visibility = "visible"
}

function pose(cx: number, cy: number, scale: number, deg: number, opacity: number) {
  const el = flyEl.value
  if (!el) return
  el.style.transform = `translate(${cx - base.width / 2}px, ${cy - base.height / 2}px) rotate(${deg}deg) scale(${scale})`
  el.style.opacity = String(opacity)
}

function hide() {
  const el = flyEl.value
  if (el) el.style.visibility = "hidden"
}

defineExpose({ activate, pose, hide })
</script>
