<script setup lang="ts">
/**
 * Chips with remove buttons and a free-text input with suggestions. v-model: string[].
 * Enter or comma adds the typed tag, Backspace on an empty input removes the last one.
 * Classes: .oc-tag, .oc-tag-remove, .oc-tag-input, .oc-tag-suggestions
 */
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    suggestions?: string[]
    placeholder?: string
    label?: string
  }>(),
  { suggestions: () => [], placeholder: 'Add tag...', label: 'Add tag' },
)
const tags = defineModel<string[]>({ default: () => [] })
const draft = ref('')
const available = computed(() => props.suggestions.filter((s) => !tags.value.includes(s)))

function add(value: string) {
  const tag = value.trim()
  if (tag && !tags.value.includes(tag)) tags.value = [...tags.value, tag]
  draft.value = ''
}
function remove(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add(draft.value)
  } else if (e.key === 'Backspace' && !draft.value && tags.value.length) {
    tags.value = tags.value.slice(0, -1)
  }
}
</script>

<template>
  <div class="oc-tag-input">
    <span v-for="tag in tags" :key="tag" class="oc-tag">
      {{ tag }}
      <button class="oc-tag-remove" type="button" :aria-label="`Remove ${tag}`" @click="remove(tag)">&times;</button>
    </span>
    <input v-model="draft" type="text" :placeholder="placeholder" :aria-label="label" @keydown="onKeydown" />
  </div>
  <div v-if="available.length" class="oc-tag-suggestions">
    <button v-for="s in available" :key="s" type="button" @click="add(s)">{{ s }}</button>
  </div>
</template>
