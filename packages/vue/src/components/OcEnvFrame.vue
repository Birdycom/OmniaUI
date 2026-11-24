<!-- File: packages/vue/src/components/OcEnvFrame.vue | Map: props -> div.oc-env-frame[data-mode] -->
<script setup lang="ts">
/** 0.18.0: a colored line around the viewport in the mode color (test | live | staging | offline); pointer-events: none.
 *  contained: inside a container (position: relative) instead of the viewport. Say the mode in text too (OcModeBadge). */
defineProps<{ mode: 'test' | 'live' | 'staging' | 'offline'; contained?: boolean }>()
</script>

<template>
  <div :class="['oc-env-frame', contained && 'oc-env-frame--contained']" :data-mode="mode" aria-hidden="true"></div>
</template>
