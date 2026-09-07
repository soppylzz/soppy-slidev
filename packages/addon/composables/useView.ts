import {
  computed,
  inject,
  onUnmounted,
  toValue,
  useTemplateRef,
  watchEffect,
  type MaybeRefOrGetter,
} from "vue"
import { useSlideContext } from "@slidev/client"
import { useViewStore, type ViewRegisterMeta } from "../stores/view"
import { ROTATE_INJECTION_KEY } from "../utils/constants"
import { checkSetup } from "../utils/checkSetup"

/**
 * Binds a component's view registration to its props while it lives. `uid` and
 * the page it sits on are captured once in setup; `watchEffect` re-registers
 * whenever the props, the tilt, the expandable gate or the mounted origin <img>
 * change. `enabled` decides whether the view joins the viewer store at all.
 */
export function useView<T extends ViewRegisterMeta>(
  props: T,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  const uid = checkSetup("useView").uid
  const page = useSlideContext().$page.value
  const store = useViewStore()

  // the tilt of the enclosing <Rotate>, reproduced by the flight — 0 when there is none
  const parentRotate = inject(
    ROTATE_INJECTION_KEY,
    computed(() => 0)
  )
  const imgEl = useTemplateRef<HTMLImageElement>("imgEl")

  watchEffect(() => {
    if (!toValue(enabled)) {
      store.unregister(uid)
      return
    }
    const el = imgEl.value
    // the template fills imgEl only after mount — until then the source is incomplete
    if (el) {
      store.register(
        { id: uid, page, src: props.src, title: props.title, details: props.details },
        { el, rotate: parentRotate.value }
      )
    }
  })

  onUnmounted(() => store.unregister(uid))

  return { uid, imgEl }
}
