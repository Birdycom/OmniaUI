<script setup lang="ts">
/**
 * Vertical navigation shell. Slots: header, default (scrolling content: OcSidebarGroup...), footer.
 * Classes: .oc-sidebar(--collapsed/--right/--floating/--dark/--overlay), -header, -content, -footer.
 * Compose with OcSidebarGroup, OcSidebarMenu, OcSidebarMenuButton, OcSidebarCollapsible, OcSidebarSeparator.
 * overlay (0.17.0): open over the content (a tablet), the page darkens; a click outside or Escape emits
 * update:collapsed (true), so v-model:collapsed closes it.
 * variant="docs" (0.17.0): the documentation navigation, nav.oc-sidebar.oc-sidebar--docs with an optional title
 * (h2.oc-sidebar-title, prop or #title slot) and groups of text links as plain siblings; OcSidebarGroup, OcSidebarMenu
 * and OcSidebarMenuButton inside follow it (no wrappers, labels or tooltips).
 */
import { computed, onBeforeUnmount, provide, watch } from 'vue'

const props = defineProps<{ collapsed?: boolean; right?: boolean; floating?: boolean; dark?: boolean; label?: string; overlay?: boolean; variant?: 'app' | 'docs'; title?: string }>()
provide('oc-sidebar-variant', computed(() => props.variant ?? 'app'))
const emit = defineEmits<{ 'update:collapsed': [collapsed: boolean] }>()
const open = computed(() => !!props.overlay && !props.collapsed)
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('update:collapsed', true) }
const onDown = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.('.oc-sidebar--overlay')) emit('update:collapsed', true) }
function listen(on: boolean) {
  if (typeof document === 'undefined') return
  const method = on ? 'addEventListener' : 'removeEventListener'
  document[method]('keydown', onKey as EventListener)
  document[method]('pointerdown', onDown as EventListener)
}
watch(open, listen, { immediate: true })
onBeforeUnmount(() => listen(false))
</script>

<template>
  <nav v-if="variant === 'docs'" :class="['oc-sidebar oc-sidebar--docs', collapsed && 'oc-sidebar--collapsed']" :aria-label="label">
    <h2 v-if="title || $slots.title" class="oc-sidebar-title"><slot name="title">{{ title }}</slot></h2>
    <slot />
  </nav>
  <aside v-else :title="title" :class="['oc-sidebar', collapsed && 'oc-sidebar--collapsed', right && 'oc-sidebar--right', floating && 'oc-sidebar--floating', dark && 'oc-sidebar--dark', overlay && 'oc-sidebar--overlay']" :aria-label="label">
    <div v-if="$slots.header" class="oc-sidebar-header"><slot name="header" /></div>
    <div class="oc-sidebar-content"><slot /></div>
    <div v-if="$slots.footer" class="oc-sidebar-footer"><slot name="footer" /></div>
  </aside>
</template>
