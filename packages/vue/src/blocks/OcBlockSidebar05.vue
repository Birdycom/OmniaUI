<!-- File: packages/vue/src/blocks/OcBlockSidebar05.vue | Map: props (snippet defaults) -> OcSidebarBlock (items that fold a submenu) -->
<script setup lang="ts">
/**
 * Sidebar 05: menu items that expand a submenu with details and summary (snippet sidebar-05).
 * Same frame as the other OcBlockSidebar0x blocks; only the defaults differ. Props: brand, groups (label, open, items:
 * label, href, icon, badge, current, open, items), user, breadcrumbs, collapsibleGroups, submenu (list | collapsible),
 * floating, navLabel. Slots: header, footer, bar, default (main column).
 * Classes: .oc-block-sb (--floating), -main, -bar, -body, -tile, -sub, -group, .oc-sidebar and its parts
 */
import OcSidebarBlock from '../blockParts/OcSidebarBlock.vue'
import { SIDEBAR_05_GROUPS } from '../blockParts/sidebarBlock'
import type { SidebarBlockProps } from '../blockParts/sidebarBlock'

const props = withDefaults(defineProps<SidebarBlockProps>(), {
  groups: () => SIDEBAR_05_GROUPS,
  submenu: 'collapsible',
})
</script>

<template>
  <OcSidebarBlock v-bind="props">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcSidebarBlock>
</template>
