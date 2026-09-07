<template>
  <teleport to="body">
    <div v-if="!isPrintMode" class="soppy-global-top">
      <viewer ref="viewerRef" />
      <view-fly ref="flyRef" />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useNav } from "@slidev/client"
import { setViewController, useViewStore } from "./stores/view"
import { useViewAnime } from "./composables/useViewAnime"

import Viewer from "./components/viewer.vue"
import ViewFly from "./components/viewFly.vue"

const viewerRef = ref<InstanceType<typeof Viewer>>()
const flyRef = ref<InstanceType<typeof ViewFly>>()

const { isPrintMode, currentPage } = useNav()
const store = useViewStore()

const anime = useViewAnime(store, {
  viewer: () => viewerRef.value?.$el as HTMLElement | undefined,
  fly: () => flyRef.value ?? undefined,
  stage: () => viewerRef.value?.getStageEl(),
})

onMounted(() => {
  anime.setup()
  setViewController(anime)
  store.syncPage(currentPage.value)
})

// navigating closes the viewer — the origin pose on the previous slide is gone
watch(currentPage, (page) => {
  store.syncPage(page)
  anime.abort()
})
</script>
