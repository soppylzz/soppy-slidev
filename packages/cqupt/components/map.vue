<template>
  <div :ref="onRootEl" class="cqupt-map" :class="{ 'cqupt-map--map-dark': mapDark }">
    <div v-if="!hasKey" class="cqupt-map__error">
      <p>Missing MapTiler API key.</p>
      <p>Pass the <code>apiKey</code> prop or set <code>themeConfig.apiKey</code>.</p>
    </div>
    <template v-else>
      <div ref="containerEl" class="cqupt-map__container" />
      <slot />
      <div
        v-if="location && locationPos"
        class="cqupt-map__location"
        :style="{ left: `${locationPos.x}px`, top: `${locationPos.y}px` }"
      />
      <div
        class="cqupt-map__controls"
        :class="`cqupt-map__controls--${controlsPosition}`"
        :style="controlsStyl"
      >
        <Button
          v-if="location"
          icon
          :size="size"
          class="cqupt-map__button"
          aria-label="Locate"
          @click="locate"
        >
          <svg viewBox="0 0 640 640" aria-hidden="true">
            <path
              d="M320 48C337.7 48 352 62.3 352 80L352 98.3C450.1 112.3 527.7 189.9 541.7 288L560 288C577.7 288 592 302.3 592 320C592 337.7 577.7 352 560 352L541.7 352C527.7 450.1 450.1 527.7 352 541.7L352 560C352 577.7 337.7 592 320 592C302.3 592 288 577.7 288 560L288 541.7C189.9 527.7 112.3 450.1 98.3 352L80 352C62.3 352 48 337.7 48 320C48 302.3 62.3 288 80 288L98.3 288C112.3 189.9 189.9 112.3 288 98.3L288 80C288 62.3 302.3 48 320 48zM160 320C160 408.4 231.6 480 320 480C408.4 480 480 408.4 480 320C480 231.6 408.4 160 320 160C231.6 160 160 231.6 160 320zM320 224C373 224 416 267 416 320C416 373 373 416 320 416C267 416 224 373 224 320C224 267 267 224 320 224z"
            />
          </svg>
        </Button>
        <Button icon :size="size" class="cqupt-map__button" aria-label="Zoom in" @click="zoomUp">
          <svg viewBox="0 0 640 640" aria-hidden="true">
            <path
              d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
            />
          </svg>
        </Button>
        <Button icon :size="size" class="cqupt-map__button" aria-label="Zoom out" @click="zoomDown">
          <svg viewBox="0 0 640 640" aria-hidden="true">
            <path
              d="M96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320z"
            />
          </svg>
        </Button>
      </div>
      <div v-if="lock && overlayVisible" class="cqupt-map__lock">
        <span class="cqupt-map__lock-hint">{{ unlockHint }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, provide, ref, shallowRef, watch } from "vue"
import {
  onKeyStroke,
  useActiveElement,
  useGeolocation,
  useMagicKeys,
  useTimeoutFn,
} from "@vueuse/core"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "@maptiler/sdk/style.css"
import { useDarkMode, useIsSlideActive, useSlideContext } from "@slidev/client"
import type { Corner, PresetSize } from "@soppy-slidev/shared"
import { mapMakerKey, type MapMakerConfig, type MapMakerUtils } from "../composables/useMapMaker"
import { useCquptConfig } from "../composables/useCquptConfig"
import { registerMapContainer, unregisterMapContainer } from "../directives/vMap"
import { adaptsDarkMode, maptilerStyleFor, resolveLayer } from "../utils/layer"
import { TileTypes } from "../utils/constants"

defineOptions({ name: "CquptMap" })

const { $clicks } = useSlideContext()
// skeuo marker content only enters once its slide is active, so markers wait
// for that before being snapshotted
const slideActive = useIsSlideActive()

const props = withDefaults(
  defineProps<{
    // named `apiKey` (not `key`) because `key` is a reserved Vue prop
    apiKey?: string
    center?: [number, number]
    zoom?: number
    range?: [number, number]
    type?: TileTypes
    scale?: number
    language?: string
    lock?: boolean
    clicks?: { lat: number; lon: number; zoom?: number }[]
    attribution?: boolean
    location?: boolean
    // controls chrome placement & footprint
    controlsPosition?: Corner
    size?: PresetSize
  }>(),
  {
    type: TileTypes.MAPTILER_STREET,
    center: () => [0, 0] as [number, number],
    zoom: 1,
    scale: 1,
    language: "en",
    controlsPosition: "top-left",
    size: "small",
  }
)

// `size` drives both the control buttons and the spacing around the corner stack
const CONTROL_SCALE = {
  small: { gap: "0.375rem", inset: "0.75rem" },
  medium: { gap: "0.5rem", inset: "1rem" },
  large: { gap: "0.625rem", inset: "1.25rem" },
} as const satisfies Record<PresetSize, { gap: string; inset: string }>

const controlsStyl = computed<Record<string, string>>(() => {
  const scale = CONTROL_SCALE[props.size]
  return {
    "--cqupt-map-controls-gap": scale.gap,
    "--cqupt-map-controls-inset": scale.inset,
  }
})

const config = useCquptConfig()
// key lookup order: props.apiKey -> themeConfig.apiKey / VITE_API_KEY -> (missing)
const apiKey = computed(() => props.apiKey ?? config.apiKey)
const hasKey = computed(() => Boolean(apiKey.value))

// the deck's light/dark mode (Slidev toggles html.dark from this ref)
const { isDark } = useDarkMode()
const dark = isDark
// some providers expose a DARK product — markers then use theme text, otherwise
// they stay on the fixed skeuo ink so they read on light tiles in any mode
const adaptive = computed(() => adaptsDarkMode(props.type))
const mapDark = computed(() => adaptive.value && dark.value)

const containerEl = ref<HTMLElement>()
const rootEl = ref<HTMLElement>()
// the map container may mount at zero size (Slidev preloads slides); watch for
// layout so the Leaflet size can be invalidated once it is visible
const resizeObserver = new ResizeObserver(() => {
  map.value?.invalidateSize()
})
// Leaflet instances stay out of reactive() to avoid Vue proxying them
const map = shallowRef<L.Map>()
const maptilerLayer = shallowRef<ReturnType<typeof resolveLayer> | undefined>()

// marker registry: element -> Leaflet marker, cleaned up on unmount
const markers = new Map<HTMLElement, L.Marker>()
// element -> its config (for range-gated visibility on zoom)
const markerConfigs = new Map<HTMLElement, MapMakerConfig>()
// markers registered before the map is ready (v-map directives run before this
// component's onMounted) are queued here and consumed once the map exists
const pendingMarkers = new Map<HTMLElement, MapMakerConfig>()

function hasAnimatedContent(el: HTMLElement) {
  return Boolean(el.querySelector(".soppy-rotate"))
}

function registerMaker(el: HTMLElement, config: MapMakerConfig) {
  pendingMarkers.set(el, config)
  // animated skeuo markers wait for the slide to activate (their entrance runs
  // then); plain content can be snapshotted right away
  if (map.value && (slideActive.value || !hasAnimatedContent(el))) flushMarker(el)
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

/* wait until the inner rotate entrance reaches its visible pose, so the
   snapshot doesn't freeze a mid-animation opacity/transform */
async function waitSettled(el: HTMLElement, timeout = 1200) {
  if (!hasAnimatedContent(el)) return
  const start = performance.now()
  while (performance.now() - start < timeout) {
    const inner = el.querySelector<HTMLElement>(".soppy-rotate")
    const opacity = inner ? Number(getComputedStyle(inner).opacity) : 1
    if (opacity >= 0.98) return
    await nextFrame()
  }
}

async function flushMarker(el: HTMLElement) {
  const config = pendingMarkers.get(el)
  if (!config || !map.value) return
  if (!slideActive.value && hasAnimatedContent(el)) return // keep pending, retry on activation
  pendingMarkers.delete(el)
  markers.get(el)?.remove()

  // skeuo marker content sizes itself from layout and writes inline styles over
  // its entrance — settle it first, then measure laid out but hidden (not
  // display:none, which yields 0×0), and snapshot the final DOM
  await waitSettled(el)
  el.style.cssText = "position:absolute;top:0;left:0;visibility:hidden;pointer-events:none"
  await nextTick()
  await nextFrame()

  const rect = el.getBoundingClientRect()
  const icon = L.divIcon({
    html: el.innerHTML,
    className: "cqupt-map__marker",
    iconSize: rect.width && rect.height ? [rect.width, rect.height] : undefined,
  })

  el.style.display = "none"
  const marker = L.marker([config.lat, config.lon], { icon }).addTo(map.value)
  markers.set(el, marker)
  markerConfigs.set(el, config)
}

function flushAllMarkers() {
  for (const el of [...pendingMarkers.keys()]) flushMarker(el)
}

/* a marker with a `range` only shows within that zoom band */
function markerInRange(config: MapMakerConfig | undefined, zoom: number | undefined) {
  if (!config?.range || zoom == null) return true
  return zoom >= config.range[0] && zoom <= config.range[1]
}

function syncMarkerRanges() {
  const m = map.value
  const zoom = m?.getZoom()
  if (!m || zoom == null) return
  markers.forEach((marker, el) => {
    const show = markerInRange(markerConfigs.get(el), zoom)
    if (show && !m.hasLayer(marker)) marker.addTo(m)
    else if (!show && m.hasLayer(marker)) m.removeLayer(marker)
  })
}

function unregisterMaker(el: HTMLElement) {
  pendingMarkers.delete(el)
  markers.get(el)?.remove()
  markers.delete(el)
  markerConfigs.delete(el)
  el.style.display = ""
}

const makerUtils: MapMakerUtils = {
  register: registerMaker,
  unregister: unregisterMaker,
}
provide(mapMakerKey, makerUtils)

// when the slide becomes active, flush markers that were waiting on their entrance
watch(slideActive, (active) => {
  if (active && map.value) flushAllMarkers()
})

// register the container when the root el mounts (before children's v-map
// directives run), so the directive finds the utils synchronously
function onRootEl(el: unknown) {
  const node = el instanceof HTMLElement ? el : null
  if (node) {
    rootEl.value = node
    registerMapContainer(node, makerUtils)
  } else {
    if (rootEl.value) unregisterMapContainer(rootEl.value)
    rootEl.value = undefined
  }
}

const magicKeys = useMagicKeys()
const activeElement = useActiveElement()
const isInputting = computed(() =>
  ["INPUT", "TEXTAREA"].includes(activeElement.value?.tagName ?? "")
)

// scroll-zoom is gated behind a modifier: cmd on mac, shift on linux/windows
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
const unlockKey = computed(() => (isMac ? magicKeys.meta.value : magicKeys.shift.value))
const unlockHint = computed(() =>
  isMac ? "Hold ⌘ + scroll to zoom" : "Hold Shift + scroll to zoom"
)

// apiKey / type / language are constructor-only, so a change rebuilds the layer
function buildLayer() {
  if (!map.value || !apiKey.value) return
  maptilerLayer.value?.remove()
  maptilerLayer.value = resolveLayer(map.value, {
    apiKey: apiKey.value,
    type: props.type,
    language: props.language,
    dark: dark.value,
  })
}

function flyTo(center: [number, number], zoom: number) {
  if (map.value) map.value.flyTo(center, zoom)
}

// geolocation: locate button + a custom user-location marker (not Leaflet's
// default). `immediate: false` so the permission prompt only appears on demand.
const { coords, resume } = useGeolocation({ immediate: false })
let locatePending = false
// custom marker: a plain HTML element positioned via latLngToContainerPoint
const locationLatLng = shallowRef<[number, number] | null>(null)
const locationTick = ref(0)

// useGeolocation initializes coords to { latitude: Infinity, longitude: Infinity }
// until a position resolves, so readiness is a finite-coords check, not null
function hasPosition(c: typeof coords.value) {
  return Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
}

function locate() {
  if (!map.value) return
  const c = coords.value
  if (!hasPosition(c)) {
    // coords not ready yet (permission prompt pending/denied): fly once they resolve
    locatePending = true
    resume()
    return
  }
  // zoom to the middle of the range, or the default zoom when no range is set
  const zoom = props.range ? Math.round((props.range[0] + props.range[1]) / 2) : props.zoom
  flyTo([c.latitude, c.longitude], zoom)
}

// re-evaluate the marker's pixel position after map pan/zoom/resize
function bumpLocation() {
  locationTick.value++
}

const locationPos = computed(() => {
  void locationTick.value
  const ll = locationLatLng.value
  if (!ll || !map.value) return null
  return map.value.latLngToContainerPoint(ll)
})

watch(coords, (c) => {
  if (!hasPosition(c)) return
  if (locatePending) {
    locatePending = false
    locate()
  }
  locationLatLng.value = [c.latitude, c.longitude]
})

function zoomUp() {
  if (props.lock) return
  map.value?.zoomIn()
}

function zoomDown() {
  if (props.lock) return
  map.value?.zoomOut()
}

// wheel zoom is smoothed: deltas accumulate into a signed buffer and only fire
// a step past a notch-size threshold, so micro reverse-scrolls during a gesture
// cancel out instead of jittering the zoom back and forth
const WHEEL_STEP = 100
const WHEEL_COOLDOWN = 120
let wheelDelta = 0
let lastWheelStep = 0

function onWheel(e: WheelEvent) {
  if (!unlockKey.value) return
  e.preventDefault()
  const m = map.value
  if (!m) return
  // ignore events while a zoom animation is running, so a trailing micro-delta
  // cannot reverse the step that just started
  if ((m as unknown as { _animatingZoom?: boolean })._animatingZoom) return

  wheelDelta += e.deltaY
  const steps = Math.floor(Math.abs(wheelDelta) / WHEEL_STEP)
  if (!steps) return
  const now = performance.now()
  if (now - lastWheelStep < WHEEL_COOLDOWN) return
  lastWheelStep = now

  const dir = Math.sign(wheelDelta)
  wheelDelta -= dir * steps * WHEEL_STEP
  m.setZoom(m.getZoom() + dir * steps)
}

// lock overlay: hidden immediately while the unlock key is held, shown again
// after a debounce once released
const overlayVisible = ref(true)
const { start, stop } = useTimeoutFn(
  () => {
    overlayVisible.value = true
  },
  250,
  { immediate: false }
)
watch(unlockKey, (held) => {
  if (!props.lock) return
  if (held) {
    stop()
    overlayVisible.value = false
  } else {
    start()
  }
})

onKeyStroke(["+", "="], (e) => {
  if (!e.repeat && !isInputting.value) zoomUp()
})
onKeyStroke("-", (e) => {
  if (!e.repeat && !isInputting.value) zoomDown()
})

// reactive -> Leaflet (props): key/type/language rebuild the layer,
// range/scale update map options
watch([apiKey, () => props.type, () => props.language], () => buildLayer())
watch(
  () => props.range,
  (range) => {
    if (!map.value || !range) return
    map.value.setMinZoom(range[0])
    map.value.setMaxZoom(range[1])
  }
)
watch(
  () => props.scale,
  (scale) => {
    if (map.value && scale) map.value.options.zoomSnap = scale
  }
)

// mode switch: supported products swap their DARK variant in place
function syncTheme() {
  const layer = maptilerLayer.value
  if (!layer || !map.value || !adaptive.value) return
  ;(layer as unknown as { setStyle: (s: unknown) => void }).setStyle(
    maptilerStyleFor(props.type, dark.value)
  )
}
watch(dark, syncTheme)

onMounted(() => {
  if (!hasKey.value || !containerEl.value) return
  const m = L.map(containerEl.value, {
    zoomControl: false,
    scrollWheelZoom: false,
    // Leaflet's keyboard panning conflicts with Slidev's navigation keys
    keyboard: false,
    minZoom: props.range?.[0],
    maxZoom: props.range?.[1],
    zoomSnap: props.scale,
  })
  m.setView(props.center, props.zoom)
  map.value = m

  buildLayer()
  flushAllMarkers()
  syncMarkerRanges()
  // the maptiler plugin appends attribution to map.attributionControl in onAdd,
  // so disable it after the layer is added (attributionControl: false would throw)
  if (props.attribution === false) m.attributionControl.remove()

  // handle a deep link landing on a click step (?click=N)
  jumpToClick($clicks.value)

  m.on("move zoom resize", bumpLocation)
  m.on("zoom", syncMarkerRanges)

  // a flyTo interrupted by a drag leaves maptiler's internal zoom flag set,
  // which blocks its canvas updates and freezes the map view; reset it and
  // force a resync when the user starts dragging
  m.on("dragstart", () => {
    const layer = maptilerLayer.value as unknown as { _zooming?: boolean; _update?: () => void }
    if (layer) {
      layer._zooming = false
      layer._update?.()
    }
  })

  m.getContainer().addEventListener("wheel", onWheel, { passive: false })

  resizeObserver.observe(containerEl.value)
})

onUnmounted(() => {
  map.value?.getContainer().removeEventListener("wheel", onWheel)
  resizeObserver.disconnect()
  markers.forEach((marker) => marker.remove())
  markers.clear()
  maptilerLayer.value?.remove()
  map.value?.remove()
  map.value = undefined
  maptilerLayer.value = undefined
})

// focus-point jumps: each click (starting from click 1) flies to the next point,
// optionally to a target zoom (defaults to the current zoom)
function jumpToClick(click: number) {
  if (click === 0) {
    flyTo(props.center, props.zoom)
  } else {
    const point = props.clicks?.[click - 1]
    if (!point || !map.value) return
    flyTo([point.lat, point.lon], point.zoom ?? map.value.getZoom())
  }
}

watch($clicks, (click) => jumpToClick(click))

defineExpose({
  zoomUp,
  zoomDown,
  flyTo,
})
</script>
