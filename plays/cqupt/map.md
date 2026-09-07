---
layout: cols
section: Map
---

# Map

A MapTiler tile source on a Leaflet canvas. The key resolves `apiKey` prop → `themeConfig.apiKey` → `VITE_API_KEY`. This slide forces an empty key, so the missing-key hint shows instead of tiles.

::1::

<div class="mx-auto h-full w-full max-w-[860px]">
  <Map :center="[29.53, 106.61]" :zoom="14" apiKey="" />
</div>

---
layout: frame
position: right
ratio: [1, 2]
clicks: 3
---

# Markers & clicks

- `v-map` markers can host skeuo content — `<Photo>` / `<Picture>` / `<Note>`; images served from `/assets`.
- `clicks` flies to each focus point on click steps — pair it with `clicks: N`.
- `range` on a marker only shows it inside that zoom band.

::media::

<div class="h-full w-full">
  <Map
    location
    size="small"
    :center="[29.53, 106.61]"
    :zoom="12"
    :clicks="[
      { lat: 29.53, lon: 106.61, zoom: 14 },
      { lat: 29.57, lon: 106.55, zoom: 15 },
      { lat: 29.55, lon: 106.63, zoom: 14 },
    ]"
  >
    <div v-map="{ lat: 29.53, lon: 106.61, range: [11, 17] }">
      <div class="w-44 h-32">
        <Photo padding="0.35rem" rotate="-10" src="/assets/cqupt.jpg" caption="CQUPT" fit="cover" />
      </div>
    </div>
    <div v-map="{ lat: 29.57, lon: 106.55, range: [11, 17] }">
      <div class="w-44 h-32">
        <Picture rotate="12" src="/assets/ciqikou.jpg" caption="Ciqikou" fit="cover" />
      </div>
    </div>
    <div v-map="{ lat: 29.55, lon: 106.63, range: [11, 17] }">
      <div class="w-40">
        <Note rotate="-4" padding="0.75rem" bottomRight>
          <p class="m-0 text-sm">soppy note marker — click 3</p>
        </Note>
      </div>
    </div>
  </Map>
</div>
