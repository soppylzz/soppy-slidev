<template>
  <footer class="cqupt-footer" :style="rootStyle">
    <!-- custom content replaces the default info line entirely -->
    <slot>
      <div class="cqupt-footer__items">
        <div v-for="item in items" :key="item.label" class="cqupt-footer__item">
          <component :is="item.icon" class="cqupt-footer__icon" aria-hidden="true" />
          <span class="cqupt-footer__label">{{ item.label }}</span>
          <span class="cqupt-footer__value">{{ item.value }}</span>
        </div>
      </div>
      <div class="cqupt-footer__badge"><Campus variant="badge" size="large" /></div>
    </slot>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { toCssSpaceUnit, type SpaceUnit } from "@soppy-slidev/shared"
import Campus from "./campus.vue"

defineOptions({ name: "CquptFooter" })

const props = withDefaults(
  defineProps<{
    height?: SpaceUnit
    items?: { icon: string; label: string; value: string }[]
    cols?: number
  }>(),
  { height: "4rem", items: () => [], cols: 2 }
)

const rootStyle = computed<Record<string, string>>(() => ({
  height: toCssSpaceUnit(props.height),
  "--cqupt-footer-cols": `${props.cols}`,
}))
</script>
