<!-- File: packages/vue/src/components/OcMessageThread.vue | Map: props + demo -> state (messages, sending) -> header (back slot, heading, people, badge, menu)
     -> scroll (OcMessageList) -> footer (composer slot / form / note) -> busy overlay -->
<script setup lang="ts">
/**
 * Scrolling conversation (same markup as snippets/message-thread.html). Like the snippet script, a sent text is appended as an
 * outgoing bubble after the @send handler (prop onSend, may return a Promise) resolves; aria-busy shows the overlay meanwhile.
 * Ctrl/Cmd + Enter sends. `manual` = you append messages yourself. Emits: menu(name), tool(name).
 * Slots: back (start of the header), composer (replaces the form). Classes: .oc-message-thread(--plain) __header __heading __title
 * __meta __people __actions __icon-btn __scroll __footer __note __busy
 */
import { ref, watch } from 'vue'
import OcMessageList, { type MessageListItem } from './OcMessageList.vue'
import type { MessageData } from './OcMessage.vue'
import { useUid } from '../composables/useUid'

export interface ThreadParticipant { initials: string; name?: string }
export type ThreadMenuItem = { name: string; label: string; destructive?: boolean } | { separator: true }

const props = withDefaults(
  defineProps<{
    title?: string
    project?: string
    meta?: string
    participants?: ThreadParticipant[]
    status?: { label: string; variant?: string } | null
    menu?: ThreadMenuItem[] | null
    messages?: MessageListItem[]
    scrollLabel?: string
    live?: boolean
    busy?: boolean
    /** Overlay title; empty string leaves the overlay out. */
    busyTitle?: string
    busyText?: string
    note?: string
    placeholder?: string
    composerLabel?: string
    inline?: boolean
    tools?: Array<'attach' | 'emoji'>
    hint?: string
    manual?: boolean
    me?: string
    plain?: boolean
    id?: string
    onSend?: (text: string) => void | Promise<void>
  }>(),
  {
    title: 'Kitchen worktop: which finish?',
    project: 'Project 1',
    meta: 'Customer 1 → Customer 6 · 14 Oct 2026',
    participants: () => [{ initials: 'C1', name: 'Customer 1' }, { initials: 'C6', name: 'Customer 6' }],
    status: () => ({ label: 'Urgent', variant: 'destructive' }),
    menu: () => [{ name: 'unread', label: 'Mark as unread' }, { name: 'archive', label: 'Move to archive' }, { separator: true }, { name: 'delete', label: 'Delete conversation', destructive: true }],
    messages: () => [
      { divider: 'Tuesday 14 October' },
      { sender: 'Customer 1', avatar: 'C1', time: '09:12', datetime: '2026-10-14T09:12', text: 'The supplier dropped off two worktop samples at the workshop. Photo attached.',
        attachments: [{ kind: 'image', href: '#samples.jpg', alt: 'Two worktop samples on the workbench', art: 6, caption: 'samples.jpg · 2.1 MB' }] },
      { sender: 'Customer 1', avatar: 'C1', time: '09:13', datetime: '2026-10-14T09:13', continued: true,
        html: '<p>Which one should we order: <strong>Calacatta matt</strong> or <strong>Nero Marquina polished</strong>? The cutting slot is Friday.</p>' },
      { direction: 'out', avatar: 'C6', time: '09:20', datetime: '2026-10-14T09:20', status: 'read', text: 'Calacatta matt, 20 mm. I\'ll send the updated quote to the client today.',
        attachments: [{ name: 'Quote kitchen Project 1 v2.pdf', size: '1.2 MB', href: '#quote.pdf' }], actions: [{ name: 'delete', label: 'Delete this message', destructive: true }] },
      { divider: 'Today' },
      { sender: 'Customer 1', avatar: 'C1', time: '10:02', datetime: '2026-10-24T10:02', text: 'Client signed. Can you confirm the edge profile before 16:00?' },
    ],
    scrollLabel: 'Messages',
    live: true,
    busyTitle: 'Sending message…',
    busyText: 'Please wait, do not close this conversation.',
    placeholder: 'Type your reply…',
    composerLabel: 'Reply',
    tools: () => ['attach', 'emoji'],
    hint: 'Ctrl + Enter to send',
  },
)
const emit = defineEmits<{ menu: [name: string]; tool: [name: 'attach' | 'emoji'] }>()
const auto = useUid('oc-thread')
const base = props.id ?? auto
const list = ref<MessageListItem[]>([...props.messages])
const sending = ref(false)
watch(() => props.messages, (m) => (list.value = [...m]))
const isOut = (m?: MessageListItem): m is MessageData => !!m && !('divider' in m) && m.direction === 'out'

async function send(e: Event) {
  const form = e.target as HTMLFormElement
  const field = form.elements.namedItem('message') as HTMLTextAreaElement
  const text = field.value.trim()
  if (!text) return
  sending.value = true
  try { await props.onSend?.(text) } catch { sending.value = false; return }
  if (!props.manual) {
    const l = list.value
    const mine = props.me ?? [...l].reverse().find(isOut)?.avatar ?? 'Me'
    list.value = [...l, { direction: 'out', avatar: mine, continued: isOut(l[l.length - 1]), text, time: new Date().toTimeString().slice(0, 5), status: 'sent' }]
  }
  field.value = ''
  sending.value = false
  field.focus()
}
function ctrlEnter(e: KeyboardEvent) {
  if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return
  e.preventDefault()
  ;(e.currentTarget as HTMLFormElement).requestSubmit()
}
</script>

<template>
  <section :class="['oc-message-thread', plain && 'oc-message-thread--plain']" :aria-labelledby="`${base}-title`" :aria-busy="busy || sending ? 'true' : undefined">
    <header class="oc-message-thread__header">
      <slot name="back" />
      <div class="oc-message-thread__heading">
        <h3 :id="`${base}-title`" class="oc-message-thread__title">{{ title }}</h3>
        <p v-if="project || meta" class="oc-message-thread__meta"><strong v-if="project">{{ project }}</strong><template v-if="project && meta"> · </template>{{ meta }}</p>
      </div>
      <div v-if="participants.length" class="oc-avatar-group oc-message-thread__people" :aria-label="`${participants.length} participants`">
        <span v-for="(p, i) in participants" :key="i" class="oc-avatar" :title="p.name">{{ p.initials }}</span>
      </div>
      <div v-if="status || menu" class="oc-message-thread__actions">
        <span v-if="status" :class="['oc-badge', status.variant && `oc-badge--${status.variant}`]">{{ status.label }}</span>
        <template v-if="menu">
          <button type="button" class="oc-message-thread__icon-btn" :popovertarget="`${base}-menu`" aria-label="Conversation actions"><svg data-icon="mdi:dots-vertical" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"/></svg></button>
          <div :id="`${base}-menu`" class="oc-dropdown-menu" popover role="menu">
            <template v-for="(m, i) in menu" :key="i">
              <div v-if="'separator' in m" class="oc-dropdown-separator" role="separator"></div>
              <button v-else type="button" :class="['oc-dropdown-item', m.destructive && 'oc-dropdown-item--destructive']" role="menuitem" @click="emit('menu', m.name)">{{ m.label }}</button>
            </template>
          </div>
        </template>
      </div>
    </header>
    <div class="oc-message-thread__scroll" tabindex="0" role="log" :aria-label="scrollLabel" :aria-live="live ? 'polite' : undefined">
      <OcMessageList :items="list" :log="false" />
    </div>
    <div class="oc-message-thread__footer">
      <p v-if="note" class="oc-message-thread__note">{{ note }}</p>
      <slot v-else name="composer">
        <form :class="['oc-chat-composer', inline && 'oc-chat-composer--inline']" action="#" :aria-label="composerLabel" @submit.prevent="send" @keydown="ctrlEnter">
          <label class="oc-visually-hidden" :for="`${base}-input`">Message</label>
          <textarea :id="`${base}-input`" class="oc-chat-composer__input" name="message" rows="1" :placeholder="placeholder" required></textarea>
          <div class="oc-chat-composer__bar">
            <div v-if="tools.length" class="oc-chat-composer__tools">
              <button v-if="tools.includes('attach')" type="button" class="oc-chat-composer__tool" aria-label="Attach a file" @click="emit('tool', 'attach')"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6z"/></svg></button>
              <button v-if="tools.includes('emoji')" type="button" class="oc-chat-composer__tool" aria-label="Insert emoji" @click="emit('tool', 'emoji')"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-12-3.5c0 .8-.7 1.5-1.5 1.5S7 9.3 7 8.5S7.7 7 8.5 7s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 9.3 14 8.5S14.7 7 15.5 7s1.5.7 1.5 1.5m-5 9.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81"/></svg></button>
            </div>
            <span v-if="hint" class="oc-chat-composer__hint">{{ hint }}</span>
            <button type="submit" class="oc-chat-composer__send" aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2l-15 2z"/></svg></button>
          </div>
        </form>
      </slot>
    </div>
    <div v-if="busyTitle" class="oc-message-thread__busy" role="status">
      <span class="oc-spinner oc-spinner--lg" aria-hidden="true"></span>
      <strong>{{ busyTitle }}</strong>
      <span v-if="busyText">{{ busyText }}</span>
    </div>
  </section>
</template>
