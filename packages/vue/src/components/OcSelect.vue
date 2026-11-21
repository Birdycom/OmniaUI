<script setup lang="ts">
/**
 * Native select. v-model. Pass `options` (strings or { value, label }) or <option> elements in the default slot.
 * 0.17.0: `variant="ledger"` (.oc-select--ledger) and `module` (data-module).
 */
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
defineProps<{ options?: (string | SelectOption)[]; variant?: 'ledger'; module?: string }>()
const model = defineModel<any>()
</script>

<template>
  <select v-model="model" :class="['oc-select', variant === 'ledger' && 'oc-select--ledger']" :data-module="module">
    <slot>
      <template v-for="o in options" :key="typeof o === 'string' ? o : o.value">
        <option v-if="typeof o === 'string'" :value="o">{{ o }}</option>
        <option v-else :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      </template>
    </slot>
  </select>
</template>
