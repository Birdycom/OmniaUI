<script setup lang="ts">
/**
 * Toggle. Inside OcToggleGroup (give it a `value`) it is a label around a radio/checkbox bound to the group's v-model.
 * Standalone: v-model boolean on a label + checkbox, or `button` for a <button aria-pressed>.
 * Pass an aria-label attribute for icon-only toggles (it lands on the input/button).
 * Classes: .oc-toggle(--outline/--sm/--lg/--icon)
 */
import { computed, inject } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'
import { toggleGroupKey } from '../composables/keys'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  value?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  button?: boolean
  disabled?: boolean
}>()
const pressed = defineModel<boolean>({ default: false })
const group = inject(toggleGroupKey, null)
const { root, control } = useAttrsSplit()

const classes = computed(() => [
  'oc-toggle',
  props.variant === 'outline' && 'oc-toggle--outline',
  props.size && props.size !== 'md' && `oc-toggle--${props.size}`,
  props.icon && 'oc-toggle--icon',
])
const inGroup = computed(() => !!group && props.value !== undefined)
const isOn = computed(() => (inGroup.value ? group!.values.value.includes(props.value!) : pressed.value))
function onChange() {
  if (inGroup.value) group!.toggle(props.value!)
  else pressed.value = !pressed.value
}
</script>

<template>
  <button
    v-if="button && !inGroup"
    v-bind="{ ...root, ...control }"
    type="button"
    :class="classes"
    :aria-pressed="pressed ? 'true' : 'false'"
    :disabled="disabled"
    @click="pressed = !pressed"
  >
    <slot />
  </button>
  <label v-else v-bind="root" :class="classes">
    <input
      v-bind="control"
      :type="inGroup && group!.type.value === 'single' ? 'radio' : 'checkbox'"
      :name="inGroup ? group!.name.value : (control.name as string | undefined)"
      :value="value"
      :checked="isOn"
      :disabled="disabled"
      @change="onChange"
    />
    <slot />
  </label>
</template>
