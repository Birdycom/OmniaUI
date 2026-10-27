<script setup lang="ts">
/**
 * Label / value rows in a panel (dl). Pass `rows`, or put your own .oc-dl-row elements in the default slot.
 * Slots: title, description, default (rows), footer.
 */
export interface DefinitionRow {
  term: string
  detail: string
}
withDefaults(
  defineProps<{
    title?: string
    description?: string
    rows?: DefinitionRow[]
    label?: string
  }>(),
  { rows: () => [] },
)
</script>

<template>
  <div class="oc-dl-panel" role="region" :aria-label="label ?? title">
    <h3 v-if="title || $slots.title" class="oc-dl-title"><slot name="title">{{ title }}</slot></h3>
    <p v-if="description || $slots.description" class="oc-dl-description"><slot name="description">{{ description }}</slot></p>
    <dl class="oc-dl">
      <slot>
        <div v-for="(row, i) in rows" :key="i" class="oc-dl-row">
          <dt class="oc-dl-term">{{ row.term }}</dt>
          <dd class="oc-dl-detail">{{ row.detail }}</dd>
        </div>
      </slot>
    </dl>
    <div v-if="$slots.footer" class="oc-dl-footer"><slot name="footer" /></div>
  </div>
</template>
