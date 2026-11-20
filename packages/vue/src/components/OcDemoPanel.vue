<!-- File: packages/vue/src/components/OcDemoPanel.vue | Map: div.oc-demo -> title -> radio tablist (tabs) -> preview slot -> code (prop or slot) -->
<script setup lang="ts">
/**
 * Live preview with its code, stacked or in Preview / Code tabs (snippets/demo-panel.html). The tabs are two radios, no JavaScript.
 * Props: code (string, shown in pre.oc-code-window__body), title, tabs (default true), previewLabel, codeLabel, label, name,
 * defaultView (preview|code), tall, center. Slots: default (preview), code (a highlighted block instead of the string).
 */
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    code?: string
    title?: string
    tabs?: boolean
    previewLabel?: string
    codeLabel?: string
    label?: string
    name?: string
    defaultView?: 'preview' | 'code'
    tall?: boolean
    center?: boolean
  }>(),
  { tabs: true, previewLabel: 'Preview', codeLabel: 'Code', label: 'View', defaultView: 'preview' },
)
const uid = useUid('oc-demo')
</script>

<template>
  <div :class="['oc-demo', tabs && 'oc-demo--tabs']">
    <p v-if="title" class="oc-preview__title">{{ title }}</p>
    <div v-if="tabs" class="oc-demo__tablist" role="radiogroup" :aria-label="label">
      <label class="oc-demo__tab"><input type="radio" :name="name ?? uid" :checked="defaultView !== 'code'" /> {{ previewLabel }}</label>
      <label class="oc-demo__tab"><input type="radio" :name="name ?? uid" :checked="defaultView === 'code'" /> {{ codeLabel }}</label>
    </div>
    <div :class="['oc-demo__preview', tall && 'oc-demo__preview--tall', center && 'oc-demo__preview--center']"><slot /></div>
    <div v-if="code != null || $slots.code" class="oc-demo__code">
      <slot name="code"><pre class="oc-code-window__body"><code>{{ code }}</code></pre></slot>
    </div>
  </div>
</template>
