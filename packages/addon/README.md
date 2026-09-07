# @soppy-slidev/addon

The reusable "soppy" component and layout system for [Slidev](https://sli.dev), published as a Slidev **addon**. It is theme-agnostic: styling runs on shared `--soppy-*` design tokens that flip with the deck's light/dark scheme, so any theme can reuse it. It ships as raw TS/Vue source — Slidev compiles the `.vue`/`.ts` files itself, with no build step.

## Install & enable

```bash
pnpm add @soppy-slidev/addon
```

Enable it in `slides.md` frontmatter:

```yaml
---
addons:
  - "@soppy-slidev/addon"
---
```

## What's inside

Slidev auto-loads the addon's conventional directories:

- **Layouts** — `rows`, `cols`, `frame`, `jacket` (with `position` / `ratio` / `band` props) and a `default` base.
- **Components** — interaction primitives and skeuo decor: `button`, `tooltip`, `carousel`, `preview`, `background`, `photo` / `picture` / `note` / `tape` / `pin`, and the `view` viewer stack. Icons live under `components/icons` and register as `SoppyIcon*`.
- **Setup** — installs Pinia only when the app does not already provide it, so a theme can install first.
- **Styles** — the `--soppy-*` token system plus per-feature styles, imported in order by `styles/index.ts`.

Components are referenced from slide markup by their PascalCase name, e.g. `<Rotate>`, `<Photo>` or `<Button>`.

Requires `vue` and the `@slidev/*` packages as peers, and builds on [`@soppy-slidev/shared`](../shared) for its prop grammar and tokens. See [`@soppy-slidev/cqupt`](../cqupt) for a branded consumer and the `plays/cqupt` playground for live demos.
