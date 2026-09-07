<template>
  <rotate v-bind="$attrs">
    <figure class="soppy-picture">
      <figcaption
        v-if="caption && position === 'top'"
        class="soppy-picture__caption"
        :style="{ marginBottom: gapCss }"
      >
        {{ caption }}
      </figcaption>
      <div class="soppy-picture__frame">
        <s-view :src="src" :title="caption" :fit="fit" :expandable="expandable" />
      </div>
      <figcaption
        v-if="caption && position !== 'top'"
        class="soppy-picture__caption"
        :style="{ marginTop: gapCss }"
      >
        {{ caption }}
      </figcaption>
    </figure>
  </rotate>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { FitType, SpaceUnit } from "@soppy-slidev/shared"
import { toCssSpaceUnit } from "@soppy-slidev/shared"

// fix: use the s-prefix to ensure the view is parsed correctly
import SView from "./view.vue"

defineOptions({ name: "SoppyPicture" })

const props = withDefaults(
  defineProps<{
    src: string
    caption?: string
    position?: "top" | "bottom"
    fit?: FitType
    gap?: SpaceUnit
    expandable?: boolean
  }>(),
  {
    position: "bottom",
    fit: "contain",
    gap: "0.5rem",
    expandable: false,
  }
)

const gapCss = computed(() => toCssSpaceUnit(props.gap))
</script>
