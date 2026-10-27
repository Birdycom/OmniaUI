<!-- File: packages/vue/src/components/OcTableActions.vue | Map: td.oc-table-actions -> icon actions (default slot) OR overflow trigger + popover menu (default slot = menu items) -->
<script setup lang="ts">
/**
 * Row actions cell. Two modes:
 * - no `menuLabel`: the default slot holds icon actions (`a` / `button` with class oc-table-actions-icon(--primary/--success/--destructive)).
 * - with `menuLabel`: a three dots trigger opens a native popover; the default slot holds `.oc-dropdown-item`s.
 * Classes: td.oc-table-actions(--icons), .oc-table-actions-icon, .oc-table-actions-more, .oc-dropdown-menu[popover]
 */
import { useUid } from '../composables/useUid'

defineProps<{
  /** Accessible name of the overflow trigger, e.g. "Actions for Ada". Turns on menu mode. */
  menuLabel?: string
}>()
const menuId = useUid('oc-table-actions-menu')
</script>

<template>
  <td :class="['oc-table-actions', !menuLabel && 'oc-table-actions--icons']">
    <template v-if="menuLabel">
      <button class="oc-table-actions-more" type="button" :popovertarget="menuId" :aria-label="menuLabel"></button>
      <div :id="menuId" class="oc-dropdown-menu" popover><slot /></div>
    </template>
    <slot v-else />
  </td>
</template>
