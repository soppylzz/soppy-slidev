# @soppy-slidev/cqupt

## 0.1.0

### Minor Changes

- [`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531) Thanks [@soppylzz](https://github.com/soppylzz)! - Introduce the CQUPT-branded theme layer:

  - `cover` layout with a newsprint footer (`items` merge by label, `#default` content area) and an absolute footer strip.
  - `campus` component with bundled logo/badge presets and `variant` / `size` / custom `logo`/`badge` props.
  - `scene` component + `useRandomScene` for a jacket `#band` background: pick from `themeConfig.scene` or bundled `assets/cqupt` scenes, with optional `merge` gradient (`--soppy-scene-bg`).
  - `progress` global chrome (mounted via the theme `global-top`) driven by `themeConfig.progress` / `order` / `badge`, with per-slide `progress: false` opt-out and layout-extra-pad integration.
  - `overview` newsprint table-of-contents fed by `section:` frontmatter.
  - `map` component: MapTiler/Leaflet with light/dark tile switching, wheel-zoom smoothing, `v-map` markers (zoom `range` gating, skeuo content support), locate and corner-positioned controls.
  - Theme config (`themeConfig`) with defaults, `resolveAssetUrl` for user assets, and font roles wired to the loaded web fonts.

### Patch Changes

- Updated dependencies [[`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531)]:
  - @soppy-slidev/shared@0.1.0
