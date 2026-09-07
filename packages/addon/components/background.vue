<template>
  <div class="soppy-background">
    <div class="soppy-background__back">
      <slot name="background">
        <div v-if="isCssValue" class="soppy-background__css" :style="cssStyl" />
        <img v-else-if="imageSrc?.length" class="soppy-background__image" :src="imageSrc" />
      </slot>
    </div>
    <div class="soppy-background__content"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { resolveAssetUrl } from "@slidev/client"

// fix: vue/multi-word-component-names
defineOptions({ name: "SoppyBackground" })
const props = defineProps<{ background?: string }>()

const backgroundValueReg =
  /^(?:none|transparent|currentColor|#[0-9a-fA-F]{3,8}|(?:repeating-)?(?:linear|radial|conic)-gradient\(|(?:rgb|rgba|hsl|hsla)\(\))$/

const isCssValue = computed(() => {
  const bg = props.background?.trim()
  if (!bg) return false

  try {
    return CSS.supports("background", bg)
  } catch {
    // CSS.supports can throw on older engines — fall back to the regex
    return backgroundValueReg.test(bg)
  }
})

const imageSrc = computed(() => (props.background ? resolveAssetUrl(props.background) : undefined))
const cssStyl = computed(() => (isCssValue.value ? { background: props.background } : undefined))
</script>
