import { computed, reactive, ref } from "vue"
import { defineStore } from "pinia"

export interface ViewItem {
  id: number
  page: number
  src: string
  title?: string
  details?: string
}

export type ViewRegisterMeta = Omit<ViewItem, "id" | "page">
export type ViewStage = "normal" | "preview" | "animate"

/* ==================== non-reactive ==================== */
/**
 * two DOM registries keyed by the same view uid — the slide origin and the
 * fullscreen target — so the flight layer can read both endpoints live
 */
export interface ViewSource {
  el: HTMLImageElement
  rotate: number
}

export interface ViewTarget {
  el: HTMLImageElement
  zoomBy(delta: number): void
  reset(): void
}

const origins = new Map<number, ViewSource>()
const targets = new Map<number, ViewTarget>()

export function getOrigin(uid: number): ViewSource | undefined {
  return origins.get(uid)
}

export function getTarget(uid: number): ViewTarget | undefined {
  return targets.get(uid)
}

export function forEachOrigin(cb: (uid: number, origin: ViewSource) => void) {
  for (const [uid, origin] of origins) cb(uid, origin)
}

/**
 * one-way door for components: the flight choreographer registers here, so a
 * <View> click or the viewer close button can act without importing it
 */
export interface ViewerController {
  open(id: number): void
  close(): void
}

let controller: ViewerController | null = null

export function setViewController(next: ViewerController | null) {
  controller = next
}

export function openView(id: number) {
  controller?.open(id)
}

export function closeView() {
  controller?.close()
}

export function registerTarget(uid: number, target: ViewTarget) {
  targets.set(uid, target)
}

export function unregisterTarget(uid: number) {
  targets.delete(uid)
}

/* ==================== pinia ==================== */
export const useViewStore = defineStore("soppy-view", () => {
  const _views = reactive(new Map<number, ViewItem>())
  const _currentPage = ref(1)
  const activeId = ref(-1)

  const stage = ref<ViewStage>("normal")
  const activeView = computed(() => _views.get(activeId.value))
  const currentPageViews = computed(() =>
    Array.from(_views.values()).filter((view) => view.page === _currentPage.value)
  )

  function register(view: ViewItem, source?: ViewSource) {
    // map.set keeps position -> re-register keeps carousel order
    _views.set(view.id, view)
    if (source) origins.set(view.id, source)
  }

  function unregister(uid: number) {
    _views.delete(uid)
    origins.delete(uid)
  }

  function setActive(id: number) {
    activeId.value = id
  }

  function setStage(next: ViewStage) {
    stage.value = next
  }

  // toolbar zoom targets the current fullscreen view through the target registry
  function zoomActive(delta: number) {
    getTarget(activeId.value)?.zoomBy(delta)
  }

  function syncPage(page: number) {
    _currentPage.value = page
  }

  return {
    stage,
    activeId,
    activeView,
    currentPageViews,
    register,
    unregister,
    setActive,
    setStage,
    zoomActive,
    syncPage,
  }
})
