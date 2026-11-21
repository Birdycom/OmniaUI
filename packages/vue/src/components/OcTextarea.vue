<script setup lang="ts">
/** Multi-line input (uses .oc-input). v-model. 0.17.0: `variant="ledger"` (.oc-textarea--ledger) and `module` (data-module). */
defineProps<{ error?: boolean; variant?: 'ledger'; module?: string }>()
const model = defineModel<string>()
</script>

<template>
  <textarea
    v-model="model"
    :class="['oc-input', error && 'oc-input--error', variant === 'ledger' && 'oc-textarea--ledger']"
    :aria-invalid="error ? 'true' : undefined"
    :data-module="module"
  ></textarea>
</template>
