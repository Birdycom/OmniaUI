<!-- File: packages/vue/src/components/OcAttachment.vue | Map: type / extension helpers -> props -> a[download] or div chip (icon, name, size, remove) -->
<script lang="ts">
export type AttachmentType = 'pdf' | 'doc' | 'sheet' | 'zip' | 'image'
export interface AttachmentFile {
  name: string
  size?: string
  type?: AttachmentType
  ext?: string
  href?: string
  image?: string
  state?: 'uploading' | 'error'
  progress?: number
  removable?: boolean
  removeLabel?: string
}
const TYPES: Record<string, AttachmentType> = {
  pdf: 'pdf', doc: 'doc', docx: 'doc', odt: 'doc', rtf: 'doc', txt: 'doc', xls: 'sheet', xlsx: 'sheet', csv: 'sheet', ods: 'sheet',
  zip: 'zip', rar: 'zip', '7z': 'zip', gz: 'zip', jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', heic: 'image', avif: 'image',
}
const extOf = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '')
/** Icon text and tint of a file name (Plan.xlsx -> XLS, sheet). */
export const attachmentMeta = (f: AttachmentFile) => ({
  ext: f.ext ?? extOf(f.name).toUpperCase().replace(/^(DOC|XLS|PPT)X$/, '$1'),
  type: f.type ?? TYPES[extOf(f.name)],
})
</script>

<script setup lang="ts">
/**
 * File chip (same markup as snippets/attachment.html): icon tile by type, name, size, upload / error state and remove button.
 * With href (and not removable) it is an <a download>. Emits: remove. Classes: .oc-attachment(--pdf/--doc/--sheet/--zip/--image,
 * --uploading/--error) __icon __body __name __size __remove; --oc-attachment-progress while uploading.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<AttachmentFile>(), { progress: 0 })
const emit = defineEmits<{ remove: [] }>()
const meta = computed(() => attachmentMeta(props))
const uploading = computed(() => props.state === 'uploading')
const link = computed(() => !!props.href && !props.removable)
</script>

<template>
  <component
    :is="link ? 'a' : 'div'"
    :class="['oc-attachment', meta.type && `oc-attachment--${meta.type}`, state && `oc-attachment--${state}`]"
    :href="link ? href : undefined"
    :download="link ? '' : undefined"
    :style="uploading ? `--oc-attachment-progress:${progress}%` : undefined"
  >
    <span class="oc-attachment__icon" aria-hidden="true"><img v-if="image" :src="image" alt="" /><template v-else>{{ meta.ext }}</template></span>
    <span class="oc-attachment__body">
      <span class="oc-attachment__name">{{ name }}</span>
      <span v-if="uploading" class="oc-attachment__size" role="status">{{ size ?? `Uploading… ${progress}%` }}</span>
      <span v-else-if="size" class="oc-attachment__size">{{ size }}</span>
    </span>
    <button v-if="removable" type="button" class="oc-attachment__remove" :aria-label="removeLabel ?? (uploading ? `Cancel upload of ${name}` : `Remove ${name}`)" @click="emit('remove')">&#10005;</button>
  </component>
</template>
