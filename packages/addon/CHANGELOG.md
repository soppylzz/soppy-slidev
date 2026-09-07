# @soppy-slidev/addon

## 0.1.0

### Minor Changes

- [`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531) Thanks [@soppylzz](https://github.com/soppylzz)! - Introduce the reusable soppy component/layout system:

  - Layouts: `rows`, `cols`, `frame`, `jacket` with `position` / `ratio` / `band` props.
  - Components: `button` (type/size/radius/appearance presets + icon sizing), `tooltip`, `carousel`, `preview` (frost-glass mask, inert iframe), `background`, and skeuo decor (`rotate`, `photo`, `picture`, `note`, `tape`, `pin`) with click-range sync.
  - Viewer layer (`view`/`viewFly`) with a `global-top` host.
  - Token-driven styling: `--soppy-*` geometry/colour primitives flip with light/dark; the preset injector is shared for re-skinning.
  - `useSkeuoColor` now uses the shared seeded pick; skeuo paper (note/photo) keeps fixed dark ink in either theme.

### Patch Changes

- Updated dependencies [[`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531)]:
  - @soppy-slidev/shared@0.1.0
