<!-- File: packages/vue/src/components/OcContextMenu.vue | Map: props (items, menu label) -> area (.oc-context-area, default slot) -> right-click: position (--oc-context-x / -y) + showPopover -> menu (OcMenuEntries or slot menu) -->
<script setup lang="ts">
/**
 * Dropdown menu at the pointer for a right-click area (same markup as packages/ui/snippets/context-menu.html).
 * Default slot = area content; items (see OcMenuEntries) or slot `menu` = the menu. menuLabel = aria-label of the
 * menu (default "Actions"). Attributes land on the area.
 * Classes: .oc-context-area, .oc-dropdown-menu.oc-context-menu
 */
import { ref } from 'vue'
import { useUid } from '../composables/useUid'
import { onMenuKeydown, onMenuToggle } from '../composables/useMenuKeys'
import OcMenuEntries from './OcMenuEntries.vue'
import type { MenuEntry } from './OcMenuEntries.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ items?: MenuEntry[]; menuLabel?: string; menuId?: string }>(), { menuLabel: 'Actions' })
const id = props.menuId ?? useUid('oc-context-menu')
const menu = ref<(HTMLElement & { showPopover?: () => void }) | null>(null)

function open(e: MouseEvent) {
  e.preventDefault()
  const el = menu.value
  if (!el) return
  el.style.setProperty('--oc-context-x', `${Math.min(e.clientX, window.innerWidth - 220)}px`)
  el.style.setProperty('--oc-context-y', `${Math.min(e.clientY, window.innerHeight - 220)}px`)
  const show = () => { try { el.showPopover?.() } catch { /* already open */ } }
  // Firefox fires contextmenu while the right button is still down: open after the release, or that release would
  // close the menu again right away.
  if (e.buttons) window.addEventListener('pointerup', () => setTimeout(show), { once: true })
  else show()
}
</script>

<template>
  <div v-bind="$attrs" class="oc-context-area" tabindex="0" @contextmenu="open"><slot /></div>
  <div :id="id" ref="menu" class="oc-dropdown-menu oc-context-menu" popover role="menu" :aria-label="menuLabel" @keydown="onMenuKeydown" @toggle="onMenuToggle">
    <slot name="menu"><OcMenuEntries :items="items ?? []" /></slot>
  </div>
</template>
