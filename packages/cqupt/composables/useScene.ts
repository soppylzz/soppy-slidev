import { getCurrentInstance } from "vue"
import { resolveAssetUrl } from "@slidev/client"
import { pickBySeed } from "@soppy-slidev/shared"
import { useCquptConfig } from "./useCquptConfig"

// bundled default scenes live under assets/cqupt; user lists override them
const SCENE_GLOB = import.meta.glob<string>("../assets/cqupt/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
})
const DEFAULT_SCENES = Object.values(SCENE_GLOB)

/**
 * A scene image for the caller: an explicit `images` list wins, then
 * `themeConfig.scene` — both are deck paths resolved via `resolveAssetUrl` —
 * otherwise a deterministic per-instance pick (uid scatter) from the theme's
 * bundled `assets/cqupt` scenes. Empty when no scenes are available.
 */
export function useRandomScene(images?: string[]): string {
  const config = useCquptConfig()
  const sources = images?.length ? images : config.scene
  const userPool = (sources ?? []).map((path) => resolveAssetUrl(path)).filter(Boolean)
  const pool = userPool.length ? userPool : DEFAULT_SCENES
  const uid = getCurrentInstance()?.uid ?? 0
  return pool.length ? (pickBySeed(uid, pool) ?? "") : ""
}
