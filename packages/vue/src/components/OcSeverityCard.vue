<!-- File: packages/vue/src/components/OcSeverityCard.vue | Map: details -> summary head (icon, title + tags, level badge) -> body (default slot, actions slot) -->
<script setup lang="ts">
/**
 * Expandable card colored by risk level. v-model:open. Cards with the same `name` open one at a time.
 * Slots: icon, default (body), actions.
 * Classes: details.oc-severity-card(--low/--medium/--high/--critical, .is-resolved), -head, -icon, -main, -title, -tags, -tag, -level, -body, -actions
 */
const props = defineProps<{
  level: 'low' | 'medium' | 'high' | 'critical'
  title: string
  tags?: string[]
  levelLabel?: string
  resolved?: boolean
  name?: string
}>()
const open = defineModel<boolean>('open', { default: false })
const LEVEL_TEXT = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' } as const

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open
}
</script>

<template>
  <details
    :class="['oc-severity-card', `oc-severity-card--${level}`, resolved && 'is-resolved']"
    :name="name"
    :open="open"
    @toggle="onToggle"
  >
    <summary class="oc-severity-card-head">
      <span v-if="$slots.icon" class="oc-severity-card-icon" aria-hidden="true"><slot name="icon" /></span>
      <span class="oc-severity-card-main">
        <span class="oc-severity-card-title">{{ title }}</span>
        <span v-if="tags?.length" class="oc-severity-card-tags">
          <span v-for="t in tags" :key="t" class="oc-severity-card-tag">{{ t }}</span>
        </span>
      </span>
      <span class="oc-severity-card-level">{{ levelLabel ?? LEVEL_TEXT[props.level] }}</span>
    </summary>
    <div class="oc-severity-card-body">
      <slot />
      <div v-if="$slots.actions" class="oc-severity-card-actions"><slot name="actions" /></div>
    </div>
  </details>
</template>
