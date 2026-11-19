<script setup lang="ts">
/**
 * Sticky header that turns into glass after scrolling; the mobile menu is a popover. No JavaScript needed.
 * Slots: brand (inside the brand link), nav (replaces the items), cta (the trailing button).
 * container: fold the menu at the width of the header itself, not of the window (.oc-site-header--container, 0.17.0).
 * Classes: .oc-site-header, --container, __inner, __brand, __toggle, __nav, .oc-container
 */
import { useUid } from '../composables/useUid'

export interface SiteHeaderLink {
  label: string
  href: string
  current?: boolean
}
withDefaults(
  defineProps<{ items?: SiteHeaderLink[]; homeHref?: string; menuLabel?: string; navLabel?: string; container?: boolean }>(),
  { items: () => [], homeHref: '/', menuLabel: 'Menu', navLabel: 'Main' },
)
const navId = useUid('oc-site-nav')
</script>

<template>
  <header :class="['oc-site-header', { 'oc-site-header--container': container }]">
    <div class="oc-container oc-site-header__inner">
      <a class="oc-site-header__brand" :href="homeHref"><slot name="brand" /></a>
      <button class="oc-site-header__toggle" type="button" :popovertarget="navId" :aria-label="menuLabel">&#9776;</button>
      <nav :id="navId" class="oc-site-header__nav" popover :aria-label="navLabel">
        <slot name="nav">
          <a v-for="item in items" :key="item.href + item.label" :href="item.href" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
        </slot>
        <slot name="cta" />
      </nav>
    </div>
  </header>
</template>
