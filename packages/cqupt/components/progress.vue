<template>
  <div
    v-if="!slideHidden"
    class="cqupt-progress"
    :class="position === 'top' ? 'cqupt-progress--top' : 'cqupt-progress--bottom'"
    :style="{ height: heightCss }"
  >
    <div class="cqupt-progress__main">
      <div class="cqupt-progress__badge">
        <slot name="badge">
          <Campus v-if="presetBadge" variant="badge" />
          <span v-else>{{ badge }}</span>
        </slot>
      </div>
      <div ref="sectionsEl" class="cqupt-progress__sections">
        <button
          v-for="(sec, i) in store.sections"
          :key="sec.startNo"
          type="button"
          class="cqupt-progress__item"
          :class="{ 'cqupt-progress__item--active': i === store.activeSection }"
          @click="nav.go(sec.startNo)"
        >
          <span v-if="order" class="cqupt-progress__num">{{ sectionNum(i) }}</span>
          <span class="cqupt-progress__name">{{ sec.name }}</span>
        </button>
      </div>
    </div>
    <div class="cqupt-progress__bar" :class="{ 'cqupt-progress__bar--top': position === 'top' }">
      <div class="cqupt-progress__bar-inner" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useNav } from "@slidev/client"
import { toCssSpaceUnit, type SpaceUnit } from "@soppy-slidev/shared"
import Campus from "./campus.vue"
import { isPresetCampus } from "../utils/campus"
import type { SectionOrder } from "../utils/config"
import { useSectionStore } from "../stores/section"
import { arabicToChinese } from "../utils/arabicToChinese"

defineOptions({ name: "CquptProgress" })

const props = withDefaults(
  defineProps<{
    position?: "top" | "bottom"
    height?: SpaceUnit
    badge?: string
    order?: SectionOrder
  }>(),
  { position: "bottom", height: "4rem", badge: "CQUPT", order: false }
)

const store = useSectionStore()
const nav = useNav()

const heightCss = computed(() => toCssSpaceUnit(props.height))
const presetBadge = computed(() => isPresetCampus(props.badge))

const percent = computed(() => (store.total ? (store.current / store.total) * 100 : 0))

// a slide may opt out of the bar for itself via frontmatter `progress: false`
const slideHidden = computed(() => {
  const fm = (nav as { currentFrontmatter?: { value?: unknown } }).currentFrontmatter?.value as
    { progress?: unknown } | undefined
  return fm?.progress === false
})

function sectionNum(i: number): string {
  const n = i + 1
  if (props.order === "arabic") return `${n}.`
  if (props.order === "chinese") return `${arabicToChinese(n)}.`
  return ""
}

/* ==================== layout extra pad ==================== */
// claim the bar's edge through the addon layout pads: the anchored side gets an
// extra pad equal to the bar height so slide content clears it. Set inline on
// <html> because the pads are consumed by .slidev-layout further down the tree.
function applyRootState() {
  const html = document.documentElement
  const height = toCssSpaceUnit(props.height)
  const atTop = props.position === "top"
  html.style.setProperty("--soppy-top-extra-pad", atTop ? height : "0rem")
  html.style.setProperty("--soppy-bottom-extra-pad", atTop ? "0rem" : height)
}

function clearRootState() {
  document.documentElement.style.removeProperty("--soppy-top-extra-pad")
  document.documentElement.style.removeProperty("--soppy-bottom-extra-pad")
}

/* ==================== sections scroll-to-active ==================== */
// when the active section changes, bring its item to the container's front
// (clamped to the max scroll, so a trailing item scrolls as far as it can)
const sectionsEl = ref<HTMLElement>()
watch(
  () => store.activeSection,
  (idx, prev) => {
    if (idx < 0 || idx === prev) return
    const el = sectionsEl.value
    if (!el) return
    const item = el.querySelectorAll<HTMLElement>(".cqupt-progress__item")[idx]
    if (!item) return
    const target = Math.min(item.offsetLeft, el.scrollWidth - el.clientWidth)
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
  }
)

watch([nav.currentSlideNo, nav.clicks], ([no, c]) => store.update(no, c))
watch([() => props.position, () => props.height], applyRootState)

onMounted(() => {
  store.build(nav.slides.value)
  store.update(nav.currentSlideNo.value, nav.clicks.value)
  applyRootState()
})

onBeforeUnmount(clearRootState)
</script>
