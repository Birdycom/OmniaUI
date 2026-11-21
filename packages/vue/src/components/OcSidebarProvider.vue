<!-- File: packages/vue/src/components/OcSidebarProvider.vue | Map: props -> state (v-model:collapsed, persist, mobile breakpoint) -> shortcut -> provide -> div.oc-sidebar-provider -->
<script setup lang="ts">
/**
 * Holds the sidebar state (0.17.0) for OcSidebar, OcSidebarTrigger, OcSidebarRail and useSidebar(). An OcSidebar inside
 * follows it unless it gets its own `collapsed`. v-model:collapsed (optional), default-collapsed, persist (true or a key:
 * remember the desktop state), storage ("local" default or "cookie": oc-sidebar-<key>, readable by the server),
 * mobile-breakpoint (px, default 768, 0 = never: below it the sidebar opens over the page and starts closed),
 * shortcut (Ctrl/Cmd + key, default "b", false = none). Put OcSidebar, OcSidebarRail and OcSidebarInset inside.
 */
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { readSidebarState, sidebarKey, sidebarStorageKey, writeSidebarState } from '../composables/useSidebar'

const props = withDefaults(
  defineProps<{
    collapsed?: boolean
    defaultCollapsed?: boolean
    persist?: string | boolean
    storage?: 'local' | 'cookie'
    mobileBreakpoint?: number
    shortcut?: string | false
  }>(),
  { collapsed: undefined, defaultCollapsed: false, persist: undefined, storage: 'local', mobileBreakpoint: 768, shortcut: 'b' },
)
const emit = defineEmits<{ 'update:collapsed': [collapsed: boolean] }>()

const storeName = computed(() => sidebarStorageKey(props.persist, props.storage))
const inner = ref(props.defaultCollapsed)
const desktop = computed(() => props.collapsed ?? inner.value)
const isMobile = ref(false)
const openMobile = ref(false)
const collapsed = computed(() => (isMobile.value ? !openMobile.value : desktop.value))

function setCollapsed(next: boolean) {
  if (isMobile.value) {
    openMobile.value = !next
    return
  }
  writeSidebarState(storeName.value, props.storage, next)
  if (props.collapsed === undefined) inner.value = next
  emit('update:collapsed', next)
}
const toggle = () => setCollapsed(!collapsed.value)

let mq: MediaQueryList | null = null
const onMedia = () => {
  isMobile.value = !!mq?.matches
  openMobile.value = false
}
const onKey = (e: KeyboardEvent) => {
  const key = props.shortcut
  if (!key || !(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== key.toLowerCase()) return
  if ((e.target as HTMLElement | null)?.isContentEditable) return
  e.preventDefault()
  toggle()
}
onMounted(() => {
  // The remembered state after mounting (the server render uses the default, or a cookie the app read itself).
  if (props.collapsed === undefined) {
    const saved = readSidebarState(storeName.value, props.storage)
    if (saved !== undefined) inner.value = saved
  }
  if (props.mobileBreakpoint && typeof window.matchMedia === 'function') {
    mq = window.matchMedia(`(max-width: ${props.mobileBreakpoint - 0.02}px)`)
    onMedia()
    mq.addEventListener?.('change', onMedia)
  }
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  mq?.removeEventListener?.('change', onMedia)
  window.removeEventListener('keydown', onKey)
})

provide(sidebarKey, { collapsed, isMobile, openMobile, setCollapsed, toggle })
defineExpose({ collapsed, isMobile, openMobile, setCollapsed, toggle })
</script>

<template>
  <div class="oc-sidebar-provider" :data-state="collapsed ? 'collapsed' : 'expanded'" :data-mobile="isMobile ? '' : undefined">
    <slot :collapsed="collapsed" :is-mobile="isMobile" :toggle="toggle" />
  </div>
</template>
