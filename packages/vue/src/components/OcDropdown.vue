<script setup lang="ts">
/**
 * Dropdown menu on the popover attribute + anchor positioning. The trigger is the `trigger` slot
 * (scoped: { id }) or a default outline button showing `label`. Default slot = menu content
 * (OcDropdownLabel / OcDropdownItem / OcDropdownSeparator / OcDropdownSub). Attributes land on the menu element.
 * mode="toggle": your own state instead of the popover (.oc-dropdown + .is-open, v-model:open); the menu stays in the page
 * and closes on an item click, an outside click and Esc. The trigger slot then gets { id, open, toggle }.
 */
import { onBeforeUnmount, provide, ref, useAttrs, watch } from 'vue'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ label?: string; mode?: 'popover' | 'toggle'; wrapperClass?: string }>(), { mode: 'popover' })
const open = defineModel<boolean>('open', { default: false })
const attrs = useAttrs()
const id = (attrs.id as string | undefined) ?? useUid('oc-menu')
const wrap = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
// A popover menu inside a toggle menu closes itself, not the outer one.
provide('oc-dropdown-close', props.mode === 'toggle' ? close : null)

const outside = (e: PointerEvent) => {
  if (!wrap.value?.contains(e.target as Node)) close()
}
const esc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}
function unlisten() {
  if (typeof document === 'undefined') return
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('keydown', esc)
}
watch(
  open,
  (value) => {
    unlisten()
    if (props.mode !== 'toggle' || !value || typeof document === 'undefined') return
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', esc)
  },
  { immediate: true },
)
onBeforeUnmount(unlisten)
</script>

<template>
  <div v-if="mode === 'toggle'" ref="wrap" :class="['oc-dropdown', open && 'is-open', wrapperClass]">
    <slot name="trigger" :id="id" :open="open" :toggle="toggle">
      <button class="oc-btn oc-btn--outline" type="button" :aria-expanded="open" :aria-controls="id" @click="toggle">{{ label }}</button>
    </slot>
    <div v-bind="attrs" :id="id" class="oc-dropdown-menu">
      <slot />
    </div>
  </div>
  <template v-else>
    <slot name="trigger" :id="id">
      <button class="oc-btn oc-btn--outline" type="button" :popovertarget="id">{{ label }}</button>
    </slot>
    <div v-bind="attrs" :id="id" class="oc-dropdown-menu" popover>
      <slot />
    </div>
  </template>
</template>
