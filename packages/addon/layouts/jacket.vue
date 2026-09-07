<template>
  <background v-bind="$attrs">
    <div class="slidev-layout soppy-jacket" :class="`soppy-jacket--${band}`">
      <div v-if="band !== 'section'" class="soppy-jacket__content"><slot /></div>
      <div class="soppy-jacket__band">
        <slot v-if="band === 'section'" />
        <slot v-else name="band" />
      </div>
    </div>
  </background>
</template>

<script lang="ts" setup>
defineOptions({ name: "SoppyJacket" })
withDefaults(defineProps<{ band?: "section" | "left" | "right" }>(), {
  band: "section",
})
</script>
