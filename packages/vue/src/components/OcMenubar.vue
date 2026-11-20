<!-- File: packages/vue/src/components/OcMenubar.vue | Map: menus -> bar (role menubar, one trigger per menu, ArrowLeft / Right) -> one popover menu per trigger (OcMenuEntries, arrow keys) -->
<script setup lang="ts">
/**
 * Horizontal menu bar built from popover dropdown menus (same markup as packages/ui/snippets/menubar.html).
 * menus: [{ label, items (see OcMenuEntries), id? }]. Slot `menu-{index}` (scoped: { menu }) replaces the items of
 * that menu. `label` = aria-label of the bar. Attributes land on the bar.
 * Classes: .oc-menubar, .oc-menubar-trigger, .oc-dropdown-menu
 */
import { useUid } from '../composables/useUid'
import { onMenuKeydown, onMenuToggle } from '../composables/useMenuKeys'
import OcMenuEntries from './OcMenuEntries.vue'
import type { MenuEntry } from './OcMenuEntries.vue'

export interface MenubarMenu {
  label: string
  items?: MenuEntry[]
  id?: string
}

defineOptions({ inheritAttrs: false })
const props = defineProps<{ menus: MenubarMenu[]; label?: string }>()
const base = useUid('oc-menubar')
const idOf = (i: number) => props.menus[i]?.id ?? `${base}-${i + 1}`

function onBarKey(e: KeyboardEvent) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  const triggers = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.oc-menubar-trigger'))
  const at = triggers.indexOf(e.target as HTMLElement)
  if (at < 0) return
  e.preventDefault()
  triggers[(at + (e.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length]?.focus()
}
</script>

<template>
  <div v-bind="$attrs" class="oc-menubar" role="menubar" :aria-label="label" @keydown="onBarKey">
    <button v-for="(m, i) in menus" :key="idOf(i)" class="oc-menubar-trigger" type="button" role="menuitem" :popovertarget="idOf(i)" aria-haspopup="menu">{{ m.label }}</button>
  </div>
  <div v-for="(m, i) in menus" :id="idOf(i)" :key="idOf(i)" class="oc-dropdown-menu" popover role="menu" @keydown="onMenuKeydown" @toggle="onMenuToggle">
    <slot :name="`menu-${i}`" :menu="m"><OcMenuEntries :items="m.items ?? []" /></slot>
  </div>
</template>
