export type SpaceUnitType = "gap" | "width" | "length"
export type SpaceUnit = string | number

export type SpacesGroupType = "padding" | "margin"
export type SpacesGroup =
  SpaceUnit | [SpaceUnit, SpaceUnit] | [SpaceUnit, SpaceUnit, SpaceUnit, SpaceUnit]

export type OffsetProp = SpaceUnit | [SpaceUnit, SpaceUnit]

/** a width/height pair — a bare length means equal sides (square) */
export type SpacePair = SpaceUnit | [SpaceUnit, SpaceUnit]

export type SemiDirection = "row" | "column"
export type Direction = SemiDirection | "row-reverse" | "column-reverse"

export type SemiPosition = "horizontal" | "vertical"
export type Position = "top" | "right" | "bottom" | "left"

/** the four viewport corners, used for floating chrome (e.g. map controls) */
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right"

// JS implementation of CSS cover/contain semantics, used when no object-fit is available
export type FitType = "cover" | "contain"

export type PresetSize = "small" | "medium" | "large"
export type PresetRounded = "none" | "sm" | "md" | "lg" | "full"
export type PresetColorType = "default" | "primary" | "success" | "info" | "warning" | "danger"

export type SoppyClick =
  | number // e.g. :click="1"
  | number[] // e.g. :click="[1, 3]"
  | string // e.g. click="1-3"

export type SoppyAnimationStage = "entrance" | "exit"

export interface MotionStep<T extends Record<string, any>> {
  duration: number
  ease: string
  from?: (pose: T) => gsap.TweenVars
  to: (pose: T) => gsap.TweenVars
}
