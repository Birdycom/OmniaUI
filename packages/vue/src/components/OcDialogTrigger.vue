<script setup lang="ts">
/**
 * Opens the compound OcDialog (0.17.0): an OcButton (variant, default 'default'), or with as-child the only element in the
 * default slot gets the click and the aria attributes. Classes: .oc-btn
 */
import { computed, inject } from 'vue'
import { dialogKey } from '../composables/keys-d3'
import { SlotChild } from '../composables/asChild'
import OcButton from './OcButton.vue'

withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success'
    /** Merge the trigger into the only slot element instead of rendering a button. */
    asChild?: boolean
  }>(),
  { variant: 'default' },
)
const ctx = inject(dialogKey, null)
const bind = computed(() => ({
  'aria-haspopup': 'dialog',
  'aria-expanded': ctx?.open.value ? 'true' : 'false',
  'aria-controls': ctx?.contentId,
  onClick: (e: MouseEvent) => { if (!e.defaultPrevented) ctx?.setOpen(true) },
}))
</script>

<template>
  <SlotChild v-if="asChild" v-bind="bind"><slot /></SlotChild>
  <OcButton v-else :variant="variant" v-bind="bind"><slot /></OcButton>
</template>
