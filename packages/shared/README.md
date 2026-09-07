# @soppy-slidev/shared

Framework-free TypeScript kernel shared by [`@soppy-slidev/addon`](../addon) and [`@soppy-slidev/cqupt`](../cqupt). It never imports `vue` and touches no DOM at module scope, so it is safe to import from any environment. Like every package in this repo it ships as raw TS source — Slidev compiles it, there is no build step.

Everything is exported from `src/index.ts`, grouped into a few concerns:

- **Grammar & guards** — the shared prop types (`SpaceUnit`, `SpacesGroup`, `Position`, `Direction`, `SemiDirection`, `SoppyClick`, …) and the guards that pick layout axes (`isHorizontal`, …).
- **CSS / space normalizers** — `toCssSpaceUnit`, `toCssSpaceGroup`, `toCssGridRatio`, `toDegree` / `toRadian`, … .
- **Design-token presets** — `SoppyPreset`, `soppyPresetCss` and a DOM-guarded `applyTheme`, used to re-skin the addon's `--soppy-*` primitives.
- **Seeded pick** — `pickBySeed` / `scatter` for deterministic per-instance selection (skeuo colors, random scenes).
- **Logging** — scoped `consola`/`chalk` loggers through `createLogger`.

## Usage

The addon and theme depend on it, so most decks never install it directly. To opt in:

```bash
pnpm add @soppy-slidev/shared
```

```ts
import { toCssSpaceUnit, isHorizontal } from "@soppy-slidev/shared"
```

Keep this package free of `vue` runtime imports and of top-level browser/Node access; browser-only helpers must guard DOM access behind a `typeof document` check.
