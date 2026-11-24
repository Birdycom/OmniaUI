<script setup lang="ts">
/**
 * 0.18.0: one row of an OcCommand written in its slot (<OcCommandItem value="new" shortcut="Ctrl N">New invoice</OcCommandItem>).
 * OcCommand reads it and renders the li.oc-command-item; on its own it renders nothing.
 * label: the searched text (default: the text of the slot); value: what `select` reports (default: the label).
 * Emits `select` with the item when this row is chosen (before the `select` of the OcCommand).
 */
defineProps<{ value?: string; label?: string; shortcut?: string; disabled?: boolean; group?: string }>()
defineEmits<{ select: [item: { label: string; value?: string; group?: string; shortcut?: string; disabled?: boolean }] }>()
</script>

<template><template v-if="false"><slot /></template></template>
