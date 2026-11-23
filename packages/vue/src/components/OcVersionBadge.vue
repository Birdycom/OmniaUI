<!-- File: packages/vue/src/components/OcVersionBadge.vue | Map: kind -> span.oc-badge-version | -mdi -->
<script setup lang="ts">
/** The small "since v0.17.0" pill next to a title. kind: version (since which version, green), mdi (which version of an icon set). */
withDefaults(defineProps<{ kind?: 'version' | 'mdi' }>(), { kind: 'version' })
</script>

<template>
  <span :class="kind === 'mdi' ? 'oc-badge-version-mdi' : 'oc-badge-version'"><slot /></span>
</template>
