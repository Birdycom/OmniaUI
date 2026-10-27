<!-- File: packages/vue/src/components/OcSortableRow.vue | Map: tr.oc-sortable-row -> grip cell (button) -> default slot (cells) -->
<script setup lang="ts">
/**
 * Table row with a drag grip. Styling only: listen to @dragstart / @dragover / @drop on the component
 * (they fall through to the <tr>) and set `dragging` / `drop` yourself. Emits `grip-keydown` for keyboard moves.
 * Classes: tr.oc-sortable-row(.is-dragging/.is-drop-before/.is-drop-after), td.oc-sortable-row-grip-cell, button.oc-sortable-row-grip
 */
withDefaults(
  defineProps<{
    gripLabel: string
    dragging?: boolean
    drop?: 'before' | 'after' | null
    locked?: boolean
    /** Picked up with the keyboard (aria-pressed). Leave undefined when not used. */
    grabbed?: boolean
  }>(),
  // Vue casts a missing boolean prop to false; undefined keeps aria-pressed off the grip.
  { grabbed: undefined, drop: null },
)
const emit = defineEmits<{ 'grip-keydown': [e: KeyboardEvent] }>()
</script>

<template>
  <tr
    :class="['oc-sortable-row', dragging && 'is-dragging', drop && `is-drop-${drop}`]"
    :draggable="locked ? undefined : 'true'"
  >
    <td class="oc-sortable-row-grip-cell">
      <button
        class="oc-sortable-row-grip"
        type="button"
        :aria-label="gripLabel"
        :aria-pressed="grabbed"
        :disabled="locked"
        @keydown="emit('grip-keydown', $event)"
      ></button>
    </td>
    <slot />
  </tr>
</template>
