<!-- File: packages/vue/src/components/OcDocViewer.vue | Map: props + demo items -> grid of cards (bar, frame) -> one full-screen <dialog> per card -->
<script setup lang="ts">
/**
 * PDF, video or image cards with a full-screen view (same markup as snippets/doc-viewer.html). No JavaScript:
 * the buttons open the dialog with invoker commands (command="show-modal" commandfor), closedby="any" closes it.
 * items: { label, meta?, src?, type?: pdf|video|image, id?, alt?, art?, download?, open?: bar|frame, fullscreen? }[]
 * Classes: .oc-doc-viewer-grid, .oc-doc-viewer(--video/--image) __bar __label __meta __expand __frame __open;
 * .oc-doc-viewer-dialog(--video) __bar __title __actions __close __body
 */
import { useUid } from '../composables/useUid'

export interface DocViewerItem {
  label: string
  meta?: string
  src?: string
  type?: 'pdf' | 'video' | 'image'
  id?: string
  alt?: string
  art?: number
  download?: string
  open?: 'bar' | 'frame'
  fullscreen?: boolean
}
const props = withDefaults(
  defineProps<{ items?: DocViewerItem[]; openText?: string; downloadText?: string; idPrefix?: string }>(),
  {
    items: () => [
      { label: 'Brochure 2026', meta: 'PDF · 2.4 MB', alt: 'First page of Brochure 2026', art: 2, download: '#brochure.pdf' },
      { label: 'Site visit', meta: '1:42', type: 'video', alt: 'Video still: site visit', art: 5 },
    ],
    openText: 'Click for full screen',
    downloadText: 'Download',
  },
)
defineOptions({ inheritAttrs: false })
const auto = useUid('oc-doc-viewer')
const idOf = (doc: DocViewerItem, i: number) => doc.id ?? `${props.idPrefix ?? auto}-${i + 1}`
const full = (doc: DocViewerItem) => doc.fullscreen !== false
const inFrame = (doc: DocViewerItem) => full(doc) && (doc.open ?? (doc.type === 'video' ? 'frame' : 'bar')) === 'frame'
const art = (doc: DocViewerItem) => ['oc-media-art', doc.art != null && `oc-media-art--${doc.art}`]
const dialogAlt = (doc: DocViewerItem) => (doc.type === 'video' ? `${doc.label} video` : doc.label)
</script>

<template>
  <div class="oc-doc-viewer-grid" v-bind="$attrs">
    <figure v-for="(doc, i) in items" :key="i" :class="['oc-doc-viewer', doc.type === 'video' && 'oc-doc-viewer--video', doc.type === 'image' && 'oc-doc-viewer--image']">
      <figcaption class="oc-doc-viewer__bar">
        <span class="oc-doc-viewer__label">{{ doc.label }}</span>
        <span v-if="doc.meta" class="oc-doc-viewer__meta">{{ doc.meta }}</span>
        <button v-if="full(doc) && !inFrame(doc)" type="button" class="oc-doc-viewer__expand" command="show-modal" :commandfor="idOf(doc, i)" :aria-label="`Open ${doc.label} full screen`">&#10530;</button>
      </figcaption>
      <div class="oc-doc-viewer__frame">
        <div v-if="!doc.src" :class="art(doc)" role="img" :aria-label="doc.alt ?? doc.label"></div>
        <video v-else-if="doc.type === 'video'" :src="doc.src" controls preload="metadata" :aria-label="doc.alt ?? doc.label"></video>
        <img v-else-if="doc.type === 'image'" :src="doc.src" :alt="doc.alt ?? doc.label" />
        <iframe v-else :src="`${doc.src}#toolbar=0&view=FitH`" :title="doc.alt ?? doc.label" loading="lazy"></iframe>
        <button v-if="inFrame(doc)" type="button" class="oc-doc-viewer__open" command="show-modal" :commandfor="idOf(doc, i)">{{ openText }}</button>
      </div>
    </figure>
  </div>
  <template v-for="(doc, i) in items" :key="i">
    <dialog v-if="full(doc)" :id="idOf(doc, i)" :class="['oc-doc-viewer-dialog', doc.type === 'video' && 'oc-doc-viewer-dialog--video']" closedby="any" :aria-labelledby="`${idOf(doc, i)}-title`">
      <div class="oc-doc-viewer-dialog__bar">
        <h2 :id="`${idOf(doc, i)}-title`" class="oc-doc-viewer-dialog__title">{{ doc.label }}</h2>
        <div v-if="doc.download" class="oc-doc-viewer-dialog__actions">
          <a class="oc-btn oc-btn--outline oc-btn--sm" :href="doc.download" download>{{ downloadText }}</a>
          <button type="button" class="oc-doc-viewer-dialog__close" command="close" :commandfor="idOf(doc, i)" aria-label="Close">&#10005;</button>
        </div>
        <button v-else type="button" class="oc-doc-viewer-dialog__close" command="close" :commandfor="idOf(doc, i)" aria-label="Close">&#10005;</button>
      </div>
      <div class="oc-doc-viewer-dialog__body">
        <div v-if="!doc.src" :class="art(doc)" role="img" :aria-label="dialogAlt(doc)"></div>
        <video v-else-if="doc.type === 'video'" :src="doc.src" controls preload="metadata" :aria-label="dialogAlt(doc)"></video>
        <img v-else-if="doc.type === 'image'" :src="doc.src" :alt="dialogAlt(doc)" />
        <iframe v-else :src="`${doc.src}#toolbar=0&view=FitH`" :title="dialogAlt(doc)" loading="lazy"></iframe>
      </div>
    </dialog>
  </template>
</template>
