<script setup lang="ts">
/** Text input. v-model. `error` sets .oc-input--error + aria-invalid. Any native attribute falls through. */
defineProps<{ error?: boolean }>()
const model = defineModel<string | number>()
</script>

<template>
  <input v-model="model" :class="['oc-input', error && 'oc-input--error']" :aria-invalid="error ? 'true' : undefined" />
</template>
