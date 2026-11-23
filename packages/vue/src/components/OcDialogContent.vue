<script setup lang="ts">
/**
 * The <dialog class="oc-modal"> of the compound OcDialog (0.17.0), opened with showModal() from the OcDialog state; Esc,
 * backdrop and the × button close it. size: sm | md | lg | xl | full. scroll: header and footer stay, OcDialogBody scrolls.
 * close-button (default true), close-label, close-round. Classes: .oc-modal, .oc-modal-content(--size, --scroll), .oc-modal-close
 */
import { computed, inject, ref } from 'vue'
import { dialogKey } from '../composables/keys-d3'
import { useDialog } from '../composables/useDialog'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closedby?: 'any' | 'closerequest' | 'none'
    closeButton?: boolean
    closeLabel?: string
    closeRound?: boolean
    scroll?: boolean
    /** Class of the inner .oc-modal-content (class goes to the <dialog>). */
    contentClass?: string
  }>(),
  { size: 'md', closedby: 'any', closeButton: true, closeLabel: 'Close' },
)
const ctx = inject(dialogKey, null)
const fallback = ref(false)
const open = computed({
  get: () => (ctx ? ctx.open.value : fallback.value),
  set: (v: boolean) => (ctx ? ctx.setOpen(v) : (fallback.value = v)),
})
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const close = () => (open.value = false)
function onClick(e: MouseEvent) {
  if (props.closedby === 'any' && e.target === e.currentTarget) close()
}
</script>

<template>
  <dialog
    :id="ctx?.contentId"
    ref="el"
    class="oc-modal"
    :closedby="closedby"
    :aria-labelledby="ctx?.titleId"
    :aria-describedby="ctx?.descriptionId"
    @click="onClick"
    @close="onClose"
  >
    <div :class="['oc-modal-content', size !== 'md' && `oc-modal-content--${size}`, scroll && 'oc-modal-content--scroll', contentClass]">
      <button v-if="closeButton" :class="['oc-modal-close', closeRound && 'oc-close--round']" type="button" :aria-label="closeLabel" @click="close">&times;</button>
      <slot :close="close" />
    </div>
  </dialog>
</template>
