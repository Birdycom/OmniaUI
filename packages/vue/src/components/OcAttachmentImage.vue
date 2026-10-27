<!-- File: packages/vue/src/components/OcAttachmentImage.vue | Map: props -> a.oc-attachment-image (img or placeholder art, caption) -->
<script setup lang="ts">
/** Image preview inside a message (4 : 3, same markup as snippets/attachment.html). No src = placeholder art. Classes: .oc-attachment-image, __caption */
defineProps<{ href?: string; src?: string; alt: string; art?: number; caption?: string }>()
</script>

<template>
  <a class="oc-attachment-image" :href="href">
    <img v-if="src" :src="src" :alt="alt" />
    <span v-else :class="['oc-media-art', art != null && `oc-media-art--${art}`]" role="img" :aria-label="alt"></span>
    <span v-if="caption" class="oc-attachment-image__caption">{{ caption }}</span>
  </a>
</template>
