<!-- File: packages/vue/src/components/OcGroup.vue | Map: section -> head (title + aside) -> meta -> content (slot) -->
<script setup lang="ts">
/** One section in a panel: title, a status on the right (aside, asideTone), a muted line (meta) and the content. */
withDefaults(defineProps<{ title: string; aside?: string; asideTone?: 'busy' | 'ok' | 'warn' | 'error'; meta?: string; headingLevel?: 2 | 3 | 4 }>(), { headingLevel: 2 })
</script>

<template>
  <section class="oc-group">
    <header class="oc-group__head">
      <component :is="`h${headingLevel}`" class="oc-group__title">{{ title }}</component>
      <span v-if="aside || $slots.aside" class="oc-group__aside" :data-tone="asideTone"><slot name="aside">{{ aside }}</slot></span>
    </header>
    <p v-if="meta" class="oc-group__meta">{{ meta }}</p>
    <slot />
  </section>
</template>
