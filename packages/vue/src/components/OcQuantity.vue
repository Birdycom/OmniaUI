<!-- File: packages/vue/src/components/OcQuantity.vue | Map: v-model number -> minus / input / plus within min, max, step -->
<script setup lang="ts">
/** Minus, number and plus in one frame (same markup as snippets/quantity.html). v-model is the number. */
import { stepQuantity } from '../../../ui/src/form-extras.js'

const props = withDefaults(defineProps<{ min?: number; max?: number; step?: number; size?: 'sm' | 'md'; label?: string; name?: string; id?: string; disabled?: boolean }>(), { min: 0, step: 1, size: 'md', label: 'Quantity' })
const model = defineModel<number>({ default: 1 })
const move = (direction: -1 | 1) => { model.value = stepQuantity(model.value, direction, { min: props.min, max: props.max ?? Infinity, step: props.step }) }
</script>

<template>
  <div :class="['oc-quantity', size === 'sm' && 'oc-quantity--sm']">
    <button class="oc-quantity__step" type="button" :aria-label="`Decrease ${label.toLowerCase()}`" :disabled="disabled || model <= min" @click="move(-1)">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13H5v-2h14z" /></svg>
    </button>
    <input :id="id" v-model.number="model" class="oc-quantity__input" type="number" inputmode="numeric" :name="name" :min="min" :max="max" :step="step" :aria-label="label" :disabled="disabled">
    <button class="oc-quantity__step" type="button" :aria-label="`Increase ${label.toLowerCase()}`" :disabled="disabled || (max != null && model >= max)" @click="move(1)">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
    </button>
  </div>
</template>
