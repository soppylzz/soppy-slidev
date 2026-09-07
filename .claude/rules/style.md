# Style Standards (UnoCSS / Tailwind)

How to write styling for components, layouts, and slide content. Styling goes through the **UnoCSS** pipeline Slidev already runs (Tailwind-compatible preset + `@apply` transformer + PostCSS nesting).

## Core rule

Write styling with **UnoCSS utility classes, reusing Tailwind-compatible class names directly** whenever a class expresses the intent. Hand-written CSS is the exception, only for what a single utility cannot express (grid-area scaffolding, gradient/background stacks, per-feature tokens).

Order of preference:

1. **Utility classes in the template / markup** — `flex`, `grid`, `gap-8`, `w-72 h-48`, `justify-center`, `text-2xl`, arbitrary values when needed (`text-[1.1rem]`).
2. **`@apply`** inside a `styles/*.css` file when the same compound of utilities repeats on a structural selector — see `base.css` / `frame.css`, which apply a skeleton then override with plain properties below.
3. **Bare CSS** only for what utilities and `@apply` cannot reach (custom properties, `background` stacks, `grid-template-areas`), kept next to its selector in the same file.

## Where CSS lives

- **Never put static component styling in an SFC `<style>` block.** A component's real style belongs in a per-feature file `styles/<feature>.css`, registered in `styles/index.ts`, whose import order is the cascade order (shared tokens first in `vars.css`, then per-feature files).
- Dynamic, per-instance geometry (measured sizes, transforms, palette pick) is written from `<script setup>` into an inline `:style` binding — this is the sanctioned exception, because those values cannot be static CSS.

## Class naming

- **BEM with the `soppy` block prefix** — element with `__`, modifier with `--`:

```html
<div class="soppy-carousel">
  <div class="soppy-carousel__viewport">
    <button class="soppy-carousel__dot soppy-carousel__dot--active" />
  </div>
</div>
```

- Never build elements with bare hyphens (`soppy-cells-header` is wrong; it is `soppy-cells__header`).
- Modifiers are usually generated from a prop/state via template string or boolean object:
  `:class="`soppy-carousel--${direction}`"` / `:class="{ 'soppy-carousel__dot--active': active }"`.
- Theme-owned primitives prefix their block with the brand (`cqupt-cover`, `.slidev-layout.cqupt-cover`).

## Tokens & colors

- Design tokens are CSS custom properties under `--soppy-*`, centralized in `styles/vars.css` (paddings `--soppy-layout-pad`, component sizes, overlay color). Reference them as `var(--soppy-*)`; don't scatter raw values.
- Colors must switch with light/dark (`colorSchema: both`): use CSS variables / `color-mix()` / palette constants, never hard-coded hex inside a component's static rules. The per-instance palette lookups (`TAPE_COLORS`, `PIN_COLORS` in `useColor.ts`) are data, resolved through a `--soppy-*` variable at runtime.

## Scoping

- Global CSS reaches the presenter UI too — scope selectors under `.slidev-layout` and `.soppy-*` blocks, never bare element/global selectors.
- Layouts and components keep their skeleton self-contained: when two layouts share an identical skeleton (`@apply absolute inset-0 grid overflow-hidden`), each writes its own rather than merging across layouts — a readable single-file layout beats cross-layout dedup (see `cells.css`, `frame.css`).
- Duplicate declarations *within* one layout (position variants of the same grid) may be merged into shared selectors.

## Checklist when reviewing style

- [ ] Utilities / `@apply` used where a Tailwind-compatible class exists — no hand-rolled `position: absolute; display: grid;`.
- [ ] Component styling is in `styles/*.css`, imported by `styles/index.ts`; SFC `<style>` is absent.
- [ ] Classes are BEM `soppy-*`: block `soppy-x`, element `soppy-x__y`, modifier `soppy-x--z`; no bare-hyphen elements.
- [ ] Tokens and palette are `--soppy-*` variables / data-driven, not scattered literals.
- [ ] Selectors are scoped under `.slidev-layout` / `.soppy-*`.
- [ ] Dark/light-safe (no fixed-context colors) and print/export-safe (no animation-dependent visibility).
