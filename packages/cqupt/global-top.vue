<template>
  <Progress
    v-if="enabled"
    :position="position"
    :badge="config.badge"
    :order="config.order ?? false"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useNav } from "@slidev/client"
import Progress from "./components/progress.vue"
import { useCquptConfig } from "./composables/useCquptConfig"

// themeConfig.progress decides whether the theme's default bar renders and on
// which edge; the deck can mount <Progress> itself to take over entirely
const nav = useNav()
const config = useCquptConfig()

const enabled = computed(() => {
  if (nav.isPrintMode.value) return false
  // the /print preview route is not flagged by isPrintMode
  if (typeof window !== "undefined" && window.location.pathname.endsWith("/print")) return false
  return config.progress !== false
})
const position = computed<"top" | "bottom">(() => (config.progress === "top" ? "top" : "bottom"))
</script>
