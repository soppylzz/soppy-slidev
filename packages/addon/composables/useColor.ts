import type { ComputedRef, MaybeRefOrGetter } from "vue"
import { computed, toValue } from "vue"
import type { SoppySkeuoKind } from "@soppy-slidev/shared"
import { pickBySeed, resolveSkeuoPalette } from "@soppy-slidev/shared"
import { checkSetup } from "../utils/checkSetup"
import { toPropSource } from "../utils/propSource"

/*
 * skeuomorphic stationery color: a per-kind accent range (shared registry, so
 * a theme can reskin ranges via registerSkeuoPalette) with deterministic
 * scatter so each instance keeps a fixed pick. The `color` prop always wins.
 */

export function useSkeuoColor(
  color: MaybeRefOrGetter<string | undefined> | { color?: string },
  kind: SoppySkeuoKind = "tape"
): ComputedRef<string> {
  const instance = checkSetup("useColor")
  const source = toPropSource<string, "color">(color, "color")

  const uid = instance.uid
  return computed(() => {
    const custom = toValue(source)?.trim()
    if (custom) return custom
    const palette = resolveSkeuoPalette(kind)
    return pickBySeed(uid, palette) ?? palette[0]
  })
}
