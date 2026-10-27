<script setup lang="ts">
/**
 * One radio. Inside OcRadioGroup it reads and writes the group's v-model; standalone it has its own v-model
 * and needs a `name` attribute. `description` (or `card`, or the group's `card`) renders the bordered card form.
 * Classes: .oc-radio, .oc-radio-item(--card)
 */
import { computed, inject } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'
import { radioGroupKey } from '../composables/keys'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string | number; description?: string; card?: boolean; disabled?: boolean }>()
const own = defineModel<string | number>()
const group = inject(radioGroupKey, null)
const { root, control } = useAttrsSplit()

const checked = computed(() => (group ? group.model.value : own.value) === props.value)
const isCard = computed(() => props.card || !!group?.card.value || !!props.description)
function onChange() {
  if (group) group.model.value = props.value
  else own.value = props.value
}
</script>

<template>
  <label v-bind="root" :class="['oc-radio-item', isCard && 'oc-radio-item--card']">
    <input
      v-bind="control"
      class="oc-radio"
      type="radio"
      :name="group ? group.name.value : (control.name as string | undefined)"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />
    <span v-if="description"><slot /><small>{{ description }}</small></span>
    <slot v-else />
  </label>
</template>
