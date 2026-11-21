<script setup lang="ts">
/**
 * One-time code field drawn as separate cells on a single real input.
 * v-model: the code string. `length` sets maxlength and --oc-otp-length. `invalid` sets aria-invalid.
 * Emits `complete` with the code when it reaches `length`, after the v-model update has rendered (flush: 'post'), so a
 * parent that submits from @complete already holds the full code. `fit`: cells shrink with the parent; `group`: a divider after
 * every n cells (4: "ABCD EFGH").
 */
import { computed, watch } from 'vue'

const props = withDefaults(defineProps<{ length?: number; invalid?: boolean; numeric?: boolean; fit?: boolean; group?: number }>(), {
  length: 6,
  numeric: true,
})
const emit = defineEmits<{ complete: [code: string] }>()
const model = defineModel<string>({ default: '' })
const style = computed(() => ({ '--oc-otp-length': String(props.length), ...(props.group ? { '--oc-otp-group': String(props.group) } : {}) }))

watch(model, (code) => {
  if (code && code.length === props.length) emit('complete', code)
}, { flush: 'post' })
</script>

<template>
  <input
    v-model="model"
    :class="['oc-otp', fit && 'oc-otp--fit', group && 'oc-otp--group']"
    type="text"
    :inputmode="numeric ? 'numeric' : 'text'"
    autocomplete="one-time-code"
    :maxlength="length"
    :pattern="numeric ? '[0-9]*' : undefined"
    :aria-invalid="invalid ? 'true' : undefined"
    :style="style"
  />
</template>
