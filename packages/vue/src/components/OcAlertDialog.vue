<script setup lang="ts">
/**
 * Confirmation modal with a status icon. v-model:open. Emits `confirm` / `cancel` (both close the dialog).
 * Slots: icon, title, default (message), footer (scoped: { close }).
 * Classes: .oc-alert-dialog(--success/--error/--warning/--info/--question), .oc-alert-dialog-icon
 */
import { computed, ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{
    type?: 'success' | 'error' | 'warning' | 'info' | 'question'
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    /** Third action at the start of the footer ("Don't save", .oc-alert-dialog-discard); emits `discard` and closes. */
    discardLabel?: string
    /** Variant of the confirm button; defaults to destructive for warning/error. */
    confirmVariant?: 'default' | 'destructive' | 'success'
    /** A close button (×) in the corner; also shown when closeRound or close-class is set. */
    closeButton?: boolean
    closeLabel?: string
    /** Round close button (.oc-close--round). */
    closeRound?: boolean
    /** Extra class on the close button. */
    closeClass?: string
  }>(),
  { type: 'warning', confirmLabel: 'Confirm', cancelLabel: 'Cancel', closeLabel: 'Close' },
)
const emit = defineEmits<{ confirm: []; cancel: []; discard: [] }>()
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const titleId = useUid('oc-alert-dialog-title')
const textId = `${titleId}-text`

const glyphs = { success: '✓', error: '×', warning: '!', info: 'i', question: '?' } as const
const variant = computed(() => props.confirmVariant ?? (props.type === 'warning' || props.type === 'error' ? 'destructive' : 'default'))
const close = () => (open.value = false)

function confirm() {
  emit('confirm')
  close()
}
function cancel() {
  emit('cancel')
  close()
}
function discard() {
  emit('discard')
  close()
}
</script>

<template>
  <dialog
    ref="el"
    class="oc-modal"
    closedby="closerequest"
    role="alertdialog"
    :aria-labelledby="titleId"
    :aria-describedby="textId"
    @close="onClose"
  >
    <div :class="['oc-modal-content', 'oc-modal-content--sm', 'oc-alert-dialog', `oc-alert-dialog--${type}`]">
      <button v-if="closeButton || closeRound || closeClass" :class="['oc-alert-dialog-close', closeRound && 'oc-close--round', closeClass]" type="button" :aria-label="closeLabel" @click="cancel">&times;</button>
      <span class="oc-alert-dialog-icon" aria-hidden="true"><slot name="icon">{{ glyphs[type] }}</slot></span>
      <h2 :id="titleId" class="oc-modal-title"><slot name="title">{{ title }}</slot></h2>
      <div :id="textId" class="oc-modal-body"><slot>{{ message }}</slot></div>
      <div class="oc-modal-footer">
        <slot name="footer" :close="close" :confirm="confirm" :cancel="cancel" :discard="discard">
          <button v-if="discardLabel" class="oc-btn oc-btn--ghost oc-alert-dialog-discard" type="button" @click="discard">{{ discardLabel }}</button>
          <button class="oc-btn oc-btn--outline" type="button" @click="cancel">{{ cancelLabel }}</button>
          <button :class="['oc-btn', variant !== 'default' && `oc-btn--${variant}`]" type="button" @click="confirm">{{ confirmLabel }}</button>
        </slot>
      </div>
    </div>
  </dialog>
</template>
