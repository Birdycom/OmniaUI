<!-- File: packages/vue/src/components/OcBusyOverlay.vue | Map: props + model -> <dialog closedby="none"> (spinner or progress, title, text) -->
<script setup lang="ts">
/**
 * Modal "please wait" overlay (same markup as snippets/busy-overlay.html). v-model:open shows it while a long submit or
 * upload runs; the page is inert and Esc does not close it. `progress` (0-100) swaps the spinner for a progress bar.
 * Slot: default (replaces the text). Classes: .oc-busy-overlay __title __text; .oc-spinner / .oc-progress
 */
import { ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'
import OcProgress from './OcProgress.vue'

const props = withDefaults(defineProps<{ title?: string; text?: string; progress?: number; label?: string; id?: string }>(), {
  title: 'Saving…',
  text: 'The photos are being processed. This can take a minute; please keep this page open.',
  label: 'Busy',
})
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const auto = useUid('oc-busy-overlay')
const base = props.id ?? auto
</script>

<template>
  <dialog :id="base" ref="el" class="oc-busy-overlay" closedby="none" :aria-labelledby="`${base}-title`" :aria-describedby="`${base}-text`" @close="onClose">
    <span v-if="progress == null" class="oc-spinner" role="status" :aria-label="label"></span>
    <OcProgress v-else :value="progress" :label="label" />
    <h2 :id="`${base}-title`" class="oc-busy-overlay__title">{{ title }}</h2>
    <p :id="`${base}-text`" class="oc-busy-overlay__text"><slot>{{ text }}</slot></p>
  </dialog>
</template>
