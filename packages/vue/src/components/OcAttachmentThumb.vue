<!-- File: packages/vue/src/components/OcAttachmentThumb.vue | Map: props -> .oc-attachment-thumb (img or placeholder art, remove button) -->
<script setup lang="ts">
/** Square thumbnail of a pasted screenshot (snippets/attachment.html). removeLabel adds the remove button. Emits: remove. */
withDefaults(defineProps<{ src?: string; alt: string; art?: number; removeLabel?: string; as?: 'div' | 'span' }>(), { as: 'div' })
const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <component :is="as" class="oc-attachment-thumb">
    <img v-if="src" :src="src" :alt="alt" />
    <span v-else :class="['oc-media-art', art != null && `oc-media-art--${art}`]" role="img" :aria-label="alt"></span>
    <button v-if="removeLabel" type="button" class="oc-attachment__remove" :aria-label="removeLabel" @click="emit('remove')">&#10005;</button>
  </component>
</template>
