import { nextTick, watch } from "vue"
import { gsap } from "gsap"
import type { useViewStore } from "../stores/view"
import { forEachOrigin, getOrigin, getTarget } from "../stores/view"
import { letterboxContain, rectCenter, rectOf, unrotatedSize } from "../utils/rect"

interface ViewFlyHandle {
  activate(src: string, width: number, height: number): void
  pose(cx: number, cy: number, scale: number, deg: number, opacity: number): void
  hide(): void
}

interface ViewAnimeEls {
  viewer(): HTMLElement | undefined
  stage(): HTMLElement | undefined
  fly(): ViewFlyHandle | undefined
}

interface OriginPose {
  x: number
  y: number
  width: number
  height: number
  deg: number
}

interface OpenRun {
  uid: number
  origin: OriginPose
  lens: OriginPose
  pose: { x: number; y: number; s: number; r: number }
}

const FLY_S = 0.42
const FADE_S = 0.22
const CROSS_S = 0.16

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

export function useViewAnime(store: ReturnType<typeof useViewStore>, els: ViewAnimeEls) {
  let tl: gsap.core.Timeline | null = null
  // uid whose origin <img> is hidden while the fly element stands in for it
  let hiddenOriginId: number | null = null
  // the in-flight open, so a cancel can reverse back to the origin
  let openRun: OpenRun | null = null

  function kill() {
    tl?.kill()
    tl = null
  }

  function getStage() {
    return store.stage
  }

  function restoreOrigin() {
    if (hiddenOriginId == null) return
    const origin = getOrigin(hiddenOriginId)
    if (origin) gsap.set(origin.el, { opacity: 1 })
    hiddenOriginId = null
  }

  function viewerVisible(visible: boolean) {
    const el = els.viewer()
    if (!el) return
    gsap.set(el, { autoAlpha: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" })
  }

  function flyIdle() {
    els.fly()?.hide()
  }

  // slide origins follow the active view: while the viewer is open only the
  // active origin stays hidden — switching views in the carousel hides the new
  // origin and reveals the previous one
  function revealAllOrigins() {
    forEachOrigin((_uid, origin) => gsap.set(origin.el, { opacity: 1 }))
  }

  function revealActiveOrigin() {
    forEachOrigin((uid, origin) => {
      gsap.set(origin.el, { opacity: uid === store.activeId ? 0 : 1 })
    })
  }

  watch(
    [() => store.stage, () => store.activeId],
    () => {
      if (store.stage === "normal") revealAllOrigins()
      else if (store.stage === "preview") revealActiveOrigin()
    },
    { flush: "post" }
  )

  /**
   * assumes the tilt is applied about the content's own centre (as <Rotate> does),
   * so the bbox centre is also the content centre and unrotatedSize recovers it
   */
  function originPose(uid: number): OriginPose | null {
    const origin = getOrigin(uid)
    if (!origin) return null
    const bbox = rectOf(origin.el)
    if (!bbox) return null
    const size = unrotatedSize(bbox, origin.rotate)
    const center = rectCenter(bbox)
    return { x: center.x, y: center.y, width: size.width, height: size.height, deg: origin.rotate }
  }

  function lensPose(uid: number): OriginPose | null {
    const origin = getOrigin(uid)
    const stage = els.stage()
    if (!origin || !stage) return null
    const box = rectOf(stage)
    const { naturalWidth: nw, naturalHeight: nh } = origin.el
    if (!box || !nw || !nh) return null
    const rect = letterboxContain(box, { width: nw, height: nh })
    const center = rectCenter(rect)
    return { x: center.x, y: center.y, width: rect.width, height: rect.height, deg: 0 }
  }

  // instant stable states, used by setup / abort / interrupts
  function settleClosed() {
    kill()
    restoreOrigin()
    flyIdle()
    viewerVisible(false)
    openRun = null
    store.setStage("normal")
    store.setActive(-1)
  }

  // static open when a flight is impossible (missing geometry / image not ready)
  function showPreview(uid: number) {
    settleClosed()
    store.setActive(uid)
    store.setStage("preview")
    const viewer = els.viewer()
    if (viewer) {
      gsap.fromTo(
        viewer,
        { autoAlpha: 0 },
        { autoAlpha: 1, pointerEvents: "auto", duration: FADE_S }
      )
    }
  }

  /* ==================== view => viewer ==================== */
  async function open(uid: number) {
    // a stale "animate" (e.g. a previous run that aborted mid-flight) snaps shut first
    if (store.stage === "animate") settleClosed()
    // switching from an already-open viewer is out of scope here
    if (store.stage !== "normal") return
    const origin = originPose(uid)
    const source = getOrigin(uid)
    const fly = els.fly()
    if (!origin || !source || !fly || origin.width <= 0) {
      if (source) showPreview(uid)
      return
    }

    settleClosed()
    store.setActive(uid)
    store.setStage("animate")
    const viewer = els.viewer()
    if (viewer) gsap.set(viewer, { autoAlpha: 0, pointerEvents: "none" })

    /**
     * measure the landing spot only after the active view rendered — toolbar /
     * counter change the stage box, and an early measurement lands off by half
     * that delta; bail out if the run was aborted while waiting
     */
    await nextTick()
    if (getStage() !== "animate") return
    const lens = lensPose(uid)
    if (!lens || lens.width <= 0) {
      if (source) showPreview(uid)
      return
    }

    const pose = { x: origin.x, y: origin.y, s: origin.width / lens.width, r: origin.deg }
    openRun = { uid, origin, lens, pose }

    fly.activate(source.el.src, lens.width, lens.height)
    // let the freshly-assigned src decode one frame before it fades in
    await nextFrame()
    if (getStage() !== "animate") {
      settleClosed()
      return
    }

    const fade = { opacity: 0 }
    fly.pose(pose.x, pose.y, pose.s, pose.r, fade.opacity)
    hiddenOriginId = uid

    tl = gsap.timeline()
    // the origin stays put while the fly fades in over it; once the fly is fully
    // opaque it covers the crop area, so the origin can be cut off — no empty gap
    tl.to(fade, {
      opacity: 1,
      duration: CROSS_S,
      ease: "power1.out",
      onUpdate: () => fly.pose(pose.x, pose.y, pose.s, pose.r, fade.opacity),
    })
    tl.call(() => gsap.set(source.el, { opacity: 0 }))
    tl.to(pose, {
      x: lens.x,
      y: lens.y,
      s: 1,
      r: 0,
      duration: FLY_S,
      ease: "power2.inOut",
      onUpdate: () => fly.pose(pose.x, pose.y, pose.s, pose.r, 1),
    })
    tl.call(() => store.setStage("preview"))
    if (viewer) {
      tl.fromTo(viewer, { autoAlpha: 0 }, { autoAlpha: 1, pointerEvents: "auto", duration: FADE_S })
    }
    tl.call(() => {
      fly.pose(lens.x, lens.y, 1, 0, 0)
      flyIdle()
      openRun = null
      tl = null
    })
  }

  /* ==================== cancel ==================== */

  // cancels an in-flight open: from wherever the flight is, fly back to the origin
  function cancelOpen() {
    const run = openRun
    const source = run ? getOrigin(run.uid) : undefined
    const fly = els.fly()
    if (!run || !source || !fly) {
      settleClosed()
      return
    }
    // the open never faded the origin out yet — nothing to fly back
    if (hiddenOriginId == null) {
      settleClosed()
      return
    }

    kill()
    const pose = run.pose
    const scale = run.origin.width / run.lens.width
    const fade = { opacity: 1 }
    // keep the origin fully hidden while the fly returns, then fade fly out,
    // and only after it is gone fade the origin back in
    gsap.set(source.el, { opacity: 0 })
    tl = gsap.timeline()
    tl.to(pose, {
      x: run.origin.x,
      y: run.origin.y,
      s: scale,
      r: run.origin.deg,
      duration: FLY_S,
      ease: "power2.inOut",
      onUpdate: () => fly.pose(pose.x, pose.y, pose.s, pose.r, 1),
    })
    // reveal the origin beneath the still-opaque fly, then fade the fly away
    tl.call(() => gsap.set(source.el, { opacity: 1 }))
    tl.to(fade, {
      opacity: 0,
      duration: CROSS_S,
      onUpdate: () => fly.pose(run.origin.x, run.origin.y, scale, run.origin.deg, fade.opacity),
    })
    tl.call(() => {
      hiddenOriginId = null
      fly.pose(run.origin.x, run.origin.y, scale, run.origin.deg, 0)
      flyIdle()
      store.setStage("normal")
      store.setActive(-1)
      openRun = null
      tl = null
    })
  }

  /* ==================== viewer => view ==================== */

  async function close() {
    // cancel an in-flight open (reverse to the origin) rather than snapping shut
    if (store.stage !== "preview") {
      cancelOpen()
      return
    }
    const uid = store.activeId
    const origin = originPose(uid)
    const lens = lensPose(uid)
    const source = getOrigin(uid)
    const fly = els.fly()
    if (!origin || !lens || !source || !fly) {
      settleClosed()
      return
    }

    getTarget(uid)?.reset()
    const viewer = els.viewer()

    kill()
    store.setStage("animate")
    fly.activate(source.el.src, lens.width, lens.height)
    await nextFrame()
    if (getStage() !== "animate") {
      settleClosed()
      return
    }

    const pose = { x: lens.x, y: lens.y, s: 1, r: 0 }
    const fade = { opacity: 1 }
    fly.pose(pose.x, pose.y, pose.s, pose.r, 1)
    if (hiddenOriginId == null) gsap.set(source.el, { opacity: 0 })
    hiddenOriginId = uid

    tl = gsap.timeline()
    if (viewer) {
      tl.fromTo(viewer, { autoAlpha: 1 }, { autoAlpha: 0, pointerEvents: "none", duration: FADE_S })
    }
    tl.to(pose, {
      x: origin.x,
      y: origin.y,
      s: origin.width / lens.width,
      r: origin.deg,
      duration: FLY_S,
      ease: "power2.inOut",
      onUpdate: () => fly.pose(pose.x, pose.y, pose.s, pose.r, 1),
    })
    // reveal the origin beneath the still-opaque fly, then fade the fly away
    tl.call(() => gsap.set(source.el, { opacity: 1 }))
    tl.to(fade, {
      opacity: 0,
      duration: CROSS_S,
      onUpdate: () =>
        fly.pose(origin.x, origin.y, origin.width / lens.width, origin.deg, fade.opacity),
    })
    tl.call(() => {
      hiddenOriginId = null
      fly.pose(origin.x, origin.y, origin.width / lens.width, origin.deg, 0)
      flyIdle()
      store.setStage("normal")
      store.setActive(-1)
      tl = null
    })
  }

  function setup() {
    settleClosed()
  }

  function abort() {
    settleClosed()
  }

  return { setup, open, close, abort }
}
