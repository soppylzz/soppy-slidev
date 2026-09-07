---
layout: frame
position: top
ratio: [1, 2]
---

# Carousel

A loopable row track with swiper arrows and an indicator pill bar.

::media::
<div class="w-full h-full">
  <Carousel direction="row" :loop="true" indicator>
    <template #1><img draggable="false" class="h-full w-full object-cover" src="https://cover.sli.dev?seed=1"/></template>
    <template #2><img draggable="false" class="h-full w-full object-cover" src="https://cover.sli.dev?seed=2"/></template>
    <template #3><img draggable="false" class="h-full w-full object-cover" src="https://cover.sli.dev?seed=3"/></template>
    <template #4><img draggable="false" class="h-full w-full object-cover" src="https://cover.sli.dev?seed=4"/></template>
  </Carousel>
</div>
