<!-- File: packages/vue/src/blocks/OcBlockSidebar02.vue | Map: props (snippet defaults) -> OcSidebarBlock (group labels as details/summary) -->
<script setup lang="ts">
/**
 * Sidebar 02: each group label is a native details element that folds its group (snippet sidebar-02).
 * Same frame as the other OcBlockSidebar0x blocks; only the defaults differ. Props: brand, groups (label, open, items:
 * label, href, icon, badge, current, open, items), user, breadcrumbs, collapsibleGroups, submenu (list | collapsible),
 * floating, navLabel. Slots: header, footer, bar, default (main column).
 * Classes: .oc-block-sb (--floating), -main, -bar, -body, -tile, -sub, -group, .oc-sidebar and its parts
 */
import OcSidebarBlock from '../blockParts/OcSidebarBlock.vue'
import { SIDEBAR_02_GROUPS } from '../blockParts/sidebarBlock'
import type { SidebarBlockProps } from '../blockParts/sidebarBlock'

const props = withDefaults(defineProps<SidebarBlockProps>(), {
  groups: () => SIDEBAR_02_GROUPS,
  collapsibleGroups: true,
})
</script>

<template>
  <OcSidebarBlock v-bind="props">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcSidebarBlock>
</template>
