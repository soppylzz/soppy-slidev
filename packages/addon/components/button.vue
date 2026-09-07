<template>
  <button
    type="button"
    class="soppy-button"
    :class="[
      typeClass,
      sizeClass,
      variantClass,
      `soppy-button--rounded-${rounded}`,
      { 'soppy-button--icon': icon },
    ]"
    :style="boxStyle"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { PresetColorType, PresetRounded, PresetSize, SpacePair } from "@soppy-slidev/shared"
import { isPresetSize, toCssSpacePair, EMPTY_OBJ } from "@soppy-slidev/shared"
import { computed } from "vue"

defineOptions({ name: "SoppyButton" })

const props = withDefaults(
  defineProps<{
    // preset color
    type?: PresetColorType
    // preset footprint, or a custom box: a length = equal sides, a pair = width/height
    size?: PresetSize | SpacePair
    rounded?: PresetRounded
    // appearance: default | plain | text | icon
    plain?: boolean
    text?: boolean
    icon?: boolean
  }>(),
  {
    type: "default",
    size: "medium",
    rounded: "md",
  }
)

const variantClass = computed(() => {
  if (props.text) return "soppy-button--text"
  if (props.plain) return "soppy-button--plain"
  return ""
})

const typeClass = computed(() => (props.type === "default" ? "" : `soppy-button--${props.type}`))
const sizeClass = computed(() => (!isPresetSize(props.size) ? "" : `soppy-button--${props.size}`))

const boxStyle = computed<Record<string, string>>(() => {
  const size = props.size
  if (!size || isPresetSize(size)) return EMPTY_OBJ

  const box = toCssSpacePair(size)
  // icon buttons stay square — equal sides from the width
  if (props.icon) box.height = box.width
  return box
})
</script>
