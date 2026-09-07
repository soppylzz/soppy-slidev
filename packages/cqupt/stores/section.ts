import { ref } from "vue"
import { defineStore } from "pinia"
import type { SlideRoute } from "@slidev/types"

export interface DeckSection {
  name: string
  startNo: number
  endNo: number
}

/**
 * Section / progress state for the cqupt chrome (Progress bar, Overview TOC),
 * fed from the deck's slide frontmatter: `section` opens a section; `clicks`
 * splits a slide into extra progress units. The theme's setup installs pinia
 * when none is present, so both components may call useSectionStore freely.
 */
export const useSectionStore = defineStore("cqupt-section", () => {
  const ready = ref(false)
  const sections = ref<DeckSection[]>([])
  const slideUnits = ref<number[]>([])
  const unitsBefore = ref<number[]>([])
  const total = ref(0)
  const current = ref(0)
  const activeSection = ref(-1)

  /** Build the section list and the per-slide progress units from all slides. */
  function build(slides: SlideRoute[]) {
    const secs: DeckSection[] = []
    const units: number[] = []
    const before: number[] = []
    let acc = 0
    let open: DeckSection | null = null
    for (let i = 0; i < slides.length; i++) {
      const no = i + 1
      // vue-router's RouteMeta is an open interface, so read the slide meta
      // through a local cast instead of relying on slidev's declaration
      const fm =
        (slides[i].meta.slide as { frontmatter?: Record<string, unknown> } | undefined)
          ?.frontmatter ?? {}
      const name = fm.section as string | undefined
      const clicks = Number(fm.clicks as number | string | undefined) || 0
      if (name) {
        if (open) open.endNo = no - 1
        open = { name, startNo: no, endNo: slides.length }
        secs.push(open)
      }
      units.push(1 + clicks)
      before.push(acc)
      acc += units[units.length - 1]
    }
    sections.value = secs
    slideUnits.value = units
    unitsBefore.value = before
    total.value = acc
    ready.value = true
  }

  /**
   * Advance the current progress position and active section. A slide counts as
   * 1 + its `clicks` units; the current click step inside the slide adds more.
   */
  function update(pageNo: number, clicks: number) {
    const i = pageNo - 1
    if (i < 0 || i >= slideUnits.value.length) return
    current.value = unitsBefore.value[i] + 1 + Math.min(clicks, slideUnits.value[i] - 1)
    activeSection.value = sections.value.findIndex((s) => pageNo >= s.startNo && pageNo <= s.endNo)
  }

  return { ready, sections, slideUnits, unitsBefore, total, current, activeSection, build, update }
})
