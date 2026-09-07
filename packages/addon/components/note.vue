<template>
  <rotate v-bind="$attrs">
    <div class="soppy-note" :class="`soppy-note--${size}`" :style="noteStyle">
      <slot />
      <span
        v-for="pos in curlCorners"
        :key="pos"
        class="soppy-note__curl"
        :class="`soppy-note__curl--${pos}`"
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path class="soppy-note__curl-body" d="M 100 0 Q 34 34, 0 100 L 100 100 Z" />
          <path class="soppy-note__curl-crease" d="M 100 0 Q 34 34, 0 100" />
        </svg>
      </span>
    </div>
  </rotate>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { PresetSize, SpacesGroup } from "@soppy-slidev/shared"
import { toCssSpaceGroup } from "@soppy-slidev/shared"
import { useSkeuoColor } from "../composables/useColor"

defineOptions({ name: "SoppyNote" })

const props = withDefaults(
  defineProps<{
    color?: string
    padding?: SpacesGroup
    size?: PresetSize
    topLeft?: boolean
    topRight?: boolean
    bottomRight?: boolean
    bottomLeft?: boolean
  }>(),
  {
    padding: "1rem",
    size: "medium",
  }
)

const noteColor = useSkeuoColor(() => props.color, "note")

type CornerPosition = "top-left" | "top-right" | "bottom-right" | "bottom-left"

const curlCorners = computed<CornerPosition[]>(() => {
  const corners: CornerPosition[] = []
  if (props.topLeft) corners.push("top-left")
  if (props.topRight) corners.push("top-right")
  if (props.bottomRight) corners.push("bottom-right")
  if (props.bottomLeft) corners.push("bottom-left")
  return corners
})

// clip the paper along the crease of each curled corner so the pre-fold area shows through
const clipStyle = computed<string | null>(() => {
  const cut = new Set(curlCorners.value)
  if (!cut.size) return null

  const f = "var(--soppy-note-fold)"
  const pts = [
    ...(cut.has("top-left") ? [`${f} 0`] : ["0 0"]),
    ...(cut.has("top-right") ? [`calc(100% - ${f}) 0`, `100% ${f}`] : ["100% 0"]),
    ...(cut.has("bottom-right")
      ? [`100% calc(100% - ${f})`, `calc(100% - ${f}) 100%`]
      : ["100% 100%"]),
    ...(cut.has("bottom-left") ? [`${f} 100%`, `0 calc(100% - ${f})`] : ["0 100%"]),
    ...(cut.has("top-left") ? [`0 ${f}`] : []),
  ]
  return `polygon(${pts.join(", ")})`
})

const noteStyle = computed(() => {
  const style: Record<string, string> = {
    "--soppy-note-color": noteColor.value,
    padding: toCssSpaceGroup(props.padding),
  }
  if (clipStyle.value) style.clipPath = clipStyle.value
  return style
})
</script>
