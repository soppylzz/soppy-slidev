<template>
  <div class="soppy-preview">
    <div
      ref="triggerEl"
      class="soppy-preview__trigger"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <slot />
    </div>

    <teleport to="body">
      <transition name="soppy-opacity">
        <div
          v-if="shown"
          ref="tipEl"
          role="tooltip"
          class="soppy-preview__card"
          :class="`soppy-preview__card--${side}`"
          :style="cardStyle"
          @mouseenter="cancelHide"
          @mouseleave="onLeave"
        >
          <div v-if="title || description" class="soppy-preview__meta">
            <p v-if="title" class="soppy-preview__title">{{ title }}</p>
            <p v-if="description" class="soppy-preview__desc">{{ description }}</p>
          </div>

          <!-- the glass layer sits directly over the media; hovering it fades the
               glass (opacity) away so the image/iframe becomes interactive -->
          <div
            class="soppy-preview__media"
            @pointerenter="onMediaPointerEnter"
            @pointerleave="onMediaPointerLeave"
            @click="open"
          >
            <img
              v-if="mode === 'img'"
              class="soppy-preview__img"
              :style="{ objectFit: fit }"
              :src="src"
              :alt="title ?? ''"
              @load="onMediaReady"
              @error="onMediaError"
            />

            <iframe
              v-else
              class="soppy-preview__iframe"
              :src="href"
              :title="title ?? ''"
              loading="lazy"
              scrolling="no"
              @load="onMediaReady"
            />

            <div
              class="soppy-preview__glass"
              :class="{ 'soppy-preview__glass--hidden': revealed }"
              role="link"
              tabindex="0"
              @keydown.enter.prevent="open"
            >
              <span class="soppy-preview__open">Open in new tab ↗</span>
            </div>

            <transition name="soppy-opacity">
              <div v-if="state === 'loading'" class="soppy-preview__status">Loading…</div>
            </transition>
            <transition name="soppy-opacity">
              <button
                v-if="state === 'error'"
                type="button"
                class="soppy-preview__status"
                @click="open"
              >
                Preview failed — open in new tab ↗
              </button>
            </transition>
          </div>

          <footer class="soppy-preview__foot">
            <span class="soppy-preview__origin">{{ origin }}</span>
          </footer>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import { debounce } from "lodash-es"
import type { FitType, Position, PresetSize } from "@soppy-slidev/shared"
import { usePopover } from "../composables/usePopover"

const SHOW_DELAY = 250
const HIDE_DELAY = 200
const REVEAL_DELAY = 160
const CARD_WIDTH: Record<PresetSize, string> = {
  small: "14rem",
  medium: "18rem",
  large: "22rem",
}

defineOptions({ name: "SoppyPreview" })

const props = withDefaults(
  defineProps<{
    // target link; the trigger (default slot) and the card open it
    href: string
    // explicit image preview; unset → live iframe preview of `href`
    src?: string
    title?: string
    description?: string
    fit?: FitType
    position?: Position
    size?: PresetSize
    autoPopover?: boolean
  }>(),
  {
    fit: "cover",
    position: "top",
    size: "medium",
  }
)

const mode = computed<"img" | "iframe">(() => (props.src ? "img" : "iframe"))
const origin = computed(() => {
  try {
    return new URL(props.href).hostname
  } catch {
    return props.href
  }
})

const { shown, side, pos, onEnter, onLeave, cancelHide, onFocusIn, onFocusOut } = usePopover({
  position: () => props.position,
  autoPopover: () => props.autoPopover,
  showDelay: SHOW_DELAY,
  hideDelay: HIDE_DELAY,
})

const cardStyle = computed(() => ({
  "--soppy-preview-width": CARD_WIDTH[props.size],
  left: `${pos.value.left}px`,
  top: `${pos.value.top}px`,
}))

function open() {
  window.open(props.href, "_blank", "noopener")
}

/* ==================== media state / glass ==================== */
const state = ref<"loading" | "ready" | "error">("loading")
const revealed = ref(false)
const revealSoon = debounce(() => {
  revealed.value = true
}, REVEAL_DELAY)

function onMediaReady() {
  state.value = "ready"
}

function onMediaError() {
  state.value = "error"
}

function onMediaPointerEnter() {
  revealSoon()
}

function onMediaPointerLeave() {
  revealSoon.cancel()
  revealed.value = false
}

onBeforeUnmount(() => revealSoon.cancel())
</script>
