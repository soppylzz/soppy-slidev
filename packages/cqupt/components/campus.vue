<template>
  <img
    v-if="src"
    class="cqupt-campus"
    :class="[`cqupt-campus--${variant}`, `cqupt-campus--${size}`]"
    :src="src"
    alt=""
  />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { resolveAssetUrl } from "@slidev/client"
import type { PresetSize } from "@soppy-slidev/shared"
import { CAMPUS_PRESETS, isPresetCampus, type CampusPreset } from "../utils/campus"

defineOptions({ name: "CquptCampus" })

const props = withDefaults(
  defineProps<{
    preset?: CampusPreset
    variant?: "logo" | "badge"
    logo?: string
    badge?: string
    size?: PresetSize
  }>(),
  { preset: "cqupt", variant: "logo", size: "medium" }
)

// a custom url wins over the preset; `variant` picks which of the pair is shown
const src = computed(() => {
  const custom = props.variant === "badge" ? props.badge : props.logo
  if (custom) return resolveAssetUrl(custom)
  if (!isPresetCampus(props.preset)) return undefined
  return CAMPUS_PRESETS[props.preset][props.variant]
})
</script>
