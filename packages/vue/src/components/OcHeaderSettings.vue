<!-- File: packages/vue/src/components/OcHeaderSettings.vue | Map: props -> group (language menu compact + theme toggle + slot) -->
<script setup lang="ts">
/** Language and theme of an app header as one group of round ghost buttons with tooltips (0.17.0).
 *  v-model:language, v-model:theme. Default slot: more buttons after the two. */
import OcLanguageMenu from './OcLanguageMenu.vue'
import OcThemeToggle from './OcThemeToggle.vue'
import type { LanguageMenuItem } from './OcLanguageMenu.vue'

withDefaults(defineProps<{ languages?: LanguageMenuItem[]; languageLabel?: string; themeLabels?: { toDark?: string; toLight?: string }; label?: string }>(), { label: 'Settings', languageLabel: 'Language' })
const language = defineModel<string>('language')
const theme = defineModel<'light' | 'dark'>('theme')
</script>

<template>
  <div class="oc-header-settings" role="group" :aria-label="label">
    <OcLanguageMenu v-if="languages?.length" v-model="language" :options="languages" :label="languageLabel" compact ghost flags="auto" />
    <OcThemeToggle v-if="theme" v-model="theme" :labels="themeLabels" />
    <slot />
  </div>
</template>
