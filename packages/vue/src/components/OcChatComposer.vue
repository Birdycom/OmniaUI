<!-- File: packages/vue/src/components/OcChatComposer.vue | Map: props + v-model -> form -> label + textarea -> bar (tools slot, hint, send) -->
<script setup lang="ts">
/**
 * Chat composer (same markup as snippets/chat-composer.html). v-model = text. Emits send(text) on submit
 * (then clears the field). Enter sends, Shift+Enter adds a line (sendOnEnter, default true).
 * Props: placeholder, label, hint, inline, disabled. Slot: tools (.oc-chat-composer__tool buttons).
 * Classes: .oc-chat-composer(--inline), __input, __bar, __tools, __tool, __hint, __send
 */
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{ placeholder?: string; label?: string; hint?: string; inline?: boolean; sendOnEnter?: boolean; disabled?: boolean }>(),
  { placeholder: 'Write a message…', label: 'Message', sendOnEnter: true },
)
const text = defineModel<string>({ default: '' })
const emit = defineEmits<{ send: [text: string] }>()
const id = useUid('oc-chat')

function submit() {
  if (!text.value.trim() || props.disabled) return
  emit('send', text.value.trim())
  text.value = ''
}
function onKeydown(e: KeyboardEvent) {
  if (props.sendOnEnter && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    ;(e.target as HTMLTextAreaElement).form?.requestSubmit()
  }
}
</script>

<template>
  <form :class="['oc-chat-composer', inline && 'oc-chat-composer--inline']" @submit.prevent="submit">
    <label class="oc-visually-hidden" :for="id">{{ label }}</label>
    <textarea :id="id" v-model="text" class="oc-chat-composer__input" rows="1" :placeholder="placeholder" required :disabled="disabled" @keydown="onKeydown" />
    <div class="oc-chat-composer__bar">
      <div v-if="$slots.tools" class="oc-chat-composer__tools"><slot name="tools" /></div>
      <span v-if="hint" class="oc-chat-composer__hint">{{ hint }}</span>
      <button type="submit" class="oc-chat-composer__send" aria-label="Send" :disabled="disabled">&#10148;</button>
    </div>
  </form>
</template>
