<template>
  <background v-bind="$attrs">
    <base-cells direction="column" v-bind="$attrs">
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </base-cells>
  </background>
</template>
<script lang="ts" setup>
defineOptions({ name: "SoppyCols" })
</script>
