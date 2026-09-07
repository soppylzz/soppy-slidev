<template>
  <base-decor v-bind="$attrs" kind="tape"><slot /></base-decor>
</template>

<script setup lang="ts">
defineOptions({ name: "SoppyTape", inheritAttrs: false })
</script>
