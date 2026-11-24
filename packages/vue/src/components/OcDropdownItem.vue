<script setup lang="ts">
/**
 * Menu item: <a> with `href`, otherwise <button>. checked (true/false) adds a check column, hint a muted text on the right,
 * icon a webicon name ("mdi:pencil") in front of the label (slot `icon` for any other icon), icon-tone puts it in a soft
 * tinted square, description (or slot `description`) a muted second line under the label.
 * A click closes the popover menu around it; `keep-open` stops that (a check item stays open by default).
 * destructive: a red item (.oc-dropdown-item--destructive); radio (with checked): role menuitemradio.
 * 0.18.0: as-child renders the only slot element (a RouterLink, your own <a>) as the item: it gets the item class, the
 * check column, icon, description and hint around its own text, and a click closes the menu.
 */
import { computed, h, inject } from 'vue'
import type { VNodeArrayChildren } from 'vue'
import OcWebicon from './OcWebicon.vue'
import { SlotChild } from '../composables/asChild'
const props = withDefaults(defineProps<{
  href?: string; checked?: boolean; hint?: string; icon?: string; keepOpen?: boolean
  description?: string; iconTone?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted'
  destructive?: boolean; radio?: boolean; asChild?: boolean
}>(), { checked: undefined, keepOpen: undefined })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const closeToggle = inject<(() => void) | null>('oc-dropdown-close', null)

function onClick(event: MouseEvent) {
  emit('click', event)
  if (event.defaultPrevented || (props.keepOpen ?? props.checked !== undefined)) return
  if (closeToggle) return closeToggle()
  try { (event.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover?.() } catch { /* already closed */ }
}

// as-child: the attributes and the content around the child's own text.
const childBind = computed(() => ({
  class: ['oc-dropdown-item', props.destructive && 'oc-dropdown-item--destructive'],
  role: props.checked !== undefined ? (props.radio ? 'menuitemradio' : 'menuitemcheckbox') : undefined,
  'aria-checked': props.checked !== undefined ? String(props.checked) : undefined,
  onClick,
}))
function fill(own: VNodeArrayChildren): VNodeArrayChildren {
  return [
    props.checked !== undefined ? h('span', { class: 'oc-dropdown-check', 'aria-hidden': 'true' }) : null,
    props.icon ? h('span', { class: ['oc-dropdown-icon', props.iconTone && `oc-dropdown-icon--${props.iconTone}`], 'aria-hidden': 'true' }, [h(OcWebicon, { name: props.icon, bare: true, fallback: 'iconify' })]) : null,
    ...(props.description ? [h('span', { class: 'oc-dropdown-text' }, [h('span', own), h('span', { class: 'oc-dropdown-desc' }, props.description)])] : own),
    props.hint ? h('span', { class: 'oc-dropdown-hint' }, props.hint) : null,
  ]
}
</script>

<template>
  <SlotChild v-if="asChild" v-bind="childBind" :fill="fill"><slot /></SlotChild>
  <component
    v-else
    :is="href ? 'a' : 'button'"
    :class="['oc-dropdown-item', destructive && 'oc-dropdown-item--destructive']"
    :href="href"
    :type="href ? undefined : 'button'"
    :role="checked !== undefined ? (radio ? 'menuitemradio' : 'menuitemcheckbox') : undefined"
    :aria-checked="checked !== undefined ? String(checked) : undefined"
    @click="onClick"
  >
    <span v-if="checked !== undefined" class="oc-dropdown-check" aria-hidden="true"></span>
    <span v-if="icon || $slots.icon" :class="['oc-dropdown-icon', iconTone && `oc-dropdown-icon--${iconTone}`]" aria-hidden="true"><slot name="icon"><OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /></slot></span>
    <span v-if="description || $slots.description" class="oc-dropdown-text"><span><slot /></span><span class="oc-dropdown-desc"><slot name="description">{{ description }}</slot></span></span>
    <slot v-else />
    <span v-if="hint" class="oc-dropdown-hint">{{ hint }}</span>
  </component>
</template>
