export type SectionOrder = false | "arabic" | "chinese"

export interface CquptConfig {
  apiKey?: string
  badge?: string
  order?: SectionOrder
  progress?: false | "bottom" | "top"
  /** scene image paths used by <Scene> for random band backgrounds */
  scene?: string[]
}

/** the cqupt theme defaults; the deck `themeConfig` overrides them key by key */
export const CQUPT_DEFAULT_CONFIG = Object.freeze<CquptConfig>({
  badge: "cqupt",
  order: false,
  progress: "bottom",
})
