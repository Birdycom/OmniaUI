<script setup lang="ts">
/**
 * The <ul class="oc-sidebar-menu">; put <li> elements (each with an OcSidebarMenuButton or OcSidebarCollapsible) inside.
 * sub (0.17.0): the nested ul.oc-sidebar-menu-sub under a parent link, as in the docs sidebar.
 */
defineProps<{ sub?: boolean }>()
</script>

<template>
  <ul :class="sub ? 'oc-sidebar-menu-sub' : 'oc-sidebar-menu'"><slot /></ul>
</template>
