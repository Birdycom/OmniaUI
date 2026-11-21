<script setup lang="ts">
/**
 * Shared settings for the tooltips inside it (0.17.0): a display: contents wrapper (.oc-tooltip-provider) that sets
 * --oc-tooltip-delay from delay-duration (ms). skip-delay-duration is accepted for API compatibility (CSS tooltips have
 * no shared skip timer). Classes: .oc-tooltip-provider
 */
defineProps<{ delayDuration?: number; skipDelayDuration?: number }>()
</script>

<template>
  <span class="oc-tooltip-provider" :style="delayDuration != null ? { '--oc-tooltip-delay': `${delayDuration}ms` } : undefined"><slot /></span>
</template>
