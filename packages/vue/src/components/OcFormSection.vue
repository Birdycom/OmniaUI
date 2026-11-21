<!-- File: packages/vue/src/components/OcFormSection.vue | Map: props -> details (summary: icon, heading, status) -> fields slot -->
<script setup lang="ts">
/**
 * Collapsible form section. Slots: icon, status, default (the fields). Same `name` on siblings = one open at a time.
 * invalid ("error" | "warning"): your own check found something (edge, also while closed); issues: the count in the header.
 * dense: tighter header and body (.oc-form-section--dense). defaultOpen: open on first render (same as `open`).
 * module (0.17.0): data-module (blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name).
 */
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  title: string; hint?: string; name?: string; open?: boolean
  invalid?: 'error' | 'warning'; issues?: number; issuesLabel?: string
  dense?: boolean; defaultOpen?: boolean; module?: string
}>(), { open: false })
const countLabel = computed(() => props.issuesLabel ?? `${props.issues} ${props.invalid === 'warning' ? 'warning' : 'error'}${props.issues === 1 ? '' : 's'}`)
</script>

<template>
  <details :class="['oc-form-section', dense && 'oc-form-section--dense']" :name="name" :open="open || defaultOpen" :data-issue="invalid" :data-module="module || undefined">
    <summary class="oc-form-section__summary">
      <span class="oc-form-section__icon"><slot name="icon" /></span>
      <span class="oc-form-section__heading">
        <span class="oc-form-section__title">{{ title }}</span>
        <span v-if="hint" class="oc-form-section__hint">{{ hint }}</span>
      </span>
      <span class="oc-form-section__status"><span v-if="invalid && issues" class="oc-form-section__count" role="img" :aria-label="countLabel">{{ issues }}</span><slot name="status" /></span>
    </summary>
    <div class="oc-form-section__body"><slot /></div>
  </details>
</template>
