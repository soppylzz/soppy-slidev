---
"@soppy-slidev/addon": patch
---

Icons render from a single-root `<svg>`: the template no longer carries a sibling Font Awesome license comment, so the icon is one element and host `class`/attrs inherit onto it again (a two-root template made Vue drop them on built decks).
