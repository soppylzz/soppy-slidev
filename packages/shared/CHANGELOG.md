# @soppy-slidev/shared

## 0.1.2

### Patch Changes

- [`51c89e7`](https://github.com/soppylzz/soppy-slidev/commit/51c89e7d79ed8665ea9ebd609f1f9ba98b1c1b95) Thanks [@soppylzz](https://github.com/soppylzz)! - Add `description`, `repository`, `author` and `license` fields to the package manifests (npm listing metadata).

## 0.1.1

### Patch Changes

- [`b0bd5b3`](https://github.com/soppylzz/soppy-slidev/commit/b0bd5b3173c1df9b70188ba37e67752523e4c884) Thanks [@soppylzz](https://github.com/soppylzz)! - Add English package READMEs for `shared`, `addon` and `cqupt` (shipped on each package's npm listing).

## 0.1.0

### Minor Changes

- [`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531) Thanks [@soppylzz](https://github.com/soppylzz)! - Introduce the shared kernel consumed by both the addon and the theme:

  - Prop grammar and type guards (`SpaceUnit`, `SpacesGroup`, `Position`, `Corner`, `PresetSize`, `SoppyClick`, …) with CSS/space normalizers.
  - Design-token preset system (`SoppyPreset`, `soppyPresetCss`) plus a DOM-guarded `applyTheme` injector.
  - `scatter` / `pickBySeed` for deterministic per-instance seeded selection (skeuo colors, random scenes).
  - Scoped `consola`/`chalk` loggers.
