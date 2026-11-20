<!-- File: packages/vue/src/components/OcFooterbar.vue | Map: footer.oc-footerbar -> text (slot; in a span with links) -> ul.oc-footerbar-links -->
<script setup lang="ts">
/**
 * Slim footer bar (snippets/site-footer.html). Props: links ({ href, label }[]), linksLabel, fixed, split, tall, dark.
 * Slot: default = the version or copyright line. Classes: .oc-footerbar(--fixed/--split/--tall/--dark), .oc-footerbar-links
 */
export interface FooterbarLink {
  href: string
  label: string
}
defineProps<{ links?: FooterbarLink[]; linksLabel?: string; fixed?: boolean; split?: boolean; tall?: boolean; dark?: boolean }>()
</script>

<template>
  <footer :class="['oc-footerbar', dark && 'oc-footerbar--dark', split && 'oc-footerbar--split', tall && 'oc-footerbar--tall', fixed && 'oc-footerbar--fixed']">
    <template v-if="links?.length">
      <span><slot /></span>
      <ul class="oc-footerbar-links" :aria-label="linksLabel">
        <li v-for="(link, i) in links" :key="i"><a :href="link.href">{{ link.label }}</a></li>
      </ul>
    </template>
    <slot v-else />
  </footer>
</template>
