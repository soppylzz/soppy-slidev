<template>
  <div class="cqupt-overview">
    <button
      v-for="(sec, i) in store.sections"
      :key="sec.startNo"
      type="button"
      class="cqupt-overview__item"
      :class="{ 'cqupt-overview__item--active': i === store.activeSection }"
      @click="nav.go(sec.startNo)"
    >
      <span v-if="order" class="cqupt-overview__num">{{ orderLabel(i) }}</span>
      <span class="cqupt-overview__title">{{ sec.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { useNav } from "@slidev/client"
import { useSectionStore } from "../stores/section"
import { useCquptConfig } from "../composables/useCquptConfig"
import { arabicToChinese } from "../utils/arabicToChinese"

defineOptions({ name: "CquptOverview" })

const config = useCquptConfig()
const order = computed(() => config.order)

const store = useSectionStore()
const nav = useNav()

function orderLabel(i: number): string {
  const n = i + 1
  if (order.value === "arabic") return `${n}.`
  return `${arabicToChinese(n)}.`
}
watch([nav.currentSlideNo, nav.clicks], ([no, c]) => store.update(no, c))

onMounted(() => {
  if (!store.ready) store.build(nav.slides.value)
  store.update(nav.currentSlideNo.value, nav.clicks.value)
})
</script>
