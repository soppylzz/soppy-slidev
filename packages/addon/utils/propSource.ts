import { hasOwn, isObject } from "@soppy-slidev/shared"
import type { MaybeRefOrGetter } from "vue"

export function toPropSource<T, K extends string>(
  source: MaybeRefOrGetter<T | undefined> | { [P in K]?: T },
  field: K
): MaybeRefOrGetter<T | undefined> {
  if (isObject(source) && hasOwn(source, field)) {
    const props = source as { [P in K]?: T }
    return () => props[field]
  }
  return source as MaybeRefOrGetter<T | undefined>
}
