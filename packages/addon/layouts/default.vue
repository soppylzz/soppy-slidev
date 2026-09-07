<template>
  <background v-bind="$attrs">
    <div class="slidev-layout soppy-default"><slot /></div>
  </background>
</template>
<script setup lang="ts">
defineOptions({ name: "SoppyDefault" })
</script>
