---
layout: rows
section: Primitives
---

# Button

Every semantic type, appearance, size and radius preset. Hover the buttons to feel the derived states — press `d` to flip the theme.

::1::

### Types

<div class="flex flex-wrap items-center gap-3">
  <Button>Default</Button>
  <Button type="primary">Primary</Button>
  <Button type="success">Success</Button>
  <Button type="warning">Warning</Button>
  <Button type="danger">Danger</Button>
  <Button type="info">Info</Button>
</div>

::2::

### Appearances

<div class="flex flex-wrap items-center gap-3">
  <Button type="primary" plain>Plain primary</Button>
  <Button type="danger" plain>Plain danger</Button>
  <Button type="success" text>Text success</Button>
  <Button type="warning" text>Text warning</Button>
  <Button plain>Plain default</Button>
  <Button text>Text default</Button>
</div>

::3::

### Sizes & radius

<div class="flex flex-wrap items-center gap-3">
  <Button type="primary" size="small">Small</Button>
  <Button type="primary">Medium</Button>
  <Button type="primary" size="large">Large</Button>
  <Button type="primary" rounded="sm">Radius sm</Button>
  <Button type="primary" rounded="lg">Radius lg</Button>
  <Button type="primary" rounded="full">Pill</Button>
</div>

::4::

### States

<div class="flex flex-wrap items-center gap-3">
  <Button>Default look</Button>
  <Button disabled>Disabled</Button>
  <Button text disabled>Disabled text</Button>
  <Button type="primary" disabled>Disabled primary</Button>
</div>
