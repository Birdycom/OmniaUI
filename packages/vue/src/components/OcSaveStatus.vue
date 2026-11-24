<!-- File: packages/vue/src/components/OcSaveStatus.vue | Map: state -> tone + text -> OcStatus (aria-live) -->
<script setup lang="ts">
/** Save state of an editor (0.17.0): saving | saved | dirty | error | offline, with its dot, announced politely.
 *  `labels` for another language (a label may hold {count}), `savedAt` shows the time of the last save on the right.
 *  0.18.0 sync indicator: states queued (with `count`) and online; `compact` shows only the dot (text for screen readers + title). */
import { computed } from 'vue'
import OcStatus from './OcStatus.vue'
import OcStatusDot from './OcStatusDot.vue'

type SaveState = 'saving' | 'saved' | 'dirty' | 'error' | 'offline' | 'queued' | 'online'
const props = defineProps<{ state: SaveState; labels?: Partial<Record<SaveState, string>>; savedAt?: Date | string | number; count?: number; compact?: boolean }>()
const TONE = { saving: 'working', saved: 'done', dirty: 'waiting', error: 'error', offline: 'idle', queued: 'waiting', online: 'done' } as const
const EN: Record<SaveState, string> = { saving: 'Saving…', saved: 'Saved', dirty: 'Unsaved changes', error: 'Not saved', offline: 'Offline: changes are kept on this device', queued: 'Waiting to sync', online: 'Online' }
const text = computed(() => {
  const own = props.labels?.[props.state]
  if (own != null) return own.replace('{count}', String(props.count ?? 0))
  if (props.state === 'queued' && props.count != null) return `${props.count} ${props.count === 1 ? 'change' : 'changes'} waiting to sync`
  return EN[props.state]
})
const time = computed(() => (props.savedAt != null ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(props.savedAt)) : undefined))
</script>

<template>
  <p v-if="compact" class="oc-status oc-status--compact" role="status" aria-live="polite" :data-state="state" :title="text">
    <OcStatusDot :tone="TONE[state]" />
    <span v-if="state === 'queued' && count" class="oc-status__count" aria-hidden="true">{{ count }}</span>
    <span class="oc-status__text">{{ text }}</span>
  </p>
  <OcStatus v-else :tone="TONE[state]" :meta="time" role="status" aria-live="polite" :data-state="state">{{ text }}</OcStatus>
</template>
