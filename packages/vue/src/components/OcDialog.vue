<script setup lang="ts">
/**
 * Root of the compound dialog (0.17.0): holds the open state (v-model:open, or default-open) for OcDialogTrigger,
 * OcDialogContent, OcDialogTitle, OcDialogDescription and OcDialogClose. Renders no markup of its own.
 * Default slot (scoped: { open, close }).
 */
import { provide, ref, watch } from 'vue'
import { dialogKey } from '../composables/keys-d3'
import { useUid } from '../composables/useUid'

const props = defineProps<{ defaultOpen?: boolean }>()
const open = defineModel<boolean | undefined>('open', { default: undefined })
const inner = ref<boolean>(open.value ?? props.defaultOpen ?? false)
watch(open, (v) => { if (v !== undefined) inner.value = v })
const setOpen = (v: boolean) => {
  inner.value = v
  open.value = v
}
const base = useUid('oc-dialog')
provide(dialogKey, { open: inner, setOpen, contentId: base, titleId: `${base}-title`, descriptionId: `${base}-description` })
const close = () => setOpen(false)
defineExpose({ close, show: () => setOpen(true) })
</script>

<template>
  <slot :open="inner" :close="close" />
</template>
