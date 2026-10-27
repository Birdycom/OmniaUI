<!-- File: packages/vue/src/components/OcToggleField.vue | Map: props + model -> template (label row: text + span.oc-switch) -->
<script setup lang="ts">
/**
 * Settings row: title, description and a switch. v-model: boolean. Slots `label` / `description` override the props.
 * Same markup as packages/ui/snippets/toggle-field.html. class/style on the row, other attributes on the checkbox.
 */
import { useAttrsSplit } from '../composables/useAttrsSplit'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
defineProps<{ label?: string; description?: string; card?: boolean; reverse?: boolean }>()
const model = defineModel<boolean>({ default: false })
const { root, control } = useAttrsSplit()
const descId = useUid('oc-toggle-field')
</script>

<template>
  <label v-bind="root" :class="['oc-toggle-field', card && 'oc-toggle-field--card', reverse && 'oc-toggle-field--reverse']">
    <span class="oc-toggle-field-text">
      <span class="oc-toggle-field-label"><slot name="label">{{ label }}</slot></span>
      <span v-if="description || $slots.description" :id="descId" class="oc-toggle-field-description"><slot name="description">{{ description }}</slot></span>
    </span>
    <span class="oc-switch">
      <input v-bind="control" v-model="model" type="checkbox" role="switch" :aria-describedby="description || $slots.description ? descId : undefined" />
      <span class="oc-switch-track"></span>
    </span>
  </label>
</template>
