<script setup lang="ts">
/**
 * File upload target: a label around a real file input. v-model: File[].
 * .is-dragover is toggled while dragging over. Slots: icon, default (text), hint.
 */
import { ref } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'

defineOptions({ inheritAttrs: false })
defineProps<{ accept?: string; multiple?: boolean; disabled?: boolean; hint?: string }>()
const model = defineModel<File[]>({ default: () => [] })
const { root, control } = useAttrsSplit()
const dragover = ref(false)

function onChange(e: Event) {
  model.value = Array.from((e.target as HTMLInputElement).files ?? [])
}
function onDrop() {
  dragover.value = false
}
</script>

<template>
  <label
    v-bind="root"
    :class="['oc-dropzone', dragover && 'is-dragover']"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop="onDrop"
  >
    <input v-bind="control" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange" />
    <span v-if="$slots.icon" class="oc-dropzone-icon" aria-hidden="true"><slot name="icon" /></span>
    <span><slot /></span>
    <span v-if="hint || $slots.hint" class="oc-dropzone-hint"><slot name="hint">{{ hint }}</slot></span>
  </label>
</template>
