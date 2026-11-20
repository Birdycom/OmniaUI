<!-- File: packages/vue/src/components/OcShowMore.vue | Map: div.oc-showmore -> default slot -> extra slot (hidden) -> toggle label -->
<script setup lang="ts">
/**
 * Text that is always visible (default slot) and extra text behind a "Show more" toggle button (slot `extra`), CSS only.
 * Same markup as the .oc-showmore part of snippets/expandable-table.html. Props: moreLabel, lessLabel, buttonVariant, defaultOpen.
 */
withDefaults(
  defineProps<{ moreLabel?: string; lessLabel?: string; buttonVariant?: 'outline' | 'secondary' | 'ghost'; defaultOpen?: boolean }>(),
  { moreLabel: 'Show more', lessLabel: 'Show less', buttonVariant: 'outline' },
)
</script>

<template>
  <div class="oc-showmore">
    <slot />
    <div class="oc-showmore__extra"><slot name="extra" /></div>
    <label :class="['oc-btn', `oc-btn--${buttonVariant}`, 'oc-btn--toggle']">
      <input type="checkbox" :checked="defaultOpen" />
      <span class="oc-btn-toggle__off">{{ moreLabel }}</span>
      <span class="oc-btn-toggle__on">{{ lessLabel }}</span>
    </label>
  </div>
</template>
