<!-- File: packages/vue/src/blocks/OcBlockSidebar01.vue | Map: props (snippet defaults) -> OcSidebarBlock (brand, two labelled groups, user footer) -->
<script setup lang="ts">
/**
 * Sidebar 01: the base layout with a brand header, labelled groups and a user footer (snippet sidebar-01).
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
})
</script>

<template>
  <OcSidebarBlock v-bind="props">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcSidebarBlock>
</template>
