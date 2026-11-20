<!-- File: packages/vue/src/components/OcBadgeSource.vue | Map: kind -> span.oc-badge-source | -file | -scss -->
<script setup lang="ts">
/** Small pill that says where a piece comes from. kind: source (component, teal), file (path, purple), scss (stylesheet, orange). */
withDefaults(defineProps<{ kind?: 'source' | 'file' | 'scss' }>(), { kind: 'source' })
</script>

<template>
  <span :class="kind === 'source' ? 'oc-badge-source' : `oc-badge-source-${kind}`"><slot /></span>
</template>
