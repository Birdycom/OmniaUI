<!-- File: packages/vue/src/blocks/OcBlockSidebar04.vue | Map: props (snippet defaults) -> OcSidebarBlock (sidebar-01 groups on a floating panel) -->
<script setup lang="ts">
/**
 * Sidebar 04: the sidebar floats as a rounded, shadowed panel over a muted page (snippet sidebar-04).
 * Same frame as the other OcBlockSidebar0x blocks; only the defaults differ. Props: brand, groups (label, open, items:
 * label, href, icon, badge, current, open, items), user, breadcrumbs, collapsibleGroups, submenu (list | collapsible),
 * floating, navLabel. Slots: header, footer, bar, default (main column).
 * Classes: .oc-block-sb (--floating), -main, -bar, -body, -tile, -sub, -group, .oc-sidebar and its parts
 */
import OcSidebarBlock from '../blockParts/OcSidebarBlock.vue'
import { SIDEBAR_BASE_GROUPS, SIDEBAR_USER } from '../blockParts/sidebarBlock'
import type { SidebarBlockProps } from '../blockParts/sidebarBlock'

const props = withDefaults(defineProps<SidebarBlockProps>(), {
  groups: () => SIDEBAR_BASE_GROUPS,
  user: () => SIDEBAR_USER,
  floating: true,
})
</script>

<template>
  <OcSidebarBlock v-bind="props">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcSidebarBlock>
</template>
