import cquptBadge from "../assets/cqupt.badge.svg"
import cquptLogo from "../assets/cqupt.logo.svg"

export type CampusPreset = "cqupt"

export const CAMPUS_PRESETS: Record<CampusPreset, { logo: string; badge: string }> = {
  cqupt: { logo: cquptLogo, badge: cquptBadge },
}

export function isPresetCampus(value: unknown): value is CampusPreset {
  return typeof value === "string" && value in CAMPUS_PRESETS
}

export function campusPresetSrc(preset: CampusPreset, variant: "logo" | "badge"): string {
  return CAMPUS_PRESETS[preset][variant]
}
