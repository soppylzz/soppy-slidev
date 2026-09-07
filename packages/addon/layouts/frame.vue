<template>
  <background v-bind="$attrs">
    <div class="slidev-layout soppy-frame" :class="`soppy-frame--${position}`" :style="rootStyl">
      <div class="soppy-frame__main" :style="mainStyl"><slot /></div>
      <div class="soppy-frame__media" :style="mediaStyl"><slot name="media" /></div>
    </div>
  </background>
</template>

<script lang="ts" setup>
import type { Position, SpaceUnit, SpacesGroup } from "@soppy-slidev/shared"
import { isHorizontal, toCssGridRatio, toCssSpaceUnit } from "@soppy-slidev/shared"
import { useSpaceProp } from "../composables/useStyle"
import { computed, toRef } from "vue"

defineOptions({ name: "SoppyFrame" })

const props = withDefaults(
  defineProps<{
    position?: Position
    gap?: SpaceUnit
    ratio?: [number, number]
    // main & media props
    mainPadding?: SpacesGroup
    mediaPadding?: SpacesGroup
  }>(),
  {
    position: "right",
    // array default must be a factory — each instance needs its own array
    ratio: () => [1, 1],
    gap: "0rem",
    mainPadding: undefined,
  }
)

// usually getter is better
const mainStyl = useSpaceProp(toRef(props, "mainPadding"), "padding")
const mediaStyl = useSpaceProp(toRef(props, "mediaPadding"), "padding")

const rootStyl = computed(() => {
  const style: Record<string, string> = { gap: toCssSpaceUnit(props.gap) }
  style[isHorizontal(props.position) ? "gridTemplateColumns" : "gridTemplateRows"] = toCssGridRatio(
    props.ratio
  )
  return style
})
</script>
