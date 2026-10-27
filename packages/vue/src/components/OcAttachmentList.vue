<!-- File: packages/vue/src/components/OcAttachmentList.vue | Map: props + demo files -> ul (li > chip) or div of chips -->
<script setup lang="ts">
/**
 * Wrapping row of file chips (snippets/attachment.html). items = AttachmentFile[] (demo files when empty); slot default replaces them.
 * stack = one per line. as = ul (default) or div. Emits: remove(file, index). Classes: .oc-attachment-list(--stack)
 */
import OcAttachment, { type AttachmentFile } from './OcAttachment.vue'

withDefaults(defineProps<{ items?: AttachmentFile[]; stack?: boolean; as?: 'ul' | 'div'; label?: string }>(), {
  as: 'ul',
  label: 'Files in this message',
  items: () => [
    { name: 'Quote kitchen Dewitte v2.pdf', size: '1.2 MB', href: '#quote.pdf' },
    { name: 'Measurements ground floor.xlsx', size: '86 KB', href: '#measurements.xlsx' },
    { name: 'Contract addendum.docx', size: '240 KB', href: '#contract.docx' },
    { name: 'Plans architect.zip', size: '14.8 MB', href: '#plans.zip' },
  ],
})
const emit = defineEmits<{ remove: [file: AttachmentFile, index: number] }>()
</script>

<template>
  <component :is="as" :class="['oc-attachment-list', stack && 'oc-attachment-list--stack']" :aria-label="label">
    <slot>
      <template v-for="(f, i) in items" :key="i">
        <li v-if="as === 'ul'"><OcAttachment v-bind="f" @remove="emit('remove', f, i)" /></li>
        <OcAttachment v-else v-bind="f" @remove="emit('remove', f, i)" />
      </template>
    </slot>
  </component>
</template>
