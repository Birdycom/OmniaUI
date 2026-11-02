<!-- File: packages/vue/src/components/OcRating.vue | Map: props -> clamped score -> star bar -->
<script setup lang="ts">
/** Stars of a score (same markup as snippets/rating.html): halves and decimals, any number of stars. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ value: number; max?: number; size?: 'sm' | 'md' | 'lg'; label?: string }>(), { max: 5, size: 'md' })
const score = computed(() => Math.max(0, Math.min(props.max, props.value)))
</script>

<template>
  <span
    :class="['oc-rating', size !== 'md' && `oc-rating--${size}`]"
    :style="{ '--oc-rating': String(score), ...(max !== 5 ? { '--oc-rating-max': String(max) } : {}) }"
    role="img"
    :aria-label="label ?? `${score} out of ${max}`"
  ></span>
</template>
