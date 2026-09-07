# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pnpm monorepo that builds Soppy's [Slidev](https://sli.dev) v0.52 theme, addon, and shared helpers. The published packages are **consumed as raw TS/Vue source** — there is no `build` step for any package. Slidev resolves the workspace-symlinked package and compiles its `.vue`/`.ts` files itself at dev/build/export time. The only thing ever "built" is a play deck (`slidev build` → static SPA in `plays/cqupt/dist`).

> **State of the repo:** currently a single `WIP: rebuild via vibe prototype` commit. The addon is mid-refactor: `packages/addon/global-top.vue` imports a `View`/`ViewBox`/`ViewFly` viewer system (`stores/view`, `components/viewBox.vue` & `viewFly.vue`, `composables/useViewAnime`, `useViewPreview`) that is specified in `.changeset/view-refactor.md` and demoed in `plays/cqupt/pages/view.md` but is **not yet committed** — expect dangling imports until it lands. Treat `.changeset/*` as the intended roadmap of that refactor.

> **Authoring standards (normative):** `.claude/rules/code.md` (language, naming, dependencies), `.claude/rules/comment.md` (when & how to comment), `.claude/rules/style.md` (UnoCSS / Tailwind styling). Read them before writing code; the sections below describe repo layout and feature mechanics.

## Commands (from repo root)

| Command | What it does |
| --- | --- |
| `pnpm install` | Install; needs pnpm ≥11.18, Node ≥20.12 (`.nvmrc` = 22). Reads version catalog & `allowBuilds` from `pnpm-workspace.yaml`. |
| `pnpm play:cqupt` | Main dev loop. Runs the `plays/cqupt` deck with HMR (`slidev --open`). |
| `pnpm build:cqupt` | Production static build of the play → `plays/cqupt/dist`. |
| `pnpm export:cqupt` | `slidev export` (PDF/PNG/PPTX) — needs `playwright-chromium`, whose postinstall is allow-listed in `pnpm-workspace.yaml`. |
| `pnpm lint` / `pnpm lint:fix` | ESLint flat config (`--max-warnings 0`). |
| `pnpm format` | Prettier write-all. |

No test framework exists. There is **no clean `tsc` pass**: the root `tsconfig.json` is stale — its `paths` maps `@soppy-slidev/shared` to a `./shared` dir that doesn't exist (it moved to `packages/shared`), it `include`s a nonexistent `playground/**`, and running tsc against it also type-checks hoisted `@slidev/*` source and errors on Slidev globals. Don't rely on tsc output as a gate; rely on the ESLint/Prettier hooks and HMR feedback.

## Packages

Workspace globs are `packages/*`, `plays/*`, `docs` (not created yet). `pnpm-workspace.yaml` `catalog:` pins shared versions (`vue`, `vite`, `pinia`, `gsap`, `@vueuse/core`, `@unhead/vue`, and all `@slidev/*` at 52.x). Add a new dependency's version to the catalog rather than hard-coding it.

- **`@soppy-slidev/shared`** — framework-free TS kernel: **no `vue` import, import-safe in every environment (no top-level DOM / Node access)** (`main: src/index.ts`, no build). CSS-normalization helpers (`toCssSpaceUnit`, `toCssSpaceGroup`, `toCssGridRatio`, `toDegree`/`toRadian`), type guards, the shared prop grammar types (`SpaceUnit`, `SpacesGroup`, `Position`, `Direction`, `SoppyClick`, …), scoped `consola`+`chalk` loggers (`createLogger`), and the preset system shared by theme & addon (`SoppyPreset`, `soppyPresetCss`, `applyTheme`). Browser-only utilities are allowed here only if they touch the DOM lazily behind a `typeof document` guard (e.g. `applyTheme`); Vue-bound composables belong in the addon.
- **`@soppy-slidev/addon`** — the actual "soppy" component/layout system, published as a Slidev **addon** (`addons:` in slide frontmatter). Slidev auto-loads its conventional dirs: `layouts/*`, `components/*`, `setup/*`, global styles from `styles/index.ts`, plus the root `global-top.vue` layer. Deps: `@vueuse/core`, `gsap`, `pinia`, `@soppy-slidev/shared`.
- **`@soppy-slidev/cqupt`** — the CQUPT-branded **theme** (`theme:` in frontmatter). Owns its chrome: the `cover` layout and the theme components `campus`/`progress`/`map`/`overview`, with a `cqupt-*` class system and the section store. It **never imports the addon package**: styling reuse is via the addon's `--soppy-*` primitives (consumed in `styles/*.css`), component reuse via Slidev's global registry (e.g. `<Button>` inside `map.vue`), and a brand preset can be injected through shared `applyTheme`. It leans on the addon for `default` and everything else; `leaflet`/`@maptiler/*` deps are declared for the map component. Its `slidev` package field (`colorSchema`/`clientWidth`) is still to be set.
- **`plays/cqupt`** — private dev/deck harness. `slides.md` enables `theme: @soppy-slidev/cqupt` + `addons: [@soppy-slidev/addon]` and `src:`-includes one markdown file per feature (`addon/*.md`, `map.md`, …). Each page documents its feature in prose — when adding a component/layout, add a demo page here too and `src:`-include it.

## Conventions (how features are built)

Cross-package layout dependency: cqupt/addon → shared. Both cqupt and addon ship an identical `setup/main.ts` that installs Pinia **only if `app.config.globalProperties.$pinia` is absent** — a theme installs it first, and a second `app.use(createPinia())` would clobber the app-wide provide. Keep that guard in any new setup.

The theme never imports the addon package. Reuse happens at runtime so a deck must enable the addon for it to resolve: styles consume the addon's `--soppy-*` primitives and BEM classes (globally reachable once the addon's `styles/` loads), components resolve through Slidev's global component registry (a theme SFC may use `<Button>` unimported), and overriding the addon's look goes through a preset injected by shared `applyTheme`.

A feature in the addon is usually a **stack of files sharing a name**, e.g. `rotate` = `components/rotate.vue` + `composables/useRotateFit.ts` + a `plays/cqupt/pages/rotate.md` demo. When a feature needs static rules, they go in a same-named `styles/<feature>.css` imported from `styles/index.ts`, which preserves import order. Read `useClick.ts`, `useStyle.ts`, `useRotateFit.ts`, and `utils/rect.ts` before writing geometry/CSS logic — they encode the repeated math.

Patterns to match:

- **Component naming**: `defineOptions({ name: "SoppyXxx" })` on every component/layout (satisfies `vue/multi-word-component-names`). Template PascalCase = same name without prefix (kebab `soppy-xxx` default from file name also works).
- **Class & CSS**: `soppy-` BEM-ish classes; tokens as `--soppy-*` custom properties centralized in `styles/vars.css`. CSS is processed by UnoCSS + PostCSS, so nesting and `@apply` utility classes work (see `packages/cqupt/styles/layouts.css`); scope selectors under `.slidev-layout`/`.soppy-*` — global CSS also reaches presenter UI.
- **Prop grammar** (all typed in `@soppy-slidev/shared`): unitless numbers are treated as **px** (`toCssSpaceUnit`), strings pass through as CSS. `SpaceUnit` = one value, `SpacesGroup` = 1/2/4-value tuple normalized to `padding`/`margin`. `Position` (`top/right/bottom/left`) and `SemiDirection` (`row/column`) select grid axes — don't hand-write axis logic, use the shared guards (`isHorizontal`, …).
- **Clicks**: `SoppyClick` is a single number, an array, or a `"a-b"` range string. Don't call Slidev's click machinery directly — `useClickActive` self-registers a `ClicksInfo` in the slide's `$clicksContext` and returns a reactive active flag (number → that click step; range → its 1-based `[from, to+1]` interval).
- **Motion**: gsap entrance/exit keyed on slide-activation. Gate everything on `isPrintMode` (in print/export, settle at final pose instantly, no tweens) and compose poses from `useRotateFit`, which shrinks/offsets content so the rotated bbox still touches its container (degenerate above ~45° — content then overflows and the height pin releases). Use `useHidden()` for the `is-hidden` class rather than inline display toggling.

## Release & git hygiene

- Husky `pre-commit` runs `lint-staged` (ESLint `--fix` + Prettier); `commit-msg` runs **commitlint** (conventional commits; commits starting `WIP` or `Merge` are allowed through — the current state commit uses `WIP:`).
- Versioning is **changesets** with all three packages **linked** (bumped together). Add a changeset for any user-facing change; `.changeset/config.json` is `access: public` and changelogs to the GitHub repo. Release flow is `pnpm version` (changeset version) then `pnpm release` (changeset publish) — publishes raw source, no build.
- `.npmrc`/`.pnpmrc`: `engine-strict`, `strict-peer-dependencies`, `shamefully-hoist`, `shell-emulator`, and a `vite` override to the catalog. Peer deps must be declared explicitly (`@slidev/*`, `vue`) because of `strict-peer-dependencies`.
- Only `plays/**/*.md` is formatted with `prettier-plugin-slidev` (parser `slidev`) — hand-edit with care and keep prose on one line; the root Prettier config sets `proseWrap: never` for markdown.
