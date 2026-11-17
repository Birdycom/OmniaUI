<script setup lang="ts">
/**
 * Menu item: <a> with `href`, otherwise <button>. checked (true/false) adds a check column, hint a muted text on the right,
 * icon a webicon name ("mdi:pencil") in front of the label (slot `icon` for any other icon), icon-tone puts it in a soft
 * tinted square, description (or slot `description`) a muted second line under the label.
 * A click closes the popover menu around it; `keep-open` stops that (a check item stays open by default).
 */
import OcWebicon from './OcWebicon.vue'
const props = withDefaults(defineProps<{
  href?: string; checked?: boolean; hint?: string; icon?: string; keepOpen?: boolean
  description?: string; iconTone?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted'
}>(), { checked: undefined, keepOpen: undefined })
const emit = defineEmits<{ click: [event: MouseEvent] }>()

function onClick(event: MouseEvent) {
  emit('click', event)
  if (event.defaultPrevented || (props.keepOpen ?? props.checked !== undefined)) return
  try { (event.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover?.() } catch { /* already closed */ }
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="oc-dropdown-item"
    :href="href"
    :type="href ? undefined : 'button'"
    :role="checked !== undefined ? 'menuitemcheckbox' : undefined"
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
