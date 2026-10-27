<script setup lang="ts">
/**
 * Checkbox or radio inside a label. v-model: boolean (checkbox), array (checkbox group with `value`)
 * or the selected `value` (radio). Attributes other than class/style go to the input.
 */
import { useAttrsSplit } from '../composables/useAttrsSplit'

defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    type?: 'checkbox' | 'radio'
    value?: unknown
    label?: string
  }>(),
  { type: 'checkbox' },
)
const model = defineModel<any>()
const { root, control } = useAttrsSplit()
</script>

<template>
  <label v-bind="root">
    <input v-bind="control" v-model="model" :class="type === 'radio' ? 'oc-radio' : 'oc-checkbox'" :type="type" :value="value" />
    <slot><template v-if="label"> {{ label }}</template></slot>
  </label>
</template>
