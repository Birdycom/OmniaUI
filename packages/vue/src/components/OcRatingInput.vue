<!-- File: packages/vue/src/components/OcRatingInput.vue | Map: v-model (1–5) -> fieldset with five star radios -->
<script setup lang="ts">
/** Five radio buttons drawn as stars (same markup as snippets/rating.html); v-model is 0 (none) to 5. */
import { useUid } from '../composables/useUid'

const props = withDefaults(defineProps<{ name?: string; legend?: string; size?: 'sm' | 'md' | 'lg'; disabled?: boolean }>(), { legend: 'Rating', size: 'md' })
const model = defineModel<number>({ default: 0 })
const group = props.name ?? useUid('oc-rating')
const text = (n: number) => (n === 1 ? '1 star' : `${n} stars`)
</script>

<template>
  <fieldset :class="['oc-rating-input', size !== 'md' && `oc-rating-input--${size}`]" :disabled="disabled">
    <legend>{{ legend }}</legend>
    <label v-for="n in 5" :key="n"><input v-model="model" type="radio" :name="group" :value="n"><span>{{ text(n) }}</span></label>
  </fieldset>
</template>
