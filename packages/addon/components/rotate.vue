<template>
  <!-- outer, unrotated wrapper keeps the rotation from affecting layout -->
  <div ref="boxEl" class="w-full h-full">
    <div ref="fitEl" class="soppy-rotate w-full h-full" :class="rotateCls">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, watch } from "vue"
import type { SoppyAnimationStage, SoppyClick, MotionStep } from "@soppy-slidev/shared"
import { toDegree } from "@soppy-slidev/shared"
import { useRotateFit } from "../composables/useRotateFit"
import { useIsSlideActive, useNav } from "@slidev/client"
import { useClickActive } from "../composables/useClick"
import { useHidden } from "../composables/useStyle"
import { ROTATE_INJECTION_KEY } from "../utils/constants"
import { gsap } from "gsap"

defineOptions({ name: "SoppyRotate" })

const props = withDefaults(
  defineProps<{
    rotate?: number | string
    click?: SoppyClick
    print?: boolean
  }>(),
  {
    rotate: 0,
    print: true,
  }
)

const parentRotate = inject(
  ROTATE_INJECTION_KEY,
  computed(() => 0)
)
const rotateDeg = computed(() => toDegree(props.rotate) + parentRotate.value)
provide(ROTATE_INJECTION_KEY, rotateDeg)

const { fitEl, ready, offset } = useRotateFit(rotateDeg)
const restingPose = computed(() => ({ x: offset.x, y: offset.y, rotation: rotateDeg.value }))

const { isPrintMode } = useNav()
const slideActive = useIsSlideActive()
const clickActive = useClickActive(props)

const revealed = computed(() => {
  if (isPrintMode.value && !props.print) return false
  if (props.click != null) return slideActive.value && clickActive.value
  return slideActive.value || isPrintMode.value
})

const shown = computed(() => revealed.value && (ready.value || isPrintMode.value))
const rotateCls = useHidden(shown)

/* ==================== motion ==================== */
type RotatePose = { x: number; y: number; rotation: number }

const RISE = 24
const TILT = 4
const ROTATE_MOTION: { entrance: MotionStep<RotatePose>; exit: MotionStep<RotatePose> } = {
  entrance: {
    duration: 0.6,
    ease: "power3.out",
    from: (pose) => ({
      x: pose.x,
      y: pose.y + RISE,
      rotation: pose.rotation - TILT,
      opacity: 0,
    }),
    to: () => ({ opacity: 1 }),
  },
  exit: {
    duration: 0.3,
    ease: "power2.in",
    to: (pose) => ({
      x: pose.x,
      y: pose.y + RISE,
      rotation: pose.rotation - TILT,
      opacity: 0,
    }),
  },
}

let tween: gsap.core.Tween | null = null

function killTween() {
  tween?.kill()
  tween = null
}

function settle(visible: boolean) {
  if (!fitEl.value) return
  gsap.set(fitEl.value, { ...restingPose.value, opacity: visible ? 1 : 0 })
}

function playStage(stage: SoppyAnimationStage) {
  const el = fitEl.value
  if (!el) return

  const step = stage === "entrance" ? ROTATE_MOTION.entrance : ROTATE_MOTION.exit
  const pose = restingPose.value

  if (stage === "entrance") {
    tween = gsap.fromTo(el, step.from!(pose), {
      ...pose,
      ...step.to(pose),
      duration: step.duration,
      ease: step.ease,
      onComplete: () => {
        tween = null
      },
    })
  } else {
    tween = gsap.to(el, {
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
  if (!fitEl.value) return

  killTween()
  if (isPrintMode.value) {
    settle(true)
    return
  }
  playStage("entrance")
}

function playExit() {
  if (!fitEl.value) return

  killTween()
  if (isPrintMode.value) {
    settle(false)
    return
  }
  playStage("exit")
}

/* ==================== lifecycle ==================== */
watch(
  restingPose,
  () => {
    killTween()
    settle(shown.value)
  },
  { flush: "post" }
)

watch(
  shown,
  (value) => {
    if (value) playEntrance()
    else playExit()
  },
  { flush: "post" }
)

onMounted(() => {
  settle(shown.value)
  if (shown.value) playEntrance()
})

onBeforeUnmount(() => {
  killTween()
})
</script>
