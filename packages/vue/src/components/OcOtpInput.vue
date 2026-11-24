<script setup lang="ts">
/**
 * One-time code field drawn as separate cells on a single real input.
 * v-model: the code string. `length` sets maxlength and --oc-otp-length. `invalid` sets aria-invalid.
 * Emits `complete` with the code when it reaches `length`, after the v-model update has rendered (flush: 'post'), so a
 * parent that submits from @complete already holds the full code. `fit`: cells shrink with the parent; `group`: a divider after
 * every n cells (4: "ABCD EFGH").
 * 0.17.1: `complete` also fires when the v-model arrives complete from outside (also on mount), once per distinct code;
 * the cell the caret is in is marked while the field has focus (bindOtp of form-extras.js).
 * 0.18.0: `block` (full width, the cells share it), `size="lg"` (larger digits), `tiles` (a tile per character with a bar under it).
 */
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { bindOtp } from '../../../ui/src/form-extras.js'

const props = withDefaults(defineProps<{ length?: number; invalid?: boolean; numeric?: boolean; fit?: boolean; group?: number; block?: boolean; size?: 'md' | 'lg'; tiles?: boolean }>(), {
  length: 6,
  numeric: true,
  size: 'md',
})
const emit = defineEmits<{ complete: [code: string] }>()
const model = defineModel<string>({ default: '' })
const style = computed(() => ({ '--oc-otp-length': String(props.length), ...(props.group ? { '--oc-otp-group': String(props.group) } : {}) }))

let fired: string | null = null
watch(model, (code) => {
  if (!code || code.length !== props.length) { fired = null; return }
  if (fired === code) return
  fired = code
  emit('complete', code)
}, { flush: 'post', immediate: true })

const input = useTemplateRef<HTMLInputElement>('input')
let unbind: (() => void) | undefined
onMounted(() => { if (input.value) unbind = bindOtp(input.value) })
onBeforeUnmount(() => unbind?.())
</script>

<template>
  <input
    ref="input"
    v-model="model"
    :class="['oc-otp', fit && 'oc-otp--fit', group && 'oc-otp--group', block && 'oc-otp--block', size === 'lg' && 'oc-otp--lg', tiles && 'oc-otp--tiles']"
    type="text"
    :inputmode="numeric ? 'numeric' : 'text'"
    autocomplete="one-time-code"
    :maxlength="length"
    :pattern="numeric ? '[0-9]*' : undefined"
    :aria-invalid="invalid ? 'true' : undefined"
    :style="style"
  />
</template>
