<script setup lang="ts">
/**
 * Dropdown menu on the popover attribute + anchor positioning. The trigger is the `trigger` slot
 * (scoped: { id }) or a default outline button showing `label`. Default slot = menu content
 * (OcDropdownLabel / OcDropdownItem / OcDropdownSeparator / OcDropdownSub). Attributes land on the menu element.
 * mode="toggle": your own state instead of the popover (.oc-dropdown + .is-open, v-model:open); the menu stays in the page
 * and closes on an item click, an outside click and Esc. The trigger slot then gets { id, open, toggle }.
 * 0.18.0: side (top | right | bottom | left) and align (start | center | end) place the menu (data-side / data-align);
 * trigger-as-child merges popovertarget (or the toggle click) into the only element of the trigger slot, so the slot
 * needs no wiring of its own.
 */
import { computed, onBeforeUnmount, provide, ref, useAttrs, watch } from 'vue'
import { useUid } from '../composables/useUid'
import { SlotChild } from '../composables/asChild'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    label?: string
    mode?: 'popover' | 'toggle'
    wrapperClass?: string
    /** 0.18.0: side of the trigger the menu opens on (default bottom) */
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** 0.18.0: alignment along that side (default start) */
    align?: 'start' | 'center' | 'end'
    /** 0.18.0: merge the trigger wiring into the only element of the trigger slot */
    triggerAsChild?: boolean
  }>(),
  { mode: 'popover' },
)
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
const place = computed(() => (props.side || props.align ? { 'data-side': props.side ?? 'bottom', 'data-align': props.align ?? 'start' } : {}))
const toggleBind = computed(() => ({ 'aria-expanded': open.value ? 'true' : 'false', 'aria-controls': id, onClick: toggle }))
</script>

<template>
  <div v-if="mode === 'toggle'" ref="wrap" :class="['oc-dropdown', open && 'is-open', wrapperClass]">
    <SlotChild v-if="triggerAsChild && $slots.trigger" v-bind="toggleBind"><slot name="trigger" :id="id" :open="open" :toggle="toggle" /></SlotChild>
    <slot v-else name="trigger" :id="id" :open="open" :toggle="toggle">
      <button class="oc-btn oc-btn--outline" type="button" :aria-expanded="open" :aria-controls="id" @click="toggle">{{ label }}</button>
    </slot>
    <div v-bind="{ ...attrs, ...place }" :id="id" class="oc-dropdown-menu">
      <slot />
    </div>
  </div>
  <template v-else>
    <SlotChild v-if="triggerAsChild && $slots.trigger" :popovertarget="id"><slot name="trigger" :id="id" /></SlotChild>
    <slot v-else name="trigger" :id="id">
      <button class="oc-btn oc-btn--outline" type="button" :popovertarget="id">{{ label }}</button>
    </slot>
    <div v-bind="{ ...attrs, ...place }" :id="id" class="oc-dropdown-menu" popover>
      <slot />
    </div>
  </template>
</template>
