<script setup lang="ts">
/**
 * Outline link that names its destination (Back to Products).
 * fallbackHref: where the link goes when there is no page of this site to go back to; with it, a click goes back in the
 * history (filters and scroll position stay) when the visitor came from this site (same-origin referrer or more than one
 * history entry). fallbackLabel (or slot `fallback`): the label while the link goes to fallbackHref.
 */
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ href?: string; fallbackHref?: string; fallbackLabel?: string }>(), { href: '#' })

/** True when going back stays on this site. */
function canGoBack(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const ref = document.referrer
    if (ref && new URL(ref).origin === window.location.origin) return true
  } catch {
    // An unparsable referrer counts as none.
  }
  return window.history.length > 1
}

const smart = computed(() => props.fallbackHref !== undefined)
const back = ref(true)
onMounted(() => {
  if (smart.value) back.value = canGoBack()
})

function onClick(event: MouseEvent) {
  // Ctrl/Cmd/Shift/middle click: let the browser open the fallback href in a new tab or window.
  if (!smart.value || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (!canGoBack()) return
  event.preventDefault()
  window.history.back()
}
</script>

<template>
  <a class="oc-back-link" :href="smart ? fallbackHref : href" @click="onClick">
    <template v-if="smart && !back && (fallbackLabel || $slots.fallback)"><slot name="fallback">{{ fallbackLabel }}</slot></template>
    <slot v-else />
  </a>
</template>
