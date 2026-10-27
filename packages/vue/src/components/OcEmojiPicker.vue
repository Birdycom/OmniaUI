<!-- File: packages/vue/src/components/OcEmojiPicker.vue | Map: props + emit -> trigger button -> popover panel -> groups (label + grid) -->
<script setup lang="ts">
/**
 * Emoji picker on the popover attribute (same markup as snippets/emoji-picker.html).
 * Props: groups ({ label?, emojis[] }[]), inline (always visible, no popover), triggerLabel, label.
 * Emits: select(emoji) and then closes the popover. Slot: trigger (button content, default 🙂).
 * Classes: .oc-emoji-picker(--inline), __trigger, __label, __grid, __item
 */
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{ groups?: { label?: string; emojis: string[] }[]; inline?: boolean; triggerLabel?: string; label?: string }>(),
  {
    groups: () => [
      { label: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😂', '🙂', '😉', '😍', '🤔', '😎', '😢', '😴', '😯', '🥳', '😤', '🤗'] },
      { label: 'Gestures', emojis: ['👍', '👎', '👏', '🙌', '👋', '🙏', '✌️', '💪'] },
      { label: 'Objects', emojis: ['❤️', '⭐', '🔥', '🎉', '✅', '🚀', '💡', '☕'] },
    ],
    triggerLabel: 'Insert emoji',
    label: 'Emoji',
  },
)
const emit = defineEmits<{ select: [emoji: string] }>()
const id = useUid('oc-emoji')

function pick(e: MouseEvent, emoji: string) {
  emit('select', emoji)
  const panel = (e.currentTarget as HTMLElement).closest('[popover]') as (HTMLElement & { hidePopover?: () => void }) | null
  panel?.hidePopover?.()
}
</script>

<template>
  <button v-if="!inline" type="button" class="oc-emoji-picker__trigger" :popovertarget="id" :aria-label="triggerLabel">
    <slot name="trigger">🙂</slot>
  </button>
  <div :id="id" :class="['oc-emoji-picker', inline && 'oc-emoji-picker--inline']" :popover="inline ? undefined : ''" :role="inline ? 'group' : undefined" :aria-label="label">
    <div v-for="(g, gi) in groups" :key="gi">
      <p v-if="g.label" class="oc-emoji-picker__label">{{ g.label }}</p>
      <div class="oc-emoji-picker__grid">
        <button v-for="emoji in g.emojis" :key="emoji" type="button" class="oc-emoji-picker__item" @click="pick($event, emoji)">{{ emoji }}</button>
      </div>
    </div>
  </div>
</template>
