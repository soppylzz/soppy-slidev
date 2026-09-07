# Code Standards

Authoring rules for the TypeScript / Vue source in this monorepo. Complementary to `CLAUDE.md` (repo layout & Soppy feature mechanics), `comment.md` (when to comment), and `style.md` (UnoCSS / Tailwind styling).

## 1. Language & runtime

- **TypeScript**, written as if `strict` is on: annotate what is not inferable, no `any` by default, no untyped escapes at module boundaries.
- **Vue 3** SFCs in `<script setup lang="ts">`. No Options API, no mixins, no `this`-based state.
- Packages are consumed as **raw source** by Slidev (no build step). Code must compile inside Slidev's own pipeline: avoid Node-only APIs and never `import` a type as a value.
- **Framework-free logic goes to `@soppy-slidev/shared`** — no `vue` runtime import, and import-safe in every environment: no top-level DOM/Node access. Browser utilities that touch the DOM lazily behind a `typeof document` guard may live there (e.g. `applyTheme`); Vue-bound primitives (components, DOM-touching composables) belong in `@soppy-slidev/addon`.

Formatting baseline (already enforced by Prettier/ESLint hooks): no semicolons, double quotes, `tabWidth: 2`, `printWidth: 100`, trailing comma `es5`.

## 2. File naming

| File kind | Convention | Example |
| --- | --- | --- |
| Vue component / layout / icon (`.vue`) | camelCase, no hyphens, no `Soppy` prefix — the filename is an internal handle | `baseCells.vue`, `viewBox.vue`, `rotate.vue`, `icons/chevron.vue` |
| Slidev layout | camelCase; **the filename is the `layout:` id** in frontmatter | `default.vue`, `cols.vue`, `frame.vue`, `jacket.vue` |
| TS module / composable / util / store | camelCase | `rect.ts`, `useClick.ts`, `stores/view.ts` |
| CSS feature file | kebab-case, imported by `styles/index.ts` | `base.css`, `frame.css`, `vars.css` |
| Slide pages under `plays/*/pages` | lowercase kebab | `cover.md`, `rotate.md` |

## 3. Registered (public) component names

- Every component and layout opens its `<script setup>` with `defineOptions({ name: "SoppyXxx" })` — this is the component's **stable design-system name** (and satisfies `vue/multi-word-component-names`). Icons use `SoppyIconXxx`.
- The `Soppy`/`Cqupt` prefix belongs to the *registered name*, never to the filename. Theme-owned components use the theme prefix (`CquptCover` in `packages/cqupt`).
- Soppy name and filename stem should match (`button.vue` ⇄ `SoppyButton`); legacy files that predate a consistent pairing (e.g. `baseCells.vue` declaring `SoppyCells`) are kept as-is — new code follows the pairing.
- Components are referenced from slide markup by their PascalCase/kebab name (Slidev resolves from the file): `<Rotate>`, `<View>`, `<base-cells>`.

## 4. Identifier naming

| Kind | Case / shape | Examples |
| --- | --- | --- |
| Variable, local, param | camelCase, named for what it holds (no bare `el`, `data`, `list`) | `restingPose`, `cellNames`, `viewBoxRef` |
| DOM template ref | camelCase + `El` suffix | `boxEl`, `fitEl`, `decorEl`, `viewportEl` |
| Component instance ref | camelCase + `Ref`, typed via `InstanceType` | `viewBoxRef = ref<InstanceType<typeof ViewBox>>()` |
| Function | camelCase, verb-first phrase that states the action | `readRect`, `playEntrance`, `markReady`, `killTween` |
| Predicate / boolean | `is` / `has` / `can` prefix | `isHorizontal`, `isPin`, `isPrintMode`, `hasInjectionContext` |
| Event handler | `on` + event | `onPointerEnter`, `onMounted` |
| Composable | `use` + noun of the domain it owns | `useClickActive`, `useRotateFit`, `useColor`, `useSpaceProp` |
| Prop | camelCase in script; kebab-case in templates / frontmatter | `mainPadding` ⇄ `main-padding` |
| Computed | noun phrase describing the derived value | `restingPose`, `shown`, `kindStyl` |
| Type / interface / enum | PascalCase | `Rect`, `Pose`, `DecorKinds` |
| Kind-selecting type alias | PascalCase + `Type` suffix | `SpaceUnitType`, `SpacesGroupType` |
| Slide-facing public type | `Soppy` prefix | `SoppyClick`, `SoppyAnimationStage` |
| Enum member | lowercase string equal to its value | `DecorKinds.tape = "tape"`, `DecorKinds.pin = "pin"` |
| Exported / static constant | UPPER_SNAKE_CASE | `TAPE_COLORS`, `PIN_COLORS`, `EMPTY_OBJ`, `ROTATE_INJECTION_KEY` |
| Module-local RegExp / private cache | camelCase | `degreeReg`, `spaceUnitReg`, `seq` |

Guidance behind the rows:

- **Enums are for runtime groupings only.** When a value exists purely as a type-level choice, use a string-literal union in `@soppy-slidev/shared` (`SpaceUnit`, `Position`, `SemiDirection`) instead of an enum. Reach for an enum when code must iterate / switch on members (`DecorKinds` drives decor rendering).
- **Constants.** Module-level, exported semantic values (palettes, injection keys, frozen shared objects) are UPPER_SNAKE. Inline magic numbers inside a setup that carry meaning may be lifted to UPPER_SNAKE locals (`RISE`, `TILT` in `rotate.vue`); RegExp literals and derived private state stay camelCase.
- **Provide/inject** keys are a module-level constant typed `InjectionKey<...>` with a `soppy-*` symbol string (`ROTATE_INJECTION_KEY`).
- **Props** are declared with the type-literal generic `defineProps<{ ... }>()`; defaults via `withDefaults`. Object/array defaults must be factory functions — `() => [1, 1]` — never shared references, and callers do not `??`-fallback a prop that has a default.

## 5. Imports

- Values and types come from their owning package. Pure type imports use `import type`; mixed imports use the inline `type` modifier: `import { toDegree, type SoppyClick } from "@soppy-slidev/shared"`.
- Group imports: external runtime (`vue`, `@vueuse/core`, `gsap`, `pinia`) → `@slidev/*` → `@soppy-slidev/shared` → relative paths (Prettier/ESLint reorder mechanically where configured; keep new imports in that order).
- Workspace packages are consumed **by package name only** — never by a deep relative file path across packages (`import ... from "@soppy-slidev/shared"`).

## 6. Third-party packages

New packages are added only after confirmation; version them in the `pnpm-workspace.yaml` `catalog:` and declare explicit peer deps (`vue`, `@slidev/*`) — never hard-code versions in a `package.json`.

| Package | Usage convention |
| --- | --- |
| `vue` | Import runtime APIs explicitly from `"vue"`. Never reach into `@vue/runtime-*` internals. |
| `@vueuse/core` | **Reuse before reimplementing** (event listeners, intervals, pointer swipe, etc.), with explicit named imports: `import { useEventListener } from "@vueuse/core"`. |
| `gsap` | Motion only. Default import `import gsap from "gsap"`; reference its types through the `gsap` namespace (`gsap.TweenVars`). Always gate on `isPrintMode` and guard in export/print. |
| `pinia` | Setup-style stores in `stores/<domain>.ts` named `useXxxStore`. **Last resort for state:** if the data is slide/navigation state, prefer Slidev's `useNav` / provide-inject first. A theme and an addon may each install Pinia — the guard in `setup/main.ts` prevents the second install. |
| `@slidev/client` | Framework context: `useNav`, `useIsSlideActive`, `useSlideContext`. Code must not assume a live navigation context; behave in print/export and fall back gracefully. |
| `@slidev/types` | Types only (`defineAppSetup`, `ClicksContext`, `ClicksInfo`). |
| `@soppy-slidev/shared` | Normalizers, guards, grammar types, loggers, and the preset system (`SoppyPreset`/`soppyPresetCss`/`applyTheme`). Geometry/space/angle math lives here when reusable. Import-safe everywhere (no top-level DOM); guarded DOM helpers are the exception. |

## 7. SFC structure & component idiom

- Order inside a SFC: `<template>` → `<script setup lang="ts">` → `<style>` (styles rarely belong in components — see `style.md`).
- `<script setup>` opens with `defineOptions({ name })`, then `defineProps`/`withDefaults`, then state → derived (`computed`) → logic functions → lifecycle hooks.
- Static presentation is done with class names; only *dynamic geometry / per-instance variables* are written to an inline `:style` binding (transforms, measured sizes, `--soppy-*` custom properties).
- Destroy what you create: add/remove DOM listeners and `ResizeObserver`s in matching lifecycle hooks, kill gsap tweens before re-settling.
- Public slide-facing grammar types (`SpaceUnit`, `Position`, `SoppyClick`, …) come from `@soppy-slidev/shared` — reuse the shared guards (`isHorizontal`, …) instead of re-deriving axis logic.

## 8. Source references

Local clones to mirror when unsure how upstream behaves:

- Vue core — `~/code/reference/core-latest` (reactivity, runtime-core, compiler).
- Slidev — `~/code/reference/slidev` (client composables, click context, theme/addon loading).
- Previous soppy prototype — `~/code/reference/soppy-slidev-proto` (naming and feature history this repo is rebuilt from).
