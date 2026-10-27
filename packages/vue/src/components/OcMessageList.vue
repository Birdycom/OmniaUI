<!-- File: packages/vue/src/components/OcMessageList.vue | Map: props + demo conversation -> .oc-message-list -> dividers and OcMessage rows -->
<script setup lang="ts">
/**
 * Column of messages and dividers (snippets/message.html). items: (MessageData | { divider, system? })[]; demo conversation
 * when empty; slot default replaces them. log = role="log" (default true). Emits: action(name, message, index).
 * Classes: .oc-message-list, .oc-message-divider(--system)
 */
import OcMessage, { type MessageData } from './OcMessage.vue'

export type MessageListItem = MessageData | { divider: string; system?: boolean }
withDefaults(defineProps<{ items?: MessageListItem[]; log?: boolean; label?: string }>(), {
  log: true,
  label: 'Conversation with Lisa Verbeke',
  items: () => [
    { divider: 'Tuesday 14 October' },
    { sender: 'Lisa Verbeke', avatar: 'LV', time: '09:12', datetime: '2026-10-14T09:12', label: 'Lisa Verbeke, 09:12', text: 'Morning Tom! The worktop supplier sent two samples for Villa Dewitte.' },
    {
      sender: 'Lisa Verbeke', avatar: 'LV', time: '09:13', datetime: '2026-10-14T09:13', label: 'Lisa Verbeke, 09:13', continued: true, id: 'oc-message-demo-question',
      html: '<p>Which finish should we order?</p><ul><li><strong>Calacatta</strong> matt, 20 mm</li><li><strong>Nero Marquina</strong> polished, 12 mm</li></ul><p>Details are on the <a href="#supplier-sheet">supplier sheet</a>.</p>',
    },
    {
      direction: 'out', avatar: 'TP', time: '09:20', datetime: '2026-10-14T09:20', label: 'You, 09:20', status: 'read', statusIcon: true,
      quote: { href: '#oc-message-demo-question', sender: 'Lisa Verbeke', text: 'Which finish should we order? Calacatta matt, 20 mm or Nero Marquina polished, 12 mm' },
      text: 'Calacatta matt. The client wants the lighter look next to the oak fronts.',
      actions: [{ name: 'reply', label: 'Reply to this message' }, { name: 'delete', label: 'Delete this message', destructive: true }],
    },
    { divider: 'Lisa Verbeke marked this question as answered', system: true },
  ],
})
const emit = defineEmits<{ action: [name: string, message: MessageData, index: number] }>()
const isDivider = (item: MessageListItem): item is { divider: string; system?: boolean } => 'divider' in item
</script>

<template>
  <div class="oc-message-list" :role="log ? 'log' : undefined" :aria-label="log ? label : undefined">
    <slot>
      <template v-for="(item, i) in items" :key="i">
        <div v-if="isDivider(item)" :class="['oc-message-divider', item.system && 'oc-message-divider--system']" :role="item.system ? 'note' : undefined"><span>{{ item.divider }}</span></div>
        <OcMessage v-else v-bind="item" @action="(name: string) => emit('action', name, item as MessageData, i)" />
      </template>
    </slot>
  </div>
</template>
