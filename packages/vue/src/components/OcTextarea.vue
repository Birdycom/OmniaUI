<script setup lang="ts">
/** Multi-line input (uses .oc-input). v-model. */
defineProps<{ error?: boolean }>()
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" :class="['oc-input', error && 'oc-input--error']" :aria-invalid="error ? 'true' : undefined"></textarea>
</template>
