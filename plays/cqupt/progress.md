---
layout: rows
section: Nav
clicks: 3
---

# Progress

Mounted from the theme `global-top` — `themeConfig.progress` picks the edge (`bottom` default / `top`) or `false` to opt out. Sections come from `section:` frontmatter on slides.

::1::

<div v-click="1" class="flex h-full flex-col justify-center">
  <p class="font-medium">Badge</p>
  <p class="text-sm opacity-80">
    A built-in campus preset when the badge names one, otherwise plain text — or
    supply a <code>#badge</code> slot for anything custom.
  </p>
</div>

::2::

<div v-click="2" class="flex h-full flex-col justify-center">
  <p class="font-medium">Sections & order</p>
  <p class="text-sm opacity-80">
    Click an item to jump to its section. <code>themeConfig.order</code> numbers
    the items in arabic, chinese or not at all.
  </p>
</div>

::3::

<div v-click="3" class="flex h-full flex-col justify-center">
  <p class="font-medium">Units</p>
  <p class="text-sm opacity-80">
    Each slide counts as 1 plus its <code>clicks</code>; the fill width tracks
    both slides and click steps — press → to walk them.
  </p>
</div>
