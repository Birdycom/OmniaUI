<script setup lang="ts">
/** Native color picker next to a hex text input, kept in sync. v-model: color string (#rrggbb). */
withDefaults(defineProps<{ pickerLabel?: string; valueLabel?: string }>(), {
  pickerLabel: 'Pick a color',
  valueLabel: 'Color value',
})
const model = defineModel<string>({ default: '#000000' })
</script>

<template>
  <div class="oc-color-field">
    <input v-model="model" type="color" :aria-label="pickerLabel" />
    <input v-model="model" class="oc-input" type="text" :aria-label="valueLabel" />
  </div>
</template>
