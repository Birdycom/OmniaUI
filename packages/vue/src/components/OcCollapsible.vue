<script setup lang="ts">
/** Card-style details/summary section. v-model:open. Slots: icon, title, default (content). Classes: --dense, --plain (no card),
 *  --hint (a tip opened on purpose, lightbulb), meta (pill before the chevron), once (stays open once opened). */
import OcWebicon from './OcWebicon.vue'
const props = defineProps<{ title?: string; dense?: boolean; plain?: boolean; hint?: boolean; meta?: string; once?: boolean }>()
const open = defineModel<boolean>('open', { default: false })

function onToggle(e: Event) {
  const el = e.target as HTMLDetailsElement
  if (props.once && open.value && !el.open) { el.open = true; return }
  open.value = el.open
}
</script>

<template>
  <details :class="['oc-collapsible', dense && 'oc-collapsible--dense', plain && 'oc-collapsible--plain', hint && 'oc-collapsible--hint']" :open="open" @toggle="onToggle">
    <summary>
      <slot name="icon"><span v-if="hint" class="oc-collapsible-icon" aria-hidden="true"><OcWebicon name="mdi:lightbulb-on-outline" bare fallback="iconify" /></span></slot>
      <span class="oc-collapsible-title"><slot name="title">{{ title }}</slot></span>
      <span v-if="meta" class="oc-collapsible-meta">{{ meta }}</span>
    </summary>
    <div class="oc-collapsible-content"><slot /></div>
  </details>
</template>
