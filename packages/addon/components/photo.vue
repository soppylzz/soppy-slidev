<template>
  <rotate v-bind="$attrs">
    <figure class="soppy-photo" :class="`soppy-photo--${direction}`" :style="paperStyle">
      <div class="soppy-photo__media">
        <s-view :src="src" :title="caption" :fit="fit" :expandable="expandable" />
      </div>
      <figcaption v-if="caption" class="soppy-photo__caption">
        {{ caption }}
      </figcaption>
    </figure>
  </rotate>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { FitType, SemiDirection, SpaceUnit, SpacesGroup } from "@soppy-slidev/shared"
import { toCssSpaceGroup, toCssSpaceUnit } from "@soppy-slidev/shared"

import SView from "./view.vue"

defineOptions({ name: "SoppyPhoto" })

const props = withDefaults(
  defineProps<{
    src: string
    caption?: string
    direction?: SemiDirection
    padding?: SpacesGroup
    fit?: FitType
    gap?: SpaceUnit
    expandable?: boolean
  }>(),
  {
    direction: "column",
    padding: "1rem",
    fit: "cover",
    gap: "0.5rem",
  }
)

const paperStyle = computed(() => ({
  padding: toCssSpaceGroup(props.padding),
  gap: toCssSpaceUnit(props.gap),
}))
</script>
