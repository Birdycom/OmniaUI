<script setup lang="ts">
/**
 * Divider. Default = <hr>. `vertical` = inline separator for flex rows. `label` (or the default slot) renders the
 * line-text-line form. Classes: .oc-separator(--vertical/--strong), .oc-separator-text
 */
defineProps<{ vertical?: boolean; strong?: boolean; label?: string }>()
</script>

<template>
  <div v-if="label || $slots.default" class="oc-separator-text" role="separator"><span><slot>{{ label }}</slot></span></div>
  <span
    v-else-if="vertical"
    :class="['oc-separator', 'oc-separator--vertical', strong && 'oc-separator--strong']"
    role="separator"
    aria-orientation="vertical"
  ></span>
  <hr v-else :class="['oc-separator', strong && 'oc-separator--strong']" />
</template>
