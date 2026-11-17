<!-- File: packages/vue/src/components/OcWebicon.vue | Map: props -> registry lookup (reactive) -> inline svg (viewBox, currentColor, oc-icon + size, label = role img + title) | fallback -->
<script setup lang="ts">
/**
 * A webicon by name ("mdi:home", "flag:nl-4x3") as inline SVG in currentColor, from icons the app registered with
 * registerWebicons / addWebicons (no network; a small set is built in). size: xs | sm | md | lg | xl (fixed rem);
 * without it 1.25em. label: role="img" with a <title>, else aria-hidden. bare: no oc-icon class (1em, like the Iconify
 * element). fallback: "none" (draw nothing for an unregistered name) or "iconify" (an <iconify-icon> for apps that
 * load the Iconify runtime).
 */
import { computed, watchEffect } from 'vue'
import { useUid } from '../composables/useUid'
import { webiconTick } from '../composables/useWebicons'
import { getWebicon, hasIconifyRuntime, warnOnce, webiconSvg } from '../webicons'

export type WebiconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{ name: string; size?: WebiconSize; label?: string; bare?: boolean; fallback?: 'none' | 'iconify' }>(),
  { bare: false, fallback: 'none' },
)
const uid = useUid('wi').replace(/[^a-zA-Z0-9]/g, '')
const icon = computed(() => {
  void webiconTick.value
  return getWebicon(props.name)
})
const svg = computed(() => (icon.value ? webiconSvg(icon.value, props.label, uid) : null))
watchEffect(() => {
  if (!icon.value && (props.fallback === 'none' || !hasIconifyRuntime())) warnOnce(props.name)
})
const cls = computed(() => (props.bare ? undefined : ['oc-icon', props.size && `oc-icon--${props.size}`]))
const style = computed(() => (svg.value && svg.value.ratio !== 1 && !props.bare ? { '--oc-icon-ratio': svg.value.ratio } : undefined))
</script>

<template>
  <svg
    v-if="svg"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="svg.viewBox"
    :width="`${svg.ratio}em`"
    height="1em"
    fill="currentColor"
    :class="cls"
    :style="style"
    :data-webicon="name"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    v-html="svg.html"
  />
  <iconify-icon v-else-if="fallback === 'iconify'" :icon="name" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'" />
</template>
