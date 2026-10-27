<script setup lang="ts">
/** Native select. v-model. Pass `options` (strings or { value, label }) or <option> elements in the default slot. */
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
defineProps<{ options?: (string | SelectOption)[] }>()
const model = defineModel<any>()
</script>

<template>
  <select v-model="model" class="oc-select">
    <slot>
      <template v-for="o in options" :key="typeof o === 'string' ? o : o.value">
        <option v-if="typeof o === 'string'" :value="o">{{ o }}</option>
        <option v-else :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      </template>
    </slot>
  </select>
</template>
