<!-- File: packages/vue/src/components/OcThemeToggle.vue | Map: v-model (light | dark) -> one button (aria-pressed, tooltip or text) -->
<script setup lang="ts">
/** One button that switches between light and dark (0.17.0). v-model: 'light' | 'dark'. aria-pressed is true in dark;
 *  the tooltip says what a click does. text: icon and that text in the button instead of a tooltip. */
import { computed } from 'vue'
import OcWebicon from './OcWebicon.vue'

const props = withDefaults(defineProps<{ ghost?: boolean; labels?: { toDark?: string; toLight?: string }; text?: boolean }>(), { ghost: true, text: false })
const theme = defineModel<'light' | 'dark'>({ default: 'light' })
const name = computed(() => (theme.value === 'dark' ? props.labels?.toLight ?? 'Light theme' : props.labels?.toDark ?? 'Dark theme'))
</script>

<template>
  <button
    type="button"
    :class="['oc-btn', !text && 'oc-btn--icon oc-tooltip oc-tooltip--bottom', ghost ? 'oc-btn--ghost' : 'oc-btn--outline']"
    :aria-label="text ? undefined : name"
    :aria-pressed="theme === 'dark' ? 'true' : 'false'"
    :data-tooltip="text ? undefined : name"
    @click="theme = theme === 'dark' ? 'light' : 'dark'"
  >
    <OcWebicon :name="theme === 'dark' ? 'mdi:white-balance-sunny' : 'mdi:weather-night'" bare fallback="iconify" />
    <span v-if="text">{{ name }}</span>
  </button>
</template>
