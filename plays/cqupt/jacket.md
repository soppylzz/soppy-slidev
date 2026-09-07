---
layout: jacket
band: left
progress: false
---

# Jacket · Scene band

The addon `jacket` left layout with a random `Scene` filling its `::band::` — `merge` fades the image into the content side via `--soppy-scene-bg`.

- Images come from `assets/cqupt` unless `themeConfig.scene` / `images` overrides them.
- `Scene` alone picks per-instance; pass `src` to fix one.

::band::

<div class="relative h-full w-15rem flex justify-center items-center">
  <Scene class="absolute bottom-0 h-1/2 z-9" merge position="top" />
  <div class="z-10" style="writing-mode: vertical-lr">
    <h1 class="ml-1">CQUPT · SCENE</h1>
    <p>random scene bg</p>
  </div>
</div>

---
layout: jacket
band: section
progress: false
---

<div class="w-full flex flex-col items-center">
  <Campus class="mb-1.2rem" preset="cqupt" variant="badge" size="medium"/>
  <h1>Jacket · Section</h1>
  <p>jacket section divider</p>
</div>
