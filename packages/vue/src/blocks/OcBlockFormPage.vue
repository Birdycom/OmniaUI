<script setup lang="ts">
/**
 * Collapsible form sections with a sticky action bar. Default slot = sections (OcCollapsible containing a
 * `<div class="oc-block-formpage-grid">` for the two-column field grid). Emits `submit`.
 * Slot `actions` replaces the default Cancel / Save buttons. Classes: .oc-block-formpage, -grid, -actions
 */
withDefaults(
  defineProps<{ cancelLabel?: string; submitLabel?: string; action?: string; method?: string }>(),
  { cancelLabel: 'Cancel', submitLabel: 'Save', action: '#', method: 'post' },
)
defineEmits<{ submit: [event: SubmitEvent]; cancel: [] }>()
</script>

<template>
  <form class="oc-block-formpage" :action="action" :method="method" @submit="$emit('submit', $event)">
    <slot />
    <div class="oc-block-formpage-actions">
      <slot name="actions">
        <button class="oc-btn oc-btn--outline" type="button" @click="$emit('cancel')">{{ cancelLabel }}</button>
        <button class="oc-btn" type="submit">{{ submitLabel }}</button>
      </slot>
    </div>
  </form>
</template>
