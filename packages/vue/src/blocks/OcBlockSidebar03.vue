<!-- File: packages/vue/src/blocks/OcBlockSidebar03.vue | Map: props (snippet defaults) -> OcSidebarBlock (items with visible submenus) -->
<script setup lang="ts">
/**
 * Sidebar 03: menu items with nested lists that stay visible, guided by a vertical line (snippet sidebar-03).
 * Same frame as the other OcBlockSidebar0x blocks; only the defaults differ. Props: brand, groups (label, open, items:
 * label, href, icon, badge, current, open, items), user, breadcrumbs, collapsibleGroups, submenu (list | collapsible),
 * floating, navLabel. Slots: header, footer, bar, default (main column).
 * Classes: .oc-block-sb (--floating), -main, -bar, -body, -tile, -sub, -group, .oc-sidebar and its parts
 */
import OcSidebarBlock from '../blockParts/OcSidebarBlock.vue'
import { SIDEBAR_03_GROUPS } from '../blockParts/sidebarBlock'
import type { SidebarBlockProps } from '../blockParts/sidebarBlock'

const props = withDefaults(defineProps<SidebarBlockProps>(), {
  groups: () => SIDEBAR_03_GROUPS,
  submenu: 'list',
})
</script>

<template>
  <OcSidebarBlock v-bind="props">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcSidebarBlock>
</template>
