import { inject } from "vue"
import type { InjectionKey } from "vue"

export interface MapMakerConfig {
  lat: number
  lon: number
  /** zoom band [min, max] within which the marker shows; unset = always visible */
  range?: [number, number]
}

export interface MapMakerUtils {
  register(el: HTMLElement, config: MapMakerConfig): void
  unregister(el: HTMLElement): void
}

export const mapMakerKey: InjectionKey<MapMakerUtils> = Symbol("cqupt-map-maker")

/**
 * Access the map's marker registration tools. For child components rendered
 * inside <Map> (not via its default slot, whose content is compiled in the
 * parent scope).
 */
export function useMapMaker(): MapMakerUtils {
  const utils = inject(mapMakerKey)
  if (!utils) throw new Error("[cqupt] useMapMaker must be used inside a <Map> component")
  return utils
}
