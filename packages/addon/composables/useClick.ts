import type { SoppyClick } from "@soppy-slidev/shared"
import { sharedLogger } from "@soppy-slidev/shared"
import type { ClicksContext, ClicksInfo } from "@slidev/types"
import { useNav, useSlideContext } from "@slidev/client"
import type { ComputedRef, MaybeRefOrGetter } from "vue"
import { computed, hasInjectionContext, onBeforeUnmount, onMounted, ref, toValue } from "vue"
import { toPropSource } from "../utils/propSource"

let seq = 0

function toClickAt(spec?: SoppyClick): number | [number, number] | null {
  if (spec == null) return null

  const parse = (part: unknown): number | null => {
    if (typeof part === "number") return Number.isInteger(part) ? part : null
    const text = String(part).trim()
    return /^\d+$/.test(text) ? +text : null
  }

  if (typeof spec === "number" || /^\d+$/.test(String(spec).trim())) {
    const step = parse(spec)
    return step == null ? null : step
  }

  if (Array.isArray(spec)) {
    if (spec.length === 2) {
      const [from, to] = spec
      if (parse(from) != null && parse(to) != null) return [parse(from)!, parse(to)!]
    }
  } else if (typeof spec === "string") {
    const match = spec.trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) return [Math.min(+match[1], +match[2]), Math.max(+match[1], +match[2])]
  }

  sharedLogger.warn(
    `Unsupported click spec "${JSON.stringify(spec)}" — only a sticky number or a single "a-b" range is supported`
  )
  return null
}

function toSlidevAt(spec?: SoppyClick): number | [number, number] | null {
  const at = toClickAt(spec)
  return Array.isArray(at) ? [at[0], at[1] + 1] : at
}

export function useClickActive(
  click: MaybeRefOrGetter<SoppyClick | undefined> | { click?: SoppyClick }
): ComputedRef<boolean> {
  const source = toPropSource(click, "click")
  const { isPrintMode, isPrintWithClicks } = useNav()

  let clicksContext: ClicksContext | null = null

  if (hasInjectionContext()) {
    try {
      clicksContext = useSlideContext().$clicksContext
    } catch {
      clicksContext = null
    }
  }

  const id = `soppy-click-${++seq}`
  const infoRef = ref<ClicksInfo | null>(null)

  onMounted(() => {
    if (!clicksContext) return
    const at = toSlidevAt(toValue(source))
    if (at == null) return

    const info = clicksContext.calculate(at)
    if (!info) return

    clicksContext.register(id, info)
    infoRef.value = info
  })

  onBeforeUnmount(() => {
    clicksContext?.unregister(id)
    infoRef.value = null
  })

  return computed(() => {
    if (isPrintMode.value && !isPrintWithClicks.value) return true
    const at = toSlidevAt(toValue(source))
    if (at == null) return true
    return infoRef.value?.isActive ?? false
  })
}
