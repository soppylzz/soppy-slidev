<template>
  <background v-bind="$attrs">
    <div class="slidev-layout cqupt-cover">
      <div class="cqupt-cover__body"><slot /></div>
      <div class="cqupt-cover__footer">
        <CFooter :items="items" />
      </div>
    </div>
  </background>
</template>

<script setup lang="ts">
import { computed } from "vue"
import CFooter from "../components/footer.vue"

defineOptions({ name: "CquptCover" })

type FooterItem = { icon: string; label: string; value: string }

const props = defineProps<{
  items?: FooterItem[]
}>()

// preset base is the DATE row; frontmatter `items` merge by label — a matching
// label replaces that preset row, new labels append after it
const items = computed<FooterItem[]>(() => {
  const preset: FooterItem[] = [
    { icon: "SoppyIconCalendar", label: "DATE", value: new Date().toLocaleDateString() },
  ]
  const overrides = props.items ?? []
  const byLabel = new Map(overrides.map((item) => [item.label, item]))

  const merged = preset.map((item) => byLabel.get(item.label) ?? item)
  const seen = new Set(merged.map((item) => item.label))
  for (const override of overrides) {
    if (seen.has(override.label)) continue
    merged.push(override)
    seen.add(override.label)
  }
  return merged
})
</script>
