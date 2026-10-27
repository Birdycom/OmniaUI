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
    project: 'Villa Dewitte',
    meta: 'Lisa Verbeke → Tom Peeters · 14 Oct 2026',
    participants: () => [{ initials: 'LV', name: 'Lisa Verbeke' }, { initials: 'TP', name: 'Tom Peeters' }],
    status: () => ({ label: 'Urgent', variant: 'destructive' }),
    menu: () => [{ name: 'unread', label: 'Mark as unread' }, { name: 'archive', label: 'Move to archive' }, { separator: true }, { name: 'delete', label: 'Delete conversation', destructive: true }],
    messages: () => [
      { divider: 'Tuesday 14 October' },
      { sender: 'Lisa Verbeke', avatar: 'LV', time: '09:12', datetime: '2026-10-14T09:12', text: 'The supplier dropped off two worktop samples at the workshop. Photo attached.',
        attachments: [{ kind: 'image', href: '#samples.jpg', alt: 'Two worktop samples on the workbench', art: 6, caption: 'samples.jpg · 2.1 MB' }] },
      { sender: 'Lisa Verbeke', avatar: 'LV', time: '09:13', datetime: '2026-10-14T09:13', continued: true,
        html: '<p>Which one should we order: <strong>Calacatta matt</strong> or <strong>Nero Marquina polished</strong>? The cutting slot is Friday.</p>' },
      { direction: 'out', avatar: 'TP', time: '09:20', datetime: '2026-10-14T09:20', status: 'read', text: 'Calacatta matt, 20 mm. I\'ll send the updated quote to the client today.',
        attachments: [{ name: 'Quote kitchen Dewitte v2.pdf', size: '1.2 MB', href: '#quote.pdf' }], actions: [{ name: 'delete', label: 'Delete this message', destructive: true }] },
      { divider: 'Today' },
      { sender: 'Lisa Verbeke', avatar: 'LV', time: '10:02', datetime: '2026-10-24T10:02', text: 'Client signed. Can you confirm the edge profile before 16:00?' },
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
          <button type="button" class="oc-message-thread__icon-btn" :popovertarget="`${base}-menu`" aria-label="Conversation actions"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg></button>
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
              <button v-if="tools.includes('attach')" type="button" class="oc-chat-composer__tool" aria-label="Attach a file" @click="emit('tool', 'attach')">&#128206;</button>
              <button v-if="tools.includes('emoji')" type="button" class="oc-chat-composer__tool" aria-label="Insert emoji" @click="emit('tool', 'emoji')">&#128578;</button>
            </div>
            <span v-if="hint" class="oc-chat-composer__hint">{{ hint }}</span>
            <button type="submit" class="oc-chat-composer__send" aria-label="Send">&#10148;</button>
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
