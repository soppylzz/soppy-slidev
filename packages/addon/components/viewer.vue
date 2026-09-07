<template>
  <div class="soppy-viewer">
    <div class="soppy-viewer__panel">
      <header class="soppy-viewer__toolbar">
        <div class="soppy-viewer__meta">
          <p class="soppy-viewer__title">{{ store.activeView?.title }}</p>
          <p v-if="store.activeView?.details" class="soppy-viewer__details">
            {{ store.activeView.details }}
          </p>
        </div>
        <div v-if="store.activeView" class="soppy-viewer__actions">
          <span class="soppy-viewer__counter">
            {{ activeIndex + 1 }} / {{ store.currentPageViews.length }}
          </span>
          <s-button
            icon
            rounded="full"
            aria-label="Download"
            :disabled="!store.activeView"
            @click="onDownload"
          >
            <disk />
          </s-button>
          <s-button icon rounded="full" aria-label="Zoom out" @click="store.zoomActive(-1)">
            <minus />
          </s-button>
          <s-button icon rounded="full" aria-label="Zoom in" @click="store.zoomActive(1)">
            <plus />
          </s-button>
          <s-button icon rounded="full" aria-label="Close" @click="closeView">
            <xmark />
          </s-button>
        </div>
      </header>

      <div ref="stageEl" class="soppy-viewer__stage">
        <carousel
          ref="carouselRef"
          direction="row"
          :loop="store.currentPageViews.length > 1"
          :swiper="true"
          :indicator="true"
          @change="onCarouselChange"
        >
          <template
            v-for="(view, index) in store.currentPageViews"
            :key="view.id"
            #[String(index)]="{ clone }"
          >
            <viewer-item
              :item="view"
              :active="!clone && view.id === store.activeView?.id"
              :canonical="!clone"
            />
          </template>
        </carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { addonLogger } from "@soppy-slidev/shared"
import { useEventListener } from "@vueuse/core"
import { useViewStore, closeView } from "../stores/view"
import { baseDownload } from "../utils/download"

import Carousel from "./carousel.vue"
import SButton from "./button.vue"

defineOptions({ name: "SoppyViewer" })

// the flight layer measures this stage and fades this whole overlay via gsap
const stageEl = ref<HTMLElement>()
const carouselRef = ref<InstanceType<typeof Carousel>>()
const store = useViewStore()

useEventListener(window, "keydown", (e) => {
  if (e.key !== "Escape" || store.stage === "normal") return
  closeView()
})

const activeIndex = computed(() =>
  store.currentPageViews.findIndex((view) => view.id === store.activeView?.id)
)

// the carousel follows the active view whenever the viewer shows or switches
watch(
  [() => store.stage, () => store.activeView?.id],
  () => {
    if (store.stage === "normal" || activeIndex.value < 0) return
    carouselRef.value?.goTo(activeIndex.value, { animate: false })
  },
  { flush: "post" }
)

function onCarouselChange(index: number) {
  const view = store.currentPageViews[index]
  if (view && view.id !== store.activeView?.id) store.setActive(view.id)
}

defineExpose({
  getStageEl: () => stageEl.value,
})

async function onDownload() {
  const view = store.activeView
  if (!view) return
  try {
    await baseDownload(view.src, { name: view.title })
  } catch (error) {
    addonLogger.warn(error)
  }
}
</script>
