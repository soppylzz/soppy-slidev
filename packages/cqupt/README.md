# @soppy-slidev/cqupt

The CQUPT-branded [Slidev](https://sli.dev) **theme** built on the [`@soppy-slidev/addon`](../addon) component system. It owns the deck chrome — a newsprint cover/footer, section progress bar, overview table of contents, campus presets and a MapTiler/Leaflet map — and styles it with a `cqupt-*` layer over the addon's `--soppy-*` primitives. It ships as raw TS/Vue source; there is no build step.

## Install & enable

```bash
pnpm add @soppy-slidev/cqupt @soppy-slidev/addon
```

```yaml
---
theme: "@soppy-slidev/cqupt"
addons:
  - "@soppy-slidev/addon"
themeConfig:
  badge: cqupt
  order: arabic
  progress: bottom
---
```

The theme never imports the addon package at build time, so a deck must enable the addon for theme components and the shared styles to resolve.

## Chrome

- **`cover` layout** — title area with a footer whose `items` (icon / label / value rows) merge by label; icons come from the addon (`SoppyIcon*`).
- **`progress` / `overview`** — section-aware chrome driven by `section:` frontmatter and `themeConfig`.
- **`campus` / `scene`** — bundled logo/badge presets and jacket band scenes.
- **`map`** — a MapTiler/Leaflet layer with `v-map` markers; needs an API key resolved from the `apiKey` prop → `themeConfig.apiKey` → the `VITE_API_KEY` env var.

## Development

See the monorepo root README and the `plays/cqupt` playground, deployed to <https://slidev.soppylzz.com>.
