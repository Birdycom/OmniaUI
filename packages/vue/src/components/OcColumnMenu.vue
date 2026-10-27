<!-- File: packages/vue/src/components/OcColumnMenu.vue | Map: scope -> toolbar trigger -> popover (title, form with one checkbox per column, reset) -> default slot (the table) -->
<script setup lang="ts">
/**
 * Column visibility menu. CSS hides column n of the table in the default slot when [data-col="n"] is unchecked.
 * Checkboxes are uncontrolled, so "Reset" (form reset) restores the defaults. Emits `toggle(column, visible)`.
 * Classes: .oc-column-menu-scope, .oc-column-menu[popover], -title, form.oc-column-menu-list, -item, -footer
 */
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    /** One entry per column, in order (max 10). */
    columns: Array<{ label: string; visible?: boolean; locked?: boolean }>
    triggerLabel?: string
    title?: string
    resetLabel?: string
  }>(),
  { triggerLabel: 'Columns', title: 'Visible columns', resetLabel: 'Reset' },
)
const emit = defineEmits<{ toggle: [column: number, visible: boolean] }>()
const menuId = useUid('oc-column-menu')
</script>

<template>
  <div class="oc-column-menu-scope">
    <div class="oc-table-toolbar">
      <span class="oc-table-toolbar-spacer"></span>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" :popovertarget="menuId">{{ triggerLabel }}</button>
    </div>
    <div :id="menuId" class="oc-column-menu" popover>
      <p class="oc-column-menu-title">{{ title }}</p>
      <form class="oc-column-menu-list">
        <label v-for="(col, i) in columns" :key="i" class="oc-column-menu-item">
          <input
            type="checkbox"
            :data-col="i + 1"
            :checked="col.locked || col.visible !== false"
            :disabled="col.locked"
            @change="emit('toggle', i + 1, ($event.target as HTMLInputElement).checked)"
          />
          {{ col.label }}
        </label>
        <div class="oc-column-menu-footer">
          <button class="oc-btn oc-btn--ghost oc-btn--sm" type="reset">{{ resetLabel }}</button>
        </div>
      </form>
    </div>
    <slot />
  </div>
</template>
