<script setup lang="ts">
/**
 * Radio item inside OcDropdownRadioGroup (0.17.2): an OcDropdownItem with radio and checked from the group's v-model.
 * value: what this item stands for. Other props (icon, hint, description, keep-open, href ...) pass through to OcDropdownItem.
 */
import { inject } from 'vue'
import type { ComputedRef } from 'vue'
import OcDropdownItem from './OcDropdownItem.vue'
const props = defineProps<{ value: string }>()
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const group = inject<{ value: ComputedRef<string | undefined>; select: (value: string) => void } | null>('oc-dropdown-radio', null)

function onClick(event: MouseEvent) {
  emit('click', event)
  if (!event.defaultPrevented) group?.select(props.value)
}
</script>

<template>
  <OcDropdownItem radio :checked="group?.value.value === value" :data-value="value" @click="onClick">
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <slot />
  </OcDropdownItem>
</template>
