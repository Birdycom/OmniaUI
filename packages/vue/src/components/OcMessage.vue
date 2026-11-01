<!-- File: packages/vue/src/components/OcMessage.vue | Map: types + icons -> props -> article (avatar, bubble: sender, quote, text, attachments, meta; actions) -->
<script lang="ts">
import type { AttachmentFile } from './OcAttachment.vue'

/** File chip (default), image preview or square thumbnail inside a message. */
export type MessageAttachment =
  | (AttachmentFile & { kind?: 'file' })
  | { kind: 'image'; href?: string; src?: string; alt: string; art?: number; caption?: string }
  | { kind: 'thumb'; src?: string; alt: string; art?: number }
export interface MessageAction { name: string; label: string; icon?: 'reply' | 'delete'; destructive?: boolean }
export interface MessageData {
  direction?: 'in' | 'out'
  sender?: string
  avatar?: string
  time?: string
  datetime?: string
  status?: 'sent' | 'read' | 'failed'
  statusLabel?: string
  statusIcon?: boolean
  continued?: boolean
  quote?: { href?: string; sender: string; text: string }
  /** Plain text: one paragraph. */
  text?: string
  /** Trusted markup (p, ul, ol, a, strong, code); escape user text on the server. */
  html?: string
  attachments?: MessageAttachment[]
  actions?: MessageAction[]
  label?: string
  id?: string
}
export const MESSAGE_ICONS: Record<string, string> = {
  reply: 'M8 9.8v.9l1.7.3c2.6.4 4.5 1.4 5.9 2.7c-1.7-.5-3.5-.8-5.6-.8H8v1.3L5.8 12zM10 5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11',
  delete: 'M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z',
}
</script>

<script setup lang="ts">
/**
 * Chat bubble (same markup as snippets/message.html): incoming / outgoing, sender, avatar, time, read receipt, reply quote,
 * attachments and hover actions. Slot default = extra text content. Emits: action(name).
 * Classes: .oc-message(--out/--continued) __avatar __bubble __sender __quote __text __attachments __meta __status(--read/--failed) __actions __action
 */
import { computed } from 'vue'
import OcAttachment from './OcAttachment.vue'
import OcAttachmentImage from './OcAttachmentImage.vue'
import OcAttachmentThumb from './OcAttachmentThumb.vue'

const props = withDefaults(defineProps<MessageData>(), { direction: 'in' })
const emit = defineEmits<{ action: [name: string] }>()
const STATUS = { sent: 'Sent', read: 'Read', failed: 'Failed' }
const thumbsOnly = computed(() => !!props.attachments?.length && props.attachments.every((a) => a.kind === 'thumb'))
// Props of one attachment without its `kind`.
type ImageAttachment = Extract<MessageAttachment, { kind: 'image' }>
type ThumbAttachment = Extract<MessageAttachment, { kind: 'thumb' }>
const strip = (a: MessageAttachment) => {
  const { kind: _k, ...p } = a
  return p
}
const image = (a: MessageAttachment) => strip(a) as Omit<ImageAttachment, 'kind'>
const thumb = (a: MessageAttachment) => strip(a) as Omit<ThumbAttachment, 'kind'>
const file = (a: MessageAttachment) => strip(a) as AttachmentFile
</script>

<template>
  <article :id="id" :class="['oc-message', direction === 'out' && 'oc-message--out', continued && 'oc-message--continued']" :aria-label="label">
    <span class="oc-avatar oc-message__avatar">{{ avatar }}</span>
    <div class="oc-message__bubble">
      <p v-if="sender && !continued" class="oc-message__sender">{{ sender }}</p>
      <a v-if="quote" class="oc-message__quote" :href="quote.href"><strong>{{ quote.sender }}</strong><span>{{ quote.text }}</span></a>
      <div v-if="html" class="oc-message__text" v-html="html"></div>
      <div v-else-if="text || $slots.default" class="oc-message__text"><p v-if="text">{{ text }}</p><slot /></div>
      <div v-if="attachments?.length" class="oc-message__attachments">
        <div v-if="thumbsOnly" class="oc-attachment-list"><OcAttachmentThumb v-for="(a, i) in attachments" :key="i" v-bind="thumb(a)" as="span" /></div>
        <template v-for="(a, i) in attachments" v-else :key="i">
          <OcAttachmentImage v-if="a.kind === 'image'" v-bind="image(a)" />
          <OcAttachmentThumb v-else-if="a.kind === 'thumb'" v-bind="thumb(a)" as="span" />
          <OcAttachment v-else v-bind="file(a)" />
        </template>
      </div>
      <p v-if="time || status" class="oc-message__meta">
        <time v-if="time" :datetime="datetime">{{ time }}</time>
        <span v-if="status" :class="['oc-message__status', status !== 'sent' && `oc-message__status--${status}`]"><svg data-icon="mdi:check-all" v-if="statusIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.41 13.41L6 19l1.41-1.42L1.83 12m20.41-6.42L11.66 16.17L7.5 12l-1.43 1.41L11.66 19l12-12M18 7l-1.41-1.42l-6.35 6.35l1.42 1.41z"/></svg>{{ statusLabel ?? STATUS[status] }}</span>
      </p>
    </div>
    <div v-if="actions?.length" class="oc-message__actions">
      <button v-for="a in actions" :key="a.name" type="button" :class="['oc-message__action', a.destructive && 'oc-message__action--destructive']" :aria-label="a.label" @click="emit('action', a.name)">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="MESSAGE_ICONS[a.icon ?? a.name] ?? MESSAGE_ICONS.reply" /></svg>
      </button>
    </div>
  </article>
</template>
