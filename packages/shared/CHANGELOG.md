# @soppy-slidev/shared

## 0.1.0

### Minor Changes

- [`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531) Thanks [@soppylzz](https://github.com/soppylzz)! - Introduce the shared kernel consumed by both the addon and the theme:

  - Prop grammar and type guards (`SpaceUnit`, `SpacesGroup`, `Position`, `Corner`, `PresetSize`, `SoppyClick`, …) with CSS/space normalizers.
  - Design-token preset system (`SoppyPreset`, `soppyPresetCss`) plus a DOM-guarded `applyTheme` injector.
  - `scatter` / `pickBySeed` for deterministic per-instance seeded selection (skeuo colors, random scenes).
  - Scoped `consola`/`chalk` loggers.
