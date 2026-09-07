<template>
  <div
    class="slidev-layout soppy-cells"
    :class="[`soppy-cells--${direction}`, `soppy-cells--header-${position}`]"
    :style="rootStyl"
  >
    <div class="soppy-cells__header" :style="headerStyl"><slot /></div>
    <div class="soppy-cells__cells" :style="cellsStyl">
      <template v-for="name in cellNames" :key="name">
        <div class="soppy-cells__cell"><slot :name="name" /></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Position, SemiDirection, SpaceUnit } from "@soppy-slidev/shared"
import { EMPTY_OBJ, isHorizontal, toCssGridRatio, toCssSpaceUnit } from "@soppy-slidev/shared"
import { computed, useSlots } from "vue"
import { useSpaceProp } from "../composables/useStyle"

defineOptions({ name: "SoppyCells" })

const props = withDefaults(
  defineProps<{
    position?: Position
    gap?: SpaceUnit
    // applies only when position is left/right
    size?: SpaceUnit
    // cells props
    direction?: SemiDirection
    ratio?: number[]
    align?: string
    justify?: string
    cellGap?: SpaceUnit
  }>(),
  {
    position: "top",
    gap: "1rem",
    size: "20rem",
    direction: "column",
    cellGap: "0.75rem",
  }
)

const slots = useSlots()
const cellNames = computed(() =>
  Object.keys(slots)
    .filter((name) => /^\d+$/.test(name))
    .sort((a, b) => Number(a) - Number(b))
)

const rootStyl = useSpaceProp(() => props.gap, "gap")

const headerStyl = computed(() =>
  isHorizontal(props.position) ? { width: toCssSpaceUnit(props.size) } : EMPTY_OBJ
)

const cellsStyl = computed(() => {
  const style: Record<string, string | undefined> = {
    gap: toCssSpaceUnit(props.cellGap),
    justifyItems: props?.justify,
    alignItems: props?.align,
  }

  style[isHorizontal(props.position) ? "gridTemplateRows" : "gridTemplateColumns"] = toCssGridRatio(
    props.ratio
  )
  return style
})
</script>
