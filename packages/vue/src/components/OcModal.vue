<script setup lang="ts">
/**
 * Modal on a native <dialog> opened with showModal(). v-model:open controls it; Esc / backdrop /
 * close() update the model. Slots: header (replaces title + description), default (body),
 * footer (scoped: { close }). Classes: .oc-modal, .oc-modal-content(--sm/--lg/--xl/--full), -header, -title,
 * -description, -body, -footer, -close. close-button / close-round / close-class: the × in the corner (round, own class).
 */
import { ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closedby?: 'any' | 'closerequest' | 'none'
    /** A close button (×) in the corner; also shown when closeRound or close-class is set. */
    closeButton?: boolean
    closeLabel?: string
    /** Round close button (.oc-close--round). */
    closeRound?: boolean
    /** Extra class on the close button. */
    closeClass?: string
  }>(),
  { size: 'md', closedby: 'any', closeLabel: 'Close' },
)
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const titleId = useUid('oc-modal-title')
const close = () => (open.value = false)
defineExpose({ close })
</script>

<template>
  <dialog ref="el" class="oc-modal" :closedby="closedby" :aria-labelledby="title ? titleId : undefined" @close="onClose">
    <div :class="['oc-modal-content', size !== 'md' && `oc-modal-content--${size}`]">
      <button v-if="closeButton || closeRound || closeClass" :class="['oc-modal-close', closeRound && 'oc-close--round', closeClass]" type="button" :aria-label="closeLabel" @click="close">&times;</button>
      <div v-if="title || description || $slots.header" class="oc-modal-header">
        <slot name="header">
          <h2 v-if="title" :id="titleId" class="oc-modal-title">{{ title }}</h2>
          <p v-if="description" class="oc-modal-description">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots.default" class="oc-modal-body"><slot /></div>
      <div v-if="$slots.footer" class="oc-modal-footer"><slot name="footer" :close="close" /></div>
    </div>
  </dialog>
</template>
