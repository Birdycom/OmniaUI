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
  reply: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v4',
  delete: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
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
        <span v-if="status" :class="['oc-message__status', status !== 'sent' && `oc-message__status--${status}`]"><svg v-if="statusIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12.5 7 17.5 18 6.5M13 16.5l1 1L22.5 9" /></svg>{{ statusLabel ?? STATUS[status] }}</span>
      </p>
    </div>
    <div v-if="actions?.length" class="oc-message__actions">
      <button v-for="a in actions" :key="a.name" type="button" :class="['oc-message__action', a.destructive && 'oc-message__action--destructive']" :aria-label="a.label" @click="emit('action', a.name)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="MESSAGE_ICONS[a.icon ?? a.name] ?? MESSAGE_ICONS.reply" /></svg>
      </button>
    </div>
  </article>
</template>
