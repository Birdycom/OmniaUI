<!-- File: packages/vue/src/components/OcConfirmDialog.vue | Map: dialog.oc-modal -> confirm content (close X, icon ring, title) -> form (message, typed field, footer: discard, cancel, confirm) -->
<script setup lang="ts">
/**
 * Confirm variant of the alert dialog. v-model:open. Emits `confirm`, `cancel`, `discard` (all close the dialog).
 * With `confirmWord` the browser blocks the submit until the typed value matches (pattern + required).
 * Slots: icon, title, default (message).
 * Classes: .oc-alert-dialog--confirm, .oc-alert-dialog-close, .oc-alert-dialog-form, .oc-alert-dialog-typed,
 * .oc-alert-dialog-confirm, .oc-alert-dialog-discard
 */
import { ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{
    type?: 'success' | 'error' | 'warning' | 'info' | 'question'
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    discardLabel?: string
    confirmWord?: string
    closeLabel?: string
  }>(),
  { type: 'error', confirmLabel: 'Confirm', cancelLabel: 'Cancel', closeLabel: 'Close' },
)
const emit = defineEmits<{ confirm: []; cancel: []; discard: [] }>()
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const titleId = useUid('oc-confirm-dialog-title')
const textId = `${titleId}-text`
const glyphs = { success: '✓', error: '×', warning: '!', info: 'i', question: '?' } as const

// Every action emits its event, then closes through the model (Vue stays the source of truth).
function done(event: 'confirm' | 'cancel' | 'discard') {
  if (event === 'confirm') emit('confirm')
  else if (event === 'cancel') emit('cancel')
  else emit('discard')
  open.value = false
}
const destructive = () => props.type === 'error'
</script>

<template>
  <dialog ref="el" class="oc-modal" closedby="any" :aria-labelledby="titleId" :aria-describedby="textId" @close="onClose">
    <div :class="['oc-modal-content', 'oc-alert-dialog', `oc-alert-dialog--${type}`, 'oc-alert-dialog--confirm']">
      <button class="oc-alert-dialog-close" type="button" :aria-label="closeLabel" @click="done('cancel')">×</button>
      <span class="oc-alert-dialog-icon" aria-hidden="true"><slot name="icon">{{ glyphs[type] }}</slot></span>
      <h2 :id="titleId" class="oc-modal-title"><slot name="title">{{ title }}</slot></h2>
      <form class="oc-alert-dialog-form" @submit.prevent="done('confirm')">
        <div :id="textId" class="oc-modal-body"><slot>{{ message }}</slot></div>
        <label v-if="confirmWord" class="oc-alert-dialog-typed">
          <span>Type <code>{{ confirmWord }}</code> to confirm</span>
          <input class="oc-input" name="confirm" :pattern="confirmWord" required autocomplete="off" />
        </label>
        <div class="oc-modal-footer">
          <button v-if="discardLabel" class="oc-btn oc-btn--ghost oc-alert-dialog-discard" type="button" @click="done('discard')">{{ discardLabel }}</button>
          <button class="oc-btn oc-btn--outline" type="button" @click="done('cancel')">{{ cancelLabel }}</button>
          <button :class="['oc-btn', destructive() && 'oc-btn--destructive', 'oc-alert-dialog-confirm']" type="submit" value="confirm">{{ confirmLabel }}</button>
        </div>
      </form>
    </div>
  </dialog>
</template>
