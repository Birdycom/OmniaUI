<script setup lang="ts">
/**
 * Rule / step list with met and unmet states. Classes: .oc-checklist(--card), .oc-checklist-item.is-done
 * Slots: default (replaces all rows), action (scoped: item) in the card variant.
 */
export interface ChecklistItem {
  title: string
  hint?: string
  done?: boolean
}
withDefaults(defineProps<{ items?: ChecklistItem[]; card?: boolean; label?: string }>(), { items: () => [] })
</script>

<template>
  <ul :class="['oc-checklist', card && 'oc-checklist--card']" aria-live="polite" :aria-label="label">
    <slot>
      <li v-for="(item, i) in items" :key="i" :class="['oc-checklist-item', item.done && 'is-done']">
        <template v-if="card">
          <span class="oc-checklist-text">
            <span class="oc-checklist-title">{{ item.title }}</span>
            <span v-if="item.hint" class="oc-checklist-hint">{{ item.hint }}</span>
          </span>
          <slot name="action" :item="item" />
        </template>
        <template v-else>{{ item.title }}</template>
      </li>
    </slot>
  </ul>
</template>
