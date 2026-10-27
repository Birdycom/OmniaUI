<script setup lang="ts">
/**
 * Brand column, link columns, a contact column and a bottom bar.
 * Slots: brand (the logo link), about (default: `about` text), bottom-start, bottom-end.
 * Classes: .oc-site-footer, __grid, __about, __title, __list, __bottom, .oc-site-header__brand
 */
export interface SiteFooterColumn {
  title: string
  links: { label: string; href: string }[]
}
export interface SiteFooterContact {
  title: string
  lines: { label: string; href?: string }[]
}
defineProps<{
  about?: string
  columns?: SiteFooterColumn[]
  contact?: SiteFooterContact
  copyright?: string
  credit?: string
}>()
</script>

<template>
  <footer class="oc-site-footer">
    <div class="oc-container">
      <div class="oc-site-footer__grid">
        <div class="oc-site-footer__about">
          <slot name="brand" />
          <p v-if="about">{{ about }}</p>
        </div>
        <div v-for="col in columns" :key="col.title">
          <h2 class="oc-site-footer__title">{{ col.title }}</h2>
          <ul class="oc-site-footer__list">
            <li v-for="link in col.links" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
          </ul>
        </div>
        <div v-if="contact">
          <h2 class="oc-site-footer__title">{{ contact.title }}</h2>
          <address class="oc-site-footer__list">
            <template v-for="line in contact.lines" :key="line.label">
              <a v-if="line.href" :href="line.href">{{ line.label }}</a>
              <span v-else>{{ line.label }}</span>
            </template>
          </address>
        </div>
      </div>
      <div v-if="copyright || credit || $slots['bottom-start'] || $slots['bottom-end']" class="oc-site-footer__bottom">
        <span><slot name="bottom-start">{{ copyright }}</slot></span>
        <span><slot name="bottom-end">{{ credit }}</slot></span>
      </div>
    </div>
  </footer>
</template>
