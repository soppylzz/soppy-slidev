<template>
  <div class="soppy-tooltip">
    <div
      ref="triggerEl"
      class="soppy-tooltip__trigger"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <slot />
    </div>
    <teleport to="body">
      <transition name="soppy-opacity">
        <div
          v-if="shown"
          ref="tipEl"
          role="tooltip"
          class="soppy-tooltip__tip"
          :class="[`soppy-tooltip__tip--${side}`, `soppy-tooltip__tip--${size}`]"
          :style="tipStyle"
          @mouseenter="cancelHide"
          @mouseleave="onLeave"
        >
          <slot name="tooltip" />
          <span class="soppy-tooltip__arrow" aria-hidden="true" />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { Position, PresetSize, SpacesGroup } from "@soppy-slidev/shared"
import { toCssSpaceGroup } from "@soppy-slidev/shared"
import { usePopover } from "../composables/usePopover"

const SHOW_DELAY = 200
const HIDE_DELAY = 150

defineOptions({ name: "SoppyTooltip" })

const props = withDefaults(
  defineProps<{
    position?: Position
    size?: PresetSize
    padding?: SpacesGroup
    // flip / clamp the placement to the viewport when it would overflow
    autoPopover?: boolean
  }>(),
  {
    position: "top",
    size: "medium",
  }
)

const { shown, side, pos, onEnter, onLeave, cancelHide, onFocusIn, onFocusOut } = usePopover({
  position: () => props.position,
  autoPopover: () => props.autoPopover,
  showDelay: SHOW_DELAY,
  hideDelay: HIDE_DELAY,
})

const tipStyle = computed(() => {
  const style: Record<string, string> = {
    "--soppy-tooltip-arrow-x": `${pos.value.ax}px`,
    "--soppy-tooltip-arrow-y": `${pos.value.ay}px`,
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
  }
  if (props.padding != null) style.padding = toCssSpaceGroup(props.padding)
  return style
})
</script>
