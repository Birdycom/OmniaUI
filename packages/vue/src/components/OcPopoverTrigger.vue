<script setup lang="ts">
/**
 * Trigger of the compound OcPopover (0.17.0): an outline OcButton with popovertarget (so it is also the implicit anchor),
 * or with as-child the only element in the default slot (it must be a <button>). Classes: .oc-btn
 */
import { computed, inject, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { popoverKey } from '../composables/keys-d3'
import { SlotChild } from '../composables/asChild'
import OcButton from './OcButton.vue'

withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'
    /** Merge the trigger into the only slot element (a <button>) instead of rendering one. */
    asChild?: boolean
  }>(),
  { variant: 'outline' },
)
const ctx = inject(popoverKey, null)
const btn = ref<ComponentPublicInstance | null>(null)
watch(btn, (b) => { if (ctx) ctx.triggerEl.value = (b?.$el as HTMLElement | undefined) ?? null })
const bind = computed(() => ({
  popovertarget: ctx?.contentId,
  'aria-haspopup': 'dialog',
  'aria-expanded': ctx?.open.value ? 'true' : 'false',
  'aria-controls': ctx?.contentId,
}))
</script>

<template>
  <SlotChild v-if="asChild" v-bind="bind"><slot /></SlotChild>
  <OcButton v-else ref="btn" :variant="variant" v-bind="bind"><slot /></OcButton>
</template>
