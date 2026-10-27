<script setup lang="ts">
/**
 * Connected toggles. v-model = array of pressed values (type "multiple", checkbox inputs) or a single value
 * string (type "single", radio inputs). Put OcToggle items with a `value` inside.
 * Classes: .oc-toggle-group(--spaced)
 */
import { computed, provide } from 'vue'
import { useUid } from '../composables/useUid'
import { toggleGroupKey } from '../composables/keys'

const props = withDefaults(defineProps<{ type?: 'single' | 'multiple'; spaced?: boolean; label?: string; name?: string }>(), { type: 'multiple' })
const model = defineModel<string | string[]>()
const uid = useUid('oc-toggle')

const values = computed(() => (Array.isArray(model.value) ? model.value : model.value ? [model.value] : []))
function toggle(value: string) {
  if (props.type === 'single') {
    model.value = value
  } else {
    const list = values.value
    model.value = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }
}
provide(toggleGroupKey, {
  values,
  type: computed(() => props.type),
  name: computed(() => props.name ?? uid),
  toggle,
})
</script>

<template>
  <div
    :class="['oc-toggle-group', spaced && 'oc-toggle-group--spaced']"
    :role="type === 'single' ? 'radiogroup' : 'group'"
    :aria-label="label"
  >
    <slot />
  </div>
</template>
