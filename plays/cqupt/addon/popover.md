---
layout: rows
---

# Tooltip

Hover any trigger — the popover flips and clamps inside the slide viewport.

::1::
<div class="w-full h-full flex items-center justify-center">
<Tooltip position="top"><Button type="primary">Top</Button><template #tooltip>Top placement</template></Tooltip>
</div>

::2::
<div class="w-full h-full flex items-center justify-center">
<Tooltip position="right"><Button>Right</Button><template #tooltip>Right placement</template></Tooltip>
</div>

::3::
<div class="w-full h-full flex items-center justify-center">
<Tooltip position="bottom"><Button type="primary">Bottom</Button><template #tooltip>Bottom placement</template></Tooltip>
</div>

::4::
<div class="w-full h-full flex items-center justify-center">
<Tooltip position="left"><Button>Left</Button><template #tooltip>Left placement</template></Tooltip>
</div>

---
layout: rows
direction: column
---

# Preview

Hover the pills — an offline image card with a frost glass that fades as you hover the media.

::1::
<div class="flex h-full items-center justify-center">
  <Preview href="https://cover.sli.dev?seed=1" src="https://cover.sli.dev?seed=1" title="Soppy demo A" description="A gradient cover card." position="right">
    <Button type="primary">Preview A</Button>
  </Preview>
</div>

::2::
<div class="flex h-full items-center justify-center">
  <Preview href="https://www.wikipedia.org/" title="Wikipedia" description="A live iframe preview of the site." position="left">
    <Button>Preview B</Button>
  </Preview>
</div>
