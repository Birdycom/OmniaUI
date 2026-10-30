<!-- File: packages/vue/src/components/OcLinkRow.vue | Map: props (links, tone, size) -> ul.oc-link-row -> li > a per link, or the slot -->
<script setup lang="ts">
/** A row of links under a card; external links get an arrow, github.com links the GitHub mark (CSS, by the href).
 *  Classes: .oc-link-row + --accent/--muted, --sm/--lg */
withDefaults(
  defineProps<{ links?: { href: string; label: string }[]; tone?: 'default' | 'accent' | 'muted'; size?: 'sm' | 'default' | 'lg' }>(),
  { tone: 'default', size: 'default' },
)
const external = (href: string) => /^https?:\/\//.test(href)
</script>

<template>
  <ul :class="['oc-link-row', tone !== 'default' && `oc-link-row--${tone}`, size !== 'default' && `oc-link-row--${size}`]">
    <template v-if="links">
      <li v-for="(l, i) in links" :key="i"><a :href="l.href" :rel="external(l.href) ? 'noopener' : undefined">{{ l.label }}</a></li>
    </template>
    <slot v-else />
  </ul>
</template>
