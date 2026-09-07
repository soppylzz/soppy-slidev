---
layout: cols
direction: column
cellGap: 1rem
section: Decor
clicks: 5
---

# Rotate · Decor · Viewer

Press → through the track: each print syncs its decor on its own click, step 4 reveals the full set, then cell 1 leaves as its interval ends.

::1::

<div class="relative flex h-full items-center justify-center">
  <div class="h-72 w-56">
    <Picture rotate="-6" click="1-4" src="https://cover.sli.dev?seed=1" caption="interval 1–4" fit="cover" />
  </div>
  <div class="h-1/2 w-4/5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <Note rotate="-5" click="5" bottom-left><p class="m-0">corner curl at click 5</p></Note>
  </div>
</div>

::2::

<div class="flex h-full items-center justify-center">
  <Tape rotate="6.7" click="2" :size="'12rem'" :offset="['1.1rem', '-0.1rem']" color="#9fd3ee" class="block">
    <div class="h-72 w-56">
      <Photo rotate="10" click="2" src="https://cover.sli.dev?seed=2" caption="tape syncs at 2" expandable />
    </div>
  </Tape>
</div>

::3::

<div class="flex w-full h-full items-center justify-center">
  <Pin click="3" :offset="['-5rem', '0.6rem']" color="#e0574f" class="block" size="medium">
    <div class="h-40 w-56">
      <Picture rotate="4" click="3" src="https://cover.sli.dev?seed=3" caption="pin syncs at 3" expandable />
    </div>
  </Pin>
</div>

::4::

<div class="flex h-full items-center justify-center">
  <div class="h-1/2 w-full">
    <Photo rotate="-6" click="4" src="https://cover.sli.dev?seed=4" caption="step 4 — full set" expandable fit="contain" />
  </div>
</div>
