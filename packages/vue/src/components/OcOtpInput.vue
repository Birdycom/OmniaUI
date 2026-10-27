<script setup lang="ts">
/**
 * One-time code field drawn as separate cells on a single real input.
 * v-model: the code string. `length` sets maxlength and --oc-otp-length. `invalid` sets aria-invalid.
 * Emits `complete` with the code when it reaches `length`.
 */
import { computed, watch } from 'vue'

const props = withDefaults(defineProps<{ length?: number; invalid?: boolean; numeric?: boolean }>(), {
  length: 6,
  numeric: true,
})
const emit = defineEmits<{ complete: [code: string] }>()
const model = defineModel<string>({ default: '' })
const style = computed(() => ({ '--oc-otp-length': String(props.length) }))

watch(model, (code) => {
  if (code.length === props.length) emit('complete', code)
})
</script>

<template>
  <input
    v-model="model"
    class="oc-otp"
    type="text"
    :inputmode="numeric ? 'numeric' : 'text'"
    autocomplete="one-time-code"
    :maxlength="length"
    :pattern="numeric ? '[0-9]*' : undefined"
    :aria-invalid="invalid ? 'true' : undefined"
    :style="style"
  />
</template>
