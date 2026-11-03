<script setup lang="ts">
/** Menu item: <a> with `href`, otherwise <button>. checked (true/false) adds a check column, hint a muted text on the right. */
withDefaults(defineProps<{ href?: string; checked?: boolean; hint?: string }>(), { checked: undefined })
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="oc-dropdown-item"
    :href="href"
    :type="href ? undefined : 'button'"
    :role="checked !== undefined ? 'menuitemcheckbox' : undefined"
    :aria-checked="checked !== undefined ? String(checked) : undefined"
  >
    <span v-if="checked !== undefined" class="oc-dropdown-check" aria-hidden="true"></span>
    <slot />
    <span v-if="hint" class="oc-dropdown-hint">{{ hint }}</span>
  </component>
</template>
