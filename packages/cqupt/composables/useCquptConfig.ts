import { inject } from "vue"
import { CQUPT_DEFAULT_CONFIG, type CquptConfig } from "../utils/config"

/**
 * slidev injects the slide context under a stable string key (the same key
 * @slidev/client's useSlideContext reads). Using inject directly keeps this
 * `.ts` file free of `@slidev/client`, whose `.ts` source breaks tsc --noEmit.
 */
const slidevContextKey = "$$slidev-context"

let cached: CquptConfig | null = null

/**
 * Read the cqupt theme's global config from frontmatter `themeConfig` over the
 * theme defaults, resolved once and cached; `VITE_API_KEY` is the apiKey default.
 */
export function useCquptConfig(): CquptConfig {
  if (cached) return cached
  const $slidev = inject<{ themeConfigs?: CquptConfig }>(slidevContextKey)
  const user = $slidev?.themeConfigs ?? {}
  const apiKey = user.apiKey ?? (import.meta.env.VITE_API_KEY as string | undefined)
  return (cached = { ...CQUPT_DEFAULT_CONFIG, ...user, apiKey })
}
