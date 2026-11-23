<!-- File: packages/vue/src/components/OcSectionBlock.vue | Map: props -> section.oc-section | .oc-docs-section -> OcSectionHeader -> oc-section-content -> oc-section-footer -->
<script setup lang="ts">
/**
 * Section card in three parts (section-block page): header (title, badges, description), content and an optional footer.
 * Props: title, titleAs, source, scss, file, version, description, footerTitle, footerDescription, docs (section.oc-docs-section).
 * Slots: default (content, in .oc-section-content), header (extra header content), footer (extra footer content).
 */
import { computed, useSlots } from 'vue'
import OcSectionHeader from './OcSectionHeader.vue'

const props = defineProps<{
  title?: string
  titleAs?: string
  source?: string
  scss?: string
  file?: string
  version?: string
  description?: string
  footerTitle?: string
  footerDescription?: string
  docs?: boolean
}>()
const slots = useSlots()
const hasHeader = computed(() => !!slots.header || [props.title, props.source, props.scss, props.file, props.version, props.description].some(Boolean))
const hasFooter = computed(() => !!slots.footer || !!props.footerTitle || !!props.footerDescription)
</script>

<template>
  <section :class="docs ? 'oc-docs-section' : 'oc-section'">
    <OcSectionHeader v-if="hasHeader" :title="title" :as="titleAs ?? 'h2'" :source="source" :scss="scss" :file="file" :version="version" :description="description">
      <slot name="header" />
    </OcSectionHeader>
    <div v-if="$slots.default" class="oc-section-content"><slot /></div>
    <div v-if="hasFooter" class="oc-section-footer">
      <h3 v-if="footerTitle" class="oc-section-footer__title">{{ footerTitle }}</h3>
      <p v-if="footerDescription" class="oc-section-footer__desc">{{ footerDescription }}</p>
      <slot name="footer" />
    </div>
  </section>
</template>
