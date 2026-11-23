<!-- File: packages/vue/src/components/OcMenuEntries.vue | Map: entries -> separator | heading | sub-menu (recursive) | action (menuitem or menuitemcheckbox, shortcut) -->
<script setup lang="ts">
/**
 * The items of an .oc-dropdown-menu[role=menu] from data, shared by OcMenubar and OcContextMenu.
 * An entry: { label, shortcut?, checked? (menuitemcheckbox, keeps the menu open), destructive?, disabled?, onSelect?,
 * items? (sub-menu) } | { separator: true } | { heading }.
 * Classes: .oc-dropdown-item(--destructive), -shortcut, -separator, -label, -sub, -submenu
 */
import { closeMenuOf } from '../composables/useMenuKeys'

export interface MenuAction {
  label: string
  shortcut?: string
  checked?: boolean
  destructive?: boolean
  disabled?: boolean
  onSelect?: () => void
  items?: MenuEntry[]
}
export type MenuEntry = MenuAction | { separator: true } | { heading: string }

defineProps<{ items: MenuEntry[] }>()

const isSeparator = (e: MenuEntry): e is { separator: true } => 'separator' in e
const isHeading = (e: MenuEntry): e is { heading: string } => 'heading' in e
const action = (e: MenuEntry) => e as MenuAction
function select(e: MenuAction, ev: MouseEvent) {
  e.onSelect?.()
  if (e.checked === undefined) closeMenuOf(ev.currentTarget as Element)
}
</script>

<template>
  <template v-for="(entry, i) in items" :key="i">
    <div v-if="isSeparator(entry)" class="oc-dropdown-separator" role="separator"></div>
    <div v-else-if="isHeading(entry)" class="oc-dropdown-label">{{ entry.heading }}</div>
    <div v-else-if="action(entry).items" class="oc-dropdown-sub">
      <button class="oc-dropdown-item" type="button" role="menuitem" aria-haspopup="menu" :disabled="action(entry).disabled">{{ action(entry).label }}</button>
      <div class="oc-dropdown-submenu" role="menu"><OcMenuEntries :items="action(entry).items!" /></div>
    </div>
    <button
      v-else
      :class="['oc-dropdown-item', action(entry).destructive && 'oc-dropdown-item--destructive']"
      type="button"
      :role="action(entry).checked !== undefined ? 'menuitemcheckbox' : 'menuitem'"
      :aria-checked="action(entry).checked !== undefined ? (action(entry).checked ? 'true' : 'false') : undefined"
      :disabled="action(entry).disabled"
      @click="select(action(entry), $event)"
    >
      {{ action(entry).label }}<template v-if="action(entry).shortcut"> <span class="oc-dropdown-shortcut">{{ action(entry).shortcut }}</span></template>
    </button>
  </template>
</template>
