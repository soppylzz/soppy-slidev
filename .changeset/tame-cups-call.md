---
"@soppy-slidev/shared": minor
---

Introduce the shared kernel consumed by both the addon and the theme:

- Prop grammar and type guards (`SpaceUnit`, `SpacesGroup`, `Position`, `Corner`, `PresetSize`, `SoppyClick`, …) with CSS/space normalizers.
- Design-token preset system (`SoppyPreset`, `soppyPresetCss`) plus a DOM-guarded `applyTheme` injector.
- `scatter` / `pickBySeed` for deterministic per-instance seeded selection (skeuo colors, random scenes).
- Scoped `consola`/`chalk` loggers.
