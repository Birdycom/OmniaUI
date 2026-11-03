<!-- File: packages/vue/src/components/OcMenuStatic.vue | Map: div.oc-dropdown-menu--static -> items (slot) -->
<script setup lang="ts">
/** The dropdown menu as a surface of its own (a tray menu). Items: OcDropdownItem (checked, hint), OcDropdownLabel. */
defineProps<{ flat?: boolean }>()
</script>

<template>
  <div role="menu" :class="['oc-dropdown-menu', 'oc-dropdown-menu--static', flat && 'oc-dropdown-menu--flat']"><slot /></div>
</template>
