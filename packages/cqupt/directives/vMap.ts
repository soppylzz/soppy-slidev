import type { Directive } from "vue"
import type { MapMakerConfig, MapMakerUtils } from "../composables/useMapMaker"

/**
 * The map's default slot content is compiled in the parent slide, not the Map
 * component, so a plain element can't `inject` the map's utils. The directive
 * instead walks the DOM from el.parentElement to find a registered container.
 */
const registry = new WeakMap<HTMLElement, MapMakerUtils>()

export function registerMapContainer(el: HTMLElement, utils: MapMakerUtils) {
  registry.set(el, utils)
}

export function unregisterMapContainer(el: HTMLElement) {
  registry.delete(el)
}

function findUtils(el: HTMLElement): MapMakerUtils | undefined {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    if (registry.has(node)) return registry.get(node)
    node = node.parentElement
  }
  return undefined
}

export const vMap: Directive<HTMLElement, MapMakerConfig> = {
  mounted(el, binding) {
    findUtils(el)?.register(el, binding.value)
  },
  updated(el, binding) {
    findUtils(el)?.register(el, binding.value)
  },
  unmounted(el) {
    findUtils(el)?.unregister(el)
  },
}
