<script setup lang="ts">
/**
 * An item that opens a nested menu on hover and focus (.oc-dropdown-sub > item + .oc-dropdown-submenu).
 * label (or slot `label`): text of the item; icon: a webicon name in front of it. Default slot = the items of the sub-menu.
 */
import OcWebicon from './OcWebicon.vue'
defineProps<{ label?: string; icon?: string }>()
</script>

<template>
  <div class="oc-dropdown-sub">
    <button class="oc-dropdown-item" type="button" role="menuitem" aria-haspopup="menu">
      <span v-if="icon" class="oc-dropdown-icon" aria-hidden="true"><OcWebicon :name="icon" bare fallback="iconify" /></span>
      <slot name="label">{{ label }}</slot>
    </button>
    <div class="oc-dropdown-submenu" role="menu"><slot /></div>
  </div>
</template>
