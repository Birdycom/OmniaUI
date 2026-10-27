<script setup lang="ts">
/** Multi-column site footer. Slots: bottom-start, bottom-end (default text via `copyright` / `credit`). Classes: .oc-block-footer, -grid, -col, -bottom */
export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}
defineProps<{ columns: FooterColumn[]; copyright?: string; credit?: string }>()
</script>

<template>
  <div class="oc-block-footer">
    <div class="oc-block-footer-grid">
      <div v-for="col in columns" :key="col.title" class="oc-block-footer-col">
        <h4>{{ col.title }}</h4>
        <ul>
          <li v-for="link in col.links" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
        </ul>
      </div>
    </div>
    <div v-if="copyright || credit || $slots['bottom-start'] || $slots['bottom-end']" class="oc-block-footer-bottom">
      <span><slot name="bottom-start">{{ copyright }}</slot></span>
      <span><slot name="bottom-end">{{ credit }}</slot></span>
    </div>
  </div>
</template>
