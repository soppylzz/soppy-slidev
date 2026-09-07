/* =============== skeuo palette registry =============== */
export type SoppySkeuoKind = "tape" | "pin" | "note"

export const SKEUO_PALETTES: Record<SoppySkeuoKind, readonly string[]> = {
  tape: ["#f8c6cf", "#ffd0a0", "#ffe189", "#aee0c2", "#9fd3ee", "#c9b9ec", "#c4cdd9", "#e2c7a2"],
  pin: ["#e0574f", "#f08a41", "#edbb35", "#3aa97b", "#3c93d2", "#8f6ed0", "#6f7d8e", "#3a424f"],
  note: ["#fdf6d8", "#fde8e8", "#e3f0fb", "#e6f5e6", "#f3e8fd"],
}

const skeuoOverrides = new Map<SoppySkeuoKind, readonly string[]>()

export function registerSkeuoPalette(kind: SoppySkeuoKind, colors: readonly string[]): void {
  if (!colors.length) throw new Error(`registerSkeuoPalette("${kind}"): palette must not be empty`)
  skeuoOverrides.set(kind, colors)
}

export function resolveSkeuoPalette(kind: SoppySkeuoKind): readonly string[] {
  return skeuoOverrides.get(kind) ?? SKEUO_PALETTES[kind]
}

/* =============== theme preset =============== */
export type SoppyPresetTheme = "light" | "dark"
export type SoppyPresetVars = Record<string, string>

export interface SoppyPreset {
  light: Readonly<SoppyPresetVars>
  dark?: Readonly<SoppyPresetVars>
}

export function createSoppyPreset(input: {
  light: SoppyPresetVars
  dark?: SoppyPresetVars
}): SoppyPreset {
  return {
    light: sanitizeVars(input.light),
    ...(input.dark ? { dark: sanitizeVars(input.dark) } : {}),
  }
}

function sanitizeVars(vars: SoppyPresetVars): Readonly<SoppyPresetVars> {
  const out: SoppyPresetVars = {}
  for (const [name, value] of Object.entries(vars)) {
    if (!name.startsWith("--soppy-"))
      throw new Error(`createSoppyPreset: "${name}" is not a --soppy-* variable`)
    const css = value.trim()
    if (css) out[name] = css
  }
  return Object.freeze(out)
}

/** render a preset to css for a <style> block; default selectors `:root` / `html.dark` */
export function soppyPresetCss(
  preset: SoppyPreset,
  selectors: { light?: string; dark?: string } = {}
): string {
  const blocks: string[] = []
  pushRule(blocks, selectors.light ?? ":root", preset.light)
  if (preset.dark) pushRule(blocks, selectors.dark ?? "html.dark", preset.dark)
  return blocks.join("\n")
}

function pushRule(blocks: string[], selector: string, vars: Readonly<SoppyPresetVars>): void {
  const body = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
  if (body) blocks.push(`${selector} {\n${body}\n}`)
}

/* =============== preset DOM application =============== */
// shared stays import-safe outside a DOM: the style element is only touched at
// call time, and the call is a no-op where no document exists (SSR / Node)
const PRESET_STYLE_ATTR = "data-soppy-preset"

/** Apply `preset` as one `<style data-soppy-preset>` (rewrites on re-call); returns a dispose fn */
export function applyTheme(preset: SoppyPreset, parent?: ParentNode): () => void {
  if (typeof document === "undefined") return () => {}

  const root = parent ?? document.head
  let style = root.querySelector<HTMLStyleElement>(`style[${PRESET_STYLE_ATTR}]`)
  if (!style) {
    style = document.createElement("style")
    style.setAttribute(PRESET_STYLE_ATTR, "")
    root.appendChild(style)
  }
  style.textContent = soppyPresetCss(preset)

  return () => style?.remove()
}
