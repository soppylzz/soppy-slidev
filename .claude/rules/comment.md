# Comment Standards

When to write comments and how to format them. Written to be read together with `code.md` (naming) — most intent should be carried by names, comments carry only what names cannot.

## Principles

- **Comment WHY and invariants, never WHAT.** A well-named function is its own WHAT; restating its body in prose is noise.
- **Be conservative.** Add a comment only where the code alone leaves a real question: a hidden constraint, a non-obvious algorithm, a surprising ordering, or a workaround. When a name can express the fact, prefer a better name over a comment.
- **Don't write comments that rot**: no references to "used by flow X", "fixed for issue #123", or "#TODO with no context". A comment must stay true as the code evolves, or it will mislead.
- One comment per idea, placed on the line _before_ what it explains — never trailing at line end unless a one-word disambiguation.

## Where comments are warranted (existing hotspots)

- **Geometry / math** whose derivation is not visible in the code: fit formulas, inverse-rotation math, letterboxing (`useRotateFit.ts`, `utils/rect.ts`).
- **Hidden constraints and side effects**: e.g. object/array prop defaults must use a factory so each instance gets its own reference (`frame.vue`); a tween or observer that must be killed; DOM elements that must not be proxied by Vue/Pinia.
- **Ordering / lifecycle coupling**: why something runs in `onMounted`, why a watcher uses `flush: "post"`, why the click info must be registered against the slide's `$clicksContext`.
- **Print/export divergence**: code that intentionally settles instantly when `isPrintMode` instead of animating.
- **Lint-forced workarounds**: if a rule demands something that reads oddly, name the rule: `// fix: vue/multi-word-component-names` (the rule id is the durable reason).
- **Attribution** that must survive (e.g. the Font Awesome license header in icon SVGs).

## Format

- Single-line notes use `//`.
- A multi-line explanation attached to a function or constant uses `/** ... */`. It states the contract or the non-obvious idea, not the parameter list verbatim.
- Keep comment language **English** across the repo.
- HTML comments (`<!-- -->`) inside templates only for license/attribution or a single structural note (rare).

### Section dividers

Only two tiers, used sparingly to mark blocks inside a file — outer between top-level sections, inner for sub-groups of one section:

```css
/* ==================== motion ==================== */

/* =============== fit helpers =============== */
```

Do not invent other divider styles or widths.

## Anti-patterns

```ts
// apply the fit to the target <- restates the next line; delete
// TODO: handle empty state <- no owner / trigger; write when & why or drop
// used by overview and preview pages <- rots as callers change; delete
```

If a future reader could delete the comment and lose nothing, delete it now.
