import { type Map as LeafletMap } from "leaflet"
import { MaptilerLayer, MapStyle } from "@maptiler/leaflet-maptilersdk"
import type { MapStyleVariant, ReferenceMapStyle } from "@maptiler/sdk"
import { TileTypes } from "./constants"

export interface LayerOptions {
  type: TileTypes
  apiKey: string
  language: string
  dark?: boolean
}

/**
 * Build a tile layer for the given type and add it to the map. The switch
 * dispatches by provider; each resolveXxxLayer builds a provider's products.
 */
export function resolveLayer(
  map: LeafletMap,
  options: LayerOptions
): InstanceType<typeof MaptilerLayer> {
  switch (options.type) {
    case TileTypes.MAPTILER_BASE:
    case TileTypes.MAPTILER_STREET:
      return resolveMaptilerLayer(map, options)
    default:
      throw new Error(`[cqupt] unsupported tile type: ${options.type}`)
  }
}

/* ==================== maptiler support ==================== */
// MapStyle ships as a value (not a type), so its members are read off typeof
type MapStyleValue = (typeof MapStyle)[keyof typeof MapStyle]

const MAPTILER_STYLE_MAP: Record<TileTypes, MapStyleValue> = {
  [TileTypes.MAPTILER_BASE]: MapStyle.BASIC,
  [TileTypes.MAPTILER_STREET]: MapStyle.STREETS,
}

function toReference(style: MapStyleValue): ReferenceMapStyle {
  return style as unknown as ReferenceMapStyle
}

/** the style for a tile product — the reference, or its DARK variant when one exists */
export function maptilerStyleFor(
  type: TileTypes,
  dark?: boolean
): ReferenceMapStyle | MapStyleVariant {
  const ref = toReference(MAPTILER_STYLE_MAP[type])
  if (dark && ref.hasVariant("DARK")) return ref.getVariant("DARK")
  return ref
}

/** whether a tile product can follow the slide's light/dark mode */
export function adaptsDarkMode(type: TileTypes): boolean {
  if (!(type in MAPTILER_STYLE_MAP)) return false
  try {
    return toReference(MAPTILER_STYLE_MAP[type]).hasVariant("DARK")
  } catch {
    return false
  }
}

function resolveMaptilerLayer(
  map: LeafletMap,
  options: LayerOptions
): InstanceType<typeof MaptilerLayer> {
  const { type, language, apiKey } = options
  const style = maptilerStyleFor(type, options.dark)

  return new MaptilerLayer({ apiKey, language, style }).addTo(map)
}
