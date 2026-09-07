<template>
  <div v-if="src" class="cqupt-scene">
    <img class="cqupt-scene__img" :src="src" alt="" />
    <div v-if="merge" class="cqupt-scene__merge" :style="mergeStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { resolveAssetUrl } from "@slidev/client"
import type { Position } from "@soppy-slidev/shared"
import { useRandomScene } from "../composables/useScene"

defineOptions({ name: "CquptScene" })

const props = withDefaults(
  defineProps<{
    src?: string
    images?: string[]
    // which edge the gradient mask blends toward, and whether to blend at all
    position?: Position
    merge?: boolean
  }>(),
  { position: "bottom", merge: false }
)

const randomScene = useRandomScene(props.images)

const src = computed(() => (props.src ? resolveAssetUrl(props.src) : randomScene))

const FADE_TO: Record<Position, string> = {
  bottom: "to top",
  top: "to bottom",
  right: "to left",
  left: "to right",
}

const mergeStyle = computed(() =>
  props.merge
    ? {
        backgroundImage: `linear-gradient(${FADE_TO[props.position]}, var(--soppy-scene-bg) 40%, transparent 100%)`,
      }
    : {}
)
</script>
