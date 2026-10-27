<script setup lang="ts">
/**
 * Side panel on a native <dialog>. v-model:open. Slots: header (replaces title + description),
 * default (body), footer (scoped: { close }). Classes: dialog.oc-sheet(--left/--top/--bottom),
 * .oc-sheet-content(--wide), -header, -title, -description, -body, -footer, -close.
 */
import { ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    side?: 'right' | 'left' | 'top' | 'bottom'
    wide?: boolean
    title?: string
    description?: string
    closeLabel?: string
  }>(),
  { side: 'right', closeLabel: 'Close' },
)
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const titleId = useUid('oc-sheet-title')
const close = () => (open.value = false)
defineExpose({ close })
</script>

<template>
  <dialog
    ref="el"
    :class="['oc-sheet', side !== 'right' && `oc-sheet--${side}`]"
    closedby="any"
    :aria-labelledby="title ? titleId : undefined"
    @close="onClose"
  >
    <div :class="['oc-sheet-content', wide && 'oc-sheet-content--wide']">
      <button class="oc-sheet-close" type="button" :aria-label="closeLabel" @click="close">&times;</button>
      <div v-if="title || description || $slots.header" class="oc-sheet-header">
        <slot name="header">
          <h2 v-if="title" :id="titleId" class="oc-sheet-title">{{ title }}</h2>
          <p v-if="description" class="oc-sheet-description">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots.default" class="oc-sheet-body"><slot /></div>
      <div v-if="$slots.footer" class="oc-sheet-footer"><slot name="footer" :close="close" /></div>
    </div>
  </dialog>
</template>
