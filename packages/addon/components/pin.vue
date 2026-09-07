<template>
  <base-decor v-bind="$attrs" kind="pin"><slot /></base-decor>
</template>

<script setup lang="ts">
defineOptions({ name: "SoppyPin", inheritAttrs: false })
</script>
