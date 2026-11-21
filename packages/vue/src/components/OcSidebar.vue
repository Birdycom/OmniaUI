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
 * Inside an OcSidebarProvider (0.17.0) the sidebar follows the provider (collapsed, mobile overlay, closing); its own
 * collapsed / overlay props win.
 */
import { computed, onBeforeUnmount, provide, watch } from 'vue'
import { useSidebarOptional } from '../composables/useSidebar'

const props = withDefaults(
  defineProps<{ collapsed?: boolean; right?: boolean; floating?: boolean; dark?: boolean; label?: string; overlay?: boolean; variant?: 'app' | 'docs'; title?: string }>(),
  { collapsed: undefined, overlay: undefined },
)
provide('oc-sidebar-variant', computed(() => props.variant ?? 'app'))
const emit = defineEmits<{ 'update:collapsed': [collapsed: boolean] }>()
const ctx = useSidebarOptional()
const collapsed = computed(() => props.collapsed ?? ctx?.collapsed.value ?? false)
const overlay = computed(() => props.overlay ?? ctx?.isMobile.value ?? false)
const close = () => {
  emit('update:collapsed', true)
  if (props.collapsed === undefined) ctx?.setCollapsed(true)
}
const open = computed(() => overlay.value && !collapsed.value)
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
const onDown = (e: PointerEvent) => {
  const target = e.target as Element | null
  if (target?.closest?.('.oc-sidebar--overlay') || target?.closest?.('[data-oc-sidebar-trigger], [data-oc-sidebar-rail]')) return
  close()
}
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
