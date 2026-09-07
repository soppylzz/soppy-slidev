import type {
  SpacesGroup,
  SpacesGroupType,
  SpaceUnit,
  SpaceUnitType,
  OffsetProp,
} from "@soppy-slidev/shared"
import { toCssSpaceGroup, EMPTY_OBJ, toCssSpaceUnit, isArray } from "@soppy-slidev/shared"
import type { ComputedRef, MaybeRefOrGetter } from "vue"
import { computed, toValue } from "vue"
import { toPropSource } from "../utils/propSource"

/* ==================== style ==================== */
export function useSpaceProp(
  value: MaybeRefOrGetter<SpaceUnit | undefined>,
  type: SpaceUnitType
): ComputedRef<Record<string, any>>

export function useSpaceProp(
  value: MaybeRefOrGetter<SpacesGroup | undefined>,
  type: SpacesGroupType
): ComputedRef<Record<string, any>>

export function useSpaceProp(
  value: MaybeRefOrGetter<SpaceUnit | SpacesGroup | undefined>,
  type: SpaceUnitType | SpacesGroupType
): ComputedRef<Record<string, any>> {
  const resolveFn = ["gap", "length", "width"].includes(type) ? toCssSpaceUnit : toCssSpaceGroup
  return computed(() => {
    const raw = toValue(value)
    return raw ? { [type]: resolveFn(raw as any) } : EMPTY_OBJ
  })
}

/* ==================== class ==================== */
export function useHidden(isHidden: MaybeRefOrGetter<boolean>) {
  return computed(() => ({ "is-hidden": toValue(isHidden) }))
}

/* ==================== variable ==================== */
export function useOffset(value: MaybeRefOrGetter<OffsetProp> | { offset?: OffsetProp }) {
  const source = toPropSource(value, "offset")
  return computed(() => {
    const raw = toValue(source)
    const [x, y] = isArray(raw) ? raw : [raw, raw]

    return {
      x: toCssSpaceUnit(x),
      y: toCssSpaceUnit(y),
    }
  })
}
