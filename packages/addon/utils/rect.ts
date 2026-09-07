import type { FitType } from "@soppy-slidev/shared"

export interface Size {
  width: number
  height: number
}

export interface Rect extends Size {
  x: number
  y: number
}

/** viewport rect of an element, or null when detached */
export function rectOf(el?: Element | null): Rect | null {
  if (!el || !el.isConnected) return null
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

export function rectCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
}

/** the contain-fit rect of `natural` centred inside `box` */
export function letterboxContain(box: Rect, natural: Size): Rect {
  const scale = Math.min(box.width / natural.width, box.height / natural.height)
  const width = natural.width * scale
  const height = natural.height * scale
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  }
}

/**
 * the fitted size of `natural` media inside `box` at the given ratio —
 * `cover` fills the box (overflow is cropped by the caller), `contain`
 * letterboxes. both keep the intrinsic aspect.
 */
export function computeFit(box: Size, natural: Size, fit: FitType): Size {
  const { width: nw, height: nh } = natural
  if (!(nw > 0) || !(nh > 0)) return { width: box.width, height: box.height }

  const scale =
    fit === "cover"
      ? Math.max(box.width / nw, box.height / nh)
      : Math.min(box.width / nw, box.height / nh)
  return { width: nw * scale, height: nh * scale }
}

/** un-rotated width/height of a bbox whose content is `deg`-rotated about its centre */
export function unrotatedSize(size: Size, deg: number): Size {
  const rad = (deg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const det = cos * cos - sin * sin
  if (det <= 0) return size
  const width = (size.width * cos - size.height * sin) / det
  const height = (size.height * cos - size.width * sin) / det
  return { width: Math.max(0, width), height: Math.max(0, height) }
}
