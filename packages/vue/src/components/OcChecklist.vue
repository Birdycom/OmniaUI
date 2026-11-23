<script setup lang="ts">
/**
 * Rule / step list with met and unmet states. Classes: .oc-checklist(--card), .oc-checklist-item.is-done
 * Slots: default (replaces all rows), action (scoped: item) in the card variant.
 * variant="check" (0.17.0): the short showcase list with a check mark before every line (ul.oc-check-list);
 * items may then also be plain strings.
 */
export interface ChecklistItem {
  title: string
  hint?: string
  done?: boolean
}
withDefaults(defineProps<{ items?: (ChecklistItem | string)[]; card?: boolean; label?: string; variant?: 'default' | 'check' }>(), { items: () => [], variant: 'default' })
const text = (item: ChecklistItem | string) => (typeof item === 'string' ? item : item.title)
const row = (item: ChecklistItem | string): ChecklistItem => (typeof item === 'string' ? { title: item } : item)
</script>

<template>
  <ul v-if="variant === 'check'" class="oc-check-list" :aria-label="label">
    <slot>
      <li v-for="(item, i) in items" :key="i">{{ text(item) }}</li>
    </slot>
  </ul>
  <ul v-else :class="['oc-checklist', card && 'oc-checklist--card']" aria-live="polite" :aria-label="label">
    <slot>
      <li v-for="(item, i) in items" :key="i" :class="['oc-checklist-item', row(item).done && 'is-done']">
        <template v-if="card">
          <span class="oc-checklist-text">
            <span class="oc-checklist-title">{{ row(item).title }}</span>
            <span v-if="row(item).hint" class="oc-checklist-hint">{{ row(item).hint }}</span>
          </span>
          <slot name="action" :item="row(item)" />
        </template>
        <template v-else>{{ text(item) }}</template>
      </li>
    </slot>
  </ul>
</template>
