<!-- File: packages/vue/src/components/OcLightbox.vue | Map: props + model -> open at photo -> thumbnails -> <dialog> (bar, track of slides) -->
<script setup lang="ts">
/**
 * Lightbox on a native <dialog> (same markup as snippets/lightbox.html). v-model:open controls it.
 * images: { src?, alt, caption?, thumb? }[] (no src = placeholder art). Prev / next are anchor links.
 * Slot: caption (scoped: { image, index }). Classes: .oc-lightbox(--single), __bar, __title, __close, __track,
 * __slide, __media, __nav(--prev/--next), __caption, __counter; .oc-lightbox-thumbs / -thumb.
 */
import { nextTick, ref } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{ images: { src?: string; alt: string; caption?: string; thumb?: string }[]; title?: string; label?: string; thumbnails?: boolean }>(),
  { label: 'Photo viewer', thumbnails: true },
)
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const base = useUid('oc-lightbox')
const n = () => props.images.length
const slideId = (i: number) => `${base}-${((i % n()) + n()) % n() + 1}`

// Open the viewer and jump (without animation) to photo i.
async function show(i: number) {
  open.value = true
  await nextTick()
  document.getElementById(slideId(i))?.scrollIntoView?.({ behavior: 'instant' as ScrollBehavior, block: 'nearest', inline: 'center' })
}
defineExpose({ show, close: () => (open.value = false) })
</script>

<template>
  <div v-if="thumbnails" class="oc-lightbox-thumbs">
    <button v-for="(img, i) in images" :key="i" type="button" class="oc-lightbox-thumb" :aria-label="`Open photo ${i + 1}: ${img.alt}`" @click="show(i)">
      <img v-if="img.thumb || img.src" :src="img.thumb || img.src" :alt="img.alt" />
      <span v-else class="oc-media-art" />
    </button>
  </div>
  <dialog ref="el" :class="['oc-lightbox', images.length === 1 && 'oc-lightbox--single']" closedby="any" :aria-label="label" @close="onClose">
    <div class="oc-lightbox__bar">
      <h2 v-if="title" class="oc-lightbox__title">{{ title }}</h2>
      <span v-else />
      <button type="button" class="oc-lightbox__close" aria-label="Close" @click="open = false">&#10005;</button>
    </div>
    <div class="oc-lightbox__track" tabindex="0" aria-label="Photos, use the arrow keys">
      <figure v-for="(img, i) in images" :id="slideId(i)" :key="i" class="oc-lightbox__slide">
        <div class="oc-lightbox__media">
          <img v-if="img.src" :src="img.src" :alt="img.alt" />
          <span v-else class="oc-media-art" role="img" :aria-label="img.alt" />
        </div>
        <template v-if="images.length > 1">
          <a class="oc-lightbox__nav oc-lightbox__nav--prev" :href="`#${slideId(i - 1)}`" aria-label="Previous photo">&#8592;</a>
          <a class="oc-lightbox__nav oc-lightbox__nav--next" :href="`#${slideId(i + 1)}`" aria-label="Next photo">&#8594;</a>
        </template>
        <figcaption class="oc-lightbox__caption">
          <span v-if="images.length > 1" class="oc-lightbox__counter">{{ i + 1 }} / {{ images.length }}</span>
          <slot name="caption" :image="img" :index="i">{{ img.caption ?? img.alt }}</slot>
        </figcaption>
      </figure>
    </div>
  </dialog>
</template>
