<script setup lang="ts">
/**
 * Dropdown menu on the popover attribute + anchor positioning. The trigger is the `trigger` slot
 * (scoped: { id }) or a default outline button showing `label`. Default slot = menu content
 * (OcDropdownLabel / OcDropdownItem / OcDropdownSeparator). Attributes land on the menu element.
 */
import { useAttrs } from 'vue'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
defineProps<{ label?: string }>()
const attrs = useAttrs()
const id = (attrs.id as string | undefined) ?? useUid('oc-menu')
</script>

<template>
  <slot name="trigger" :id="id">
    <button class="oc-btn oc-btn--outline" type="button" :popovertarget="id">{{ label }}</button>
  </slot>
  <div v-bind="attrs" :id="id" class="oc-dropdown-menu" popover>
    <slot />
  </div>
</template>
