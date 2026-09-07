<template>
  <div class="soppy-decor">
    <slot />
    <span
      ref="decorEl"
      class="soppy-decor__kind"
      :class="[`soppy-decor__kind--${kind}`, sizeCls]"
      :style="kindStyl"
    />
  </div>
</template>

<script setup lang="ts">
import { useIsSlideActive, useNav } from "@slidev/client"
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import type {
  PresetSize,
  SoppyAnimationStage,
  SoppyClick,
  SpaceUnit,
  MotionStep,
} from "@soppy-slidev/shared"
import { isPresetSize, toDegree, toRadian, toCssSpaceUnit } from "@soppy-slidev/shared"
import { useSkeuoColor } from "../composables/useColor"
import { useClickActive } from "../composables/useClick"
import { useOffset } from "../composables/useStyle"
import { DecorKinds } from "../utils/constants"
import { gsap } from "gsap"

defineOptions({ name: "SoppyBaseDecor" })

const props = withDefaults(
  defineProps<{
    kind: DecorKinds
    color?: string
    offset?: SpaceUnit | [SpaceUnit, SpaceUnit]
    animate?: boolean
    click?: SoppyClick
    rotate?: number | string
    size?: SpaceUnit | PresetSize
    print?: boolean
  }>(),
  {
    offset: () => [0, 0] as [number, number],
    size: "medium",
    rotate: 0,
  }
)

/* ==================== geometry / look ==================== */
const isPin = computed(() => props.kind === DecorKinds.pin)
const decorEl = ref<HTMLElement>()
const rotateDeg = computed(() => toDegree(props.rotate))
const offset = useOffset(props)

const restingVars = computed(() => ({
  xPercent: -50,
  yPercent: -50,
  rotation: rotateDeg.value,
  ...offset.value,
}))

// `kind` is fixed at setup time (wrappers pin it), so a static palette is fine
const colorByKind = useSkeuoColor(() => props.color, isPin.value ? "pin" : "tape")

const sizeCls = computed(() => (isPresetSize(props.size) ? `soppy-decor__size--${props.size}` : ""))

const kindStyl = computed(() => {
  const color = colorByKind.value
  if (sizeCls.value) return { "--soppy-decor-color": color }

  const size = toCssSpaceUnit(props.size ?? "1rem")
  return isPin.value
    ? { width: size, height: size, "--soppy-decor-color": color }
    : { width: size, "--soppy-decor-color": color }
})

/* ==================== click / reveal ==================== */
const { isPrintMode, clicks, clicksStart } = useNav()
const slideActive = useIsSlideActive()
const clickActive = useClickActive(props)

// a `click` spec implies an entrance — `animate` is ignored while it is set
const isAnimated = computed(() => props.animate || props.click != null)

/**
 * click gating only owns the decor itself — slot content always renders.
 * `print: false` hides the decor from static output entirely
 */
const revealed = computed(() => {
  if (isPrintMode.value && !props.print) return false
  if (props.click != null) return slideActive.value && clickActive.value
  return !props.animate || slideActive.value || isPrintMode.value
})

/* ==================== motion ==================== */

type DecorPose = { x: number; y: number }

interface DecorMotion {
  entrance: MotionStep<DecorPose>
  exit: MotionStep<DecorPose>
}

function currentPose(): DecorPose {
  const node = decorEl.value!
  return {
    x: gsap.getProperty(node, "x") as number,
    y: gsap.getProperty(node, "y") as number,
  }
}

/** the strip's "above" direction rotated by its own tilt (screen coords) */
function tapeTravel(dist: number) {
  const rad = toRadian(rotateDeg.value)
  return { x: Math.sin(rad) * dist, y: -Math.cos(rad) * dist }
}

// per-kind motion data — adding a kind only needs one more record
const TAPE_RISE = 26
const DECOR_MOTIONS: Record<DecorKinds, DecorMotion> = {
  [DecorKinds.pin]: {
    entrance: {
      duration: 0.45,
      ease: "power3.out",
      from: () => ({ opacity: 0, scale: 1.5 }),
      to: () => ({ opacity: 1, scale: 1 }),
    },
    exit: {
      duration: 0.25,
      ease: "power2.in",
      to: () => ({ opacity: 0, scale: 1.25 }),
    },
  },
  [DecorKinds.tape]: {
    entrance: {
      duration: 0.45,
      ease: "power2.out",
      from: (pose) => {
        const travel = tapeTravel(TAPE_RISE)
        return { x: pose.x + travel.x, y: pose.y + travel.y, opacity: 0 }
      },
      to: () => ({ opacity: 1 }),
    },
    exit: {
      duration: 0.25,
      ease: "power2.in",
      to: (pose) => {
        const travel = tapeTravel(TAPE_RISE * 0.5)
        return { x: pose.x + travel.x, y: pose.y + travel.y, opacity: 0 }
      },
    },
  },
}

let tween: gsap.core.Tween | null = null

function killTween() {
  tween?.kill()
  tween = null
}

function settle(visible: boolean) {
  if (!decorEl.value) return
  gsap.set(decorEl.value, { ...restingVars.value, opacity: visible ? 1 : 0 })
}

function playStage(stage: SoppyAnimationStage) {
  const node = decorEl.value
  if (!node) return

  const step =
    stage === "entrance" ? DECOR_MOTIONS[props.kind].entrance : DECOR_MOTIONS[props.kind].exit
  const pose = currentPose()

  if (stage === "entrance") {
    tween = gsap.fromTo(node, step.from!(pose), {
      ...restingVars.value,
      ...step.to(pose),
      duration: step.duration,
      ease: step.ease,
      onComplete: () => {
        tween = null
      },
    })
  } else {
    tween = gsap.to(node, {
      ...step.to(pose),
      duration: step.duration,
      ease: step.ease,
      onComplete: () => {
        tween = null
        settle(false)
      },
    })
  }
}

function playEntrance() {
  if (!decorEl.value || !isAnimated.value) return

  killTween()
  if (isPrintMode.value) {
    settle(true)
    return
  }
  playStage("entrance")
}

function playExit() {
  if (!decorEl.value) return

  killTween()
  if (isPrintMode.value) {
    settle(false)
    return
  }
  playStage("exit")
}

/* ==================== lifecycle ==================== */
watch(
  restingVars,
  () => {
    killTween()
    settle(revealed.value)
  },
  { flush: "post" }
)

watch(
  revealed,
  (value) => {
    if (value) playEntrance()
    else playExit()
  },
  { flush: "post" }
)

onMounted(() => {
  settle(revealed.value)
  if (revealed.value && isAnimated.value && clicks.value === clicksStart.value) playEntrance()
})

onBeforeUnmount(() => {
  killTween()
})
</script>
