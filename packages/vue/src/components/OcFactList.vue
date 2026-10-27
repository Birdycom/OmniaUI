<!-- File: packages/vue/src/components/OcFactList.vue | Map: props (items + modifiers) -> dl.oc-fact-list -> div > dt + dd -->
<script setup lang="ts">
/**
 * Key / value product facts (variant of the definition list). Pass `items`, or your own <div><dt><dd> rows in the slot.
 * Classes: .oc-fact-list (--plain, --compact, --stacked, --accent)
 */
export interface FactListRow {
  label: string
  value: string
}
withDefaults(
  defineProps<{
    items?: FactListRow[]
    plain?: boolean
    compact?: boolean
    stacked?: boolean
    accent?: boolean
  }>(),
  { items: () => [] },
)
</script>

<template>
  <dl
    :class="[
      'oc-fact-list',
      plain && 'oc-fact-list--plain',
      compact && 'oc-fact-list--compact',
      stacked && 'oc-fact-list--stacked',
      accent && 'oc-fact-list--accent',
    ]"
  >
    <slot>
      <div v-for="(row, i) in items" :key="i"><dt>{{ row.label }}</dt><dd>{{ row.value }}</dd></div>
    </slot>
  </dl>
</template>
