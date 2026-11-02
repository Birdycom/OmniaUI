<!-- File: packages/vue/src/components/OcAvatarPicker.vue | Map: props -> preview + file input -> text and buttons -> change event on mount -->
<script setup lang="ts">
/** Avatar or logo picker with a preview, Upload and Remove, and drag and drop. Emits change (File or null) and invalid (File, reason) for a wrong type or a file over maxKb. */
import { onMounted, useId, useTemplateRef } from 'vue'
import { bindAvatarPicker } from '../../../ui/src/form-extras.js'

withDefaults(defineProps<{ initials: string; label?: string; hint?: string; logo?: boolean; name?: string; accept?: string; maxKb?: number }>(), { label: 'Profile picture', logo: false, accept: 'image/*' })
const emit = defineEmits<{ change: [file: File | null]; invalid: [file: File, reason: string] }>()
const id = useId()
const root = useTemplateRef<HTMLDivElement>('root')
onMounted(() => {
  if (!root.value) return
  bindAvatarPicker(root.value)
  root.value.addEventListener('oc-avatar-change', (e) => emit('change', (e as CustomEvent<{ file: File | null }>).detail.file))
  root.value.addEventListener('oc-avatar-invalid', (e) => { const d = (e as CustomEvent<{ file: File; reason: string }>).detail; emit('invalid', d.file, d.reason) })
})
</script>

<template>
  <div ref="root" :class="['oc-avatar-picker', logo && 'oc-avatar-picker--square oc-avatar-picker--logo']" :data-oc-max-kb="maxKb">
    <label class="oc-avatar-picker__preview" :for="id" title="Choose an image">
      <span data-oc-initials>{{ initials }}</span>
      <input :id="id" class="oc-avatar-picker__file" type="file" :accept="accept" :name="name">
    </label>
    <div class="oc-avatar-picker__text">
      <span class="oc-avatar-picker__label">{{ label }}</span>
      <span v-if="hint" class="oc-avatar-picker__hint">{{ hint }}</span>
      <div class="oc-avatar-picker__actions">
        <button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-avatar-upload><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16v-6H5l7-7l7 7h-4v6zm-4 4v-2h14v2z" /></svg>Upload</button>
        <button type="button" class="oc-btn oc-btn--ghost oc-btn--sm" data-oc-avatar-remove><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" /></svg>Remove</button>
      </div>
    </div>
  </div>
</template>
