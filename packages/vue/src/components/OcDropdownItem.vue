<script setup lang="ts">
/**
 * Menu item: <a> with `href`, otherwise <button>. checked (true/false) adds a check column, hint a muted text on the right.
 * A click closes the popover menu around it; `keep-open` stops that (a check item stays open by default).
 */
const props = withDefaults(defineProps<{ href?: string; checked?: boolean; hint?: string; keepOpen?: boolean }>(), { checked: undefined, keepOpen: undefined })
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
    <slot />
    <span v-if="hint" class="oc-dropdown-hint">{{ hint }}</span>
  </component>
</template>
