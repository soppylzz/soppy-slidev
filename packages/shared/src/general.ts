import type {
  Position,
  SemiPosition,
  SpaceUnit,
  SpacePair,
  SpacesGroup,
  PresetSize,
  Direction,
} from "./types"

/* ==================== animate ==================== */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/* ==================== base utils ==================== */
export const isArray = (value: unknown): value is any[] => Array.isArray(value)
export const isString = (value: unknown): value is string => typeof value === "string"
export const isNumber = (value: unknown): value is number => typeof value === "number"
export const isObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null

export const EMPTY_OBJ = Object.freeze({})
export const ensureArray = <T>(value: T | T[]): T[] => (isArray(value) ? value : [value])
export const hasOwn = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => Object.prototype.hasOwnProperty.call(obj, key)

/* ==================== styl utils ==================== */
export const isHorizontal = (
  value: Position | SemiPosition | Direction
): value is "left" | "right" | "horizontal" | "row" | "row-reverse" =>
  typeof value === "string" && ["left", "right", "horizontal", "row", "row-reverse"].includes(value)
export const isPresetSize = (value: unknown): value is PresetSize =>
  typeof value === "string" && ["small", "medium", "large"].includes(value)

/* ==================== norm value ==================== */
export const toDegree = (value: string | number): number => {
  if (isNumber(value)) return value

  const match = value.match(degreeReg)
  if (!match) {
    throw new Error(`Invalid angle format: ${value}`)
  }

  const num = parseFloat(match[1])
  const unit = match[2]?.toLowerCase() ?? "deg"

  switch (unit) {
    case "deg":
      return num
    // 400grad = 360deg
    case "grad":
      return num * 0.9
    // 2pi = 360deg
    case "rad":
      return (num * 180) / Math.PI
    // 1turn = 360deg
    case "turn":
      return num * 360
    default:
      return num
  }
}

export const toRadian = (value: string | number): number => {
  const TWO_PI = Math.PI * 2
  const rad = (toDegree(value) * Math.PI) / 180
  return ((rad % TWO_PI) + TWO_PI) % TWO_PI
}

/* ==================== norm css ==================== */
const unitSuffixReg = /(px|em|rem|%)$/
const spaceUnitReg = /^-?\d*\.?\d+(px|em|rem|%)?$/
const degreeReg = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|grad|rad|turn)?$/i

export const toCssSpaceUnit = (value?: SpaceUnit): string =>
  typeof value === "number"
    ? `${value}px`
    : typeof value === "string" && spaceUnitReg.test(value)
      ? unitSuffixReg.test(value)
        ? value
        : `${value}px`
      : "0px"

export function toCssSpaceGroup(space?: SpacesGroup) {
  let result: [SpaceUnit, SpaceUnit, SpaceUnit, SpaceUnit] = [0, 0, 0, 0]
  if (space) {
    if (typeof space === "string" || typeof space === "number") {
      result = [space, space, space, space]
    } else if (isArray(space)) {
      if (space.length === 2) {
        result = [space[0], space[1], space[0], space[1]]
      } else if (space.length === 4) {
        result = space
      }
    }
  }

  return result.map(toCssSpaceUnit).join(" ")
}

export const toCssGridRatio = (value?: number | number[]): string =>
  value
    ? ensureArray(value)
        .map((r) => `${r}fr`)
        .join(" ")
    : "1fr"

export const toCssDegree = (value: string | number): string => `${toDegree(value)}deg`

export const toCssSpacePair = (pair: SpacePair): Record<"width" | "height", string> =>
  isArray(pair)
    ? { width: toCssSpaceUnit(pair[0]), height: toCssSpaceUnit(pair[1]) }
    : { width: toCssSpaceUnit(pair), height: toCssSpaceUnit(pair) }
