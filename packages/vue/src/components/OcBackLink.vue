<script setup lang="ts">
/**
 * Outline link that names its destination (Back to Products).
 * fallbackHref: where the link goes when there is no page of this site to go back to; with it, a click goes back in the
 * history (filters and scroll position stay) when the visitor came from this site (same-origin referrer or more than one
 * history entry). fallbackLabel (or slot `fallback`): the label while the link goes to fallbackHref.
 * 0.18.0: @back — with a listener a plain click emits `back` instead of navigating (Ctrl/Cmd/Shift/middle click keep the
 * browser behaviour); `as` renders another tag or component (RouterLink …; `to` and other attributes fall through).
 */
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{ href?: string; fallbackHref?: string; fallbackLabel?: string; as?: string | Component }>(),
  { href: '#' },
)
const emit = defineEmits<{ back: [] }>()
const instance = getCurrentInstance()

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
const tag = computed(() => props.as ?? 'a')
/** href only on a plain tag; a router component gets its own `to`. */
const linkAttrs = computed(() => (typeof tag.value === 'string' ? { href: smart.value ? props.fallbackHref : props.href } : {}))

function onClick(event: MouseEvent) {
  // Ctrl/Cmd/Shift/middle click: let the browser open the href in a new tab or window.
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (instance?.vnode.props?.onBack) {
    event.preventDefault()
    emit('back')
    return
  }
  if (!smart.value || !canGoBack()) return
  event.preventDefault()
  window.history.back()
}
</script>

<template>
  <component :is="tag" class="oc-back-link" v-bind="linkAttrs" @click="onClick">
    <template v-if="smart && !back && (fallbackLabel || $slots.fallback)"><slot name="fallback">{{ fallbackLabel }}</slot></template>
    <slot v-else />
  </component>
</template>
