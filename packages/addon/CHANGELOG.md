# @soppy-slidev/addon

## 0.1.2

### Patch Changes

- [`51c89e7`](https://github.com/soppylzz/soppy-slidev/commit/51c89e7d79ed8665ea9ebd609f1f9ba98b1c1b95) Thanks [@soppylzz](https://github.com/soppylzz)! - Add `description`, `repository`, `author` and `license` fields to the package manifests (npm listing metadata).
- Updated dependencies [[`51c89e7`](https://github.com/soppylzz/soppy-slidev/commit/51c89e7d79ed8665ea9ebd609f1f9ba98b1c1b95)]:
  - @soppy-slidev/shared@0.1.2

## 0.1.1

### Patch Changes

- [`b0bd5b3`](https://github.com/soppylzz/soppy-slidev/commit/b0bd5b3173c1df9b70188ba37e67752523e4c884) Thanks [@soppylzz](https://github.com/soppylzz)! - Add English package READMEs for `shared`, `addon` and `cqupt` (shipped on each package's npm listing).
- Updated dependencies [[`b0bd5b3`](https://github.com/soppylzz/soppy-slidev/commit/b0bd5b3173c1df9b70188ba37e67752523e4c884)]:
  - @soppy-slidev/shared@0.1.1

## 0.1.0

### Minor Changes

- [`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531) Thanks [@soppylzz](https://github.com/soppylzz)! - Introduce the reusable soppy component/layout system:

  - Layouts: `rows`, `cols`, `frame`, `jacket` with `position` / `ratio` / `band` props.
  - Components: `button` (type/size/radius/appearance presets + icon sizing), `tooltip`, `carousel`, `preview` (frost-glass mask, inert iframe), `background`, and skeuo decor (`rotate`, `photo`, `picture`, `note`, `tape`, `pin`) with click-range sync.
  - Viewer layer (`view`/`viewFly`) with a `global-top` host.
  - Token-driven styling: `--soppy-*` geometry/colour primitives flip with light/dark; the preset injector is shared for re-skinning.
  - `useSkeuoColor` now uses the shared seeded pick; skeuo paper (note/photo) keeps fixed dark ink in either theme.

### Patch Changes

- [`c94dd9d`](https://github.com/soppylzz/soppy-slidev/commit/c94dd9d0345315179f0248fd5cc512a22c16f22c) Thanks [@soppylzz](https://github.com/soppylzz)! - Icons render from a single-root `<svg>`: the template no longer carries a sibling Font Awesome license comment, so the icon is one element and host `class`/attrs inherit onto it again (a two-root template made Vue drop them on built decks).
- Updated dependencies [[`0ff40d6`](https://github.com/soppylzz/soppy-slidev/commit/0ff40d6380a7b9a6b3b45868bacbd75ec97c0531)]:
  - @soppy-slidev/shared@0.1.0
