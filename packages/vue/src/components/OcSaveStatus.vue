<!-- File: packages/vue/src/components/OcSaveStatus.vue | Map: state -> tone + text -> OcStatus (aria-live) -->
<script setup lang="ts">
/** Save state of an editor (0.17.0): saving | saved | dirty | error | offline, with its dot, announced politely.
 *  `labels` for another language, `savedAt` shows the time of the last save on the right. */
import { computed } from 'vue'
import OcStatus from './OcStatus.vue'

type SaveState = 'saving' | 'saved' | 'dirty' | 'error' | 'offline'
const props = defineProps<{ state: SaveState; labels?: Partial<Record<SaveState, string>>; savedAt?: Date | string | number }>()
const TONE = { saving: 'working', saved: 'done', dirty: 'waiting', error: 'error', offline: 'idle' } as const
const EN: Record<SaveState, string> = { saving: 'Saving…', saved: 'Saved', dirty: 'Unsaved changes', error: 'Not saved', offline: 'Offline: changes are kept on this device' }
const time = computed(() => (props.savedAt != null ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(props.savedAt)) : undefined))
</script>

<template>
  <OcStatus :tone="TONE[state]" :meta="time" role="status" aria-live="polite" :data-state="state">{{ labels?.[state] ?? EN[state] }}</OcStatus>
</template>
