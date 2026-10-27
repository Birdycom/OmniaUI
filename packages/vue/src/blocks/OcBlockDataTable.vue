<script setup lang="ts">
/**
 * Card with title, actions, toolbar, table, bulk bar and footer. Put an <OcTable> in the default slot.
 * Slots: actions (header buttons), toolbar (.oc-table-toolbar content: search, filter pills, columns popover),
 * bulk (selection bar, shown when `selectedCount` > 0), default (table), footer (.oc-table-footer: entries text, page size, pagination).
 * Classes: .oc-card.oc-block-datatable, -head, -title, -description, -body, -bulk, .oc-table-toolbar, .oc-table-footer
 */
defineProps<{ title?: string; description?: string; selectedCount?: number }>()
</script>

<template>
  <section class="oc-card oc-block-datatable">
    <header v-if="title || description || $slots.actions" class="oc-block-datatable-head">
      <div>
        <h2 v-if="title" class="oc-block-datatable-title">{{ title }}</h2>
        <p v-if="description" class="oc-block-datatable-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions"><slot name="actions" /></div>
    </header>
    <div class="oc-block-datatable-body">
      <div v-if="$slots.toolbar" class="oc-table-toolbar"><slot name="toolbar" /></div>
      <div v-if="$slots.bulk && selectedCount" class="oc-block-datatable-bulk"><slot name="bulk" :count="selectedCount" /></div>
      <slot />
      <div v-if="$slots.footer" class="oc-table-footer"><slot name="footer" /></div>
    </div>
  </section>
</template>
