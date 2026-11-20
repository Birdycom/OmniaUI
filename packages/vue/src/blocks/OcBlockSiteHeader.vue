<script setup lang="ts">
/**
 * Sticky header that turns into glass after scrolling; the mobile menu is a popover. No JavaScript needed.
 * Slots: brand (inside the brand link), brand-icon (the svg/img of a brandMark), nav (replaces the items), cta (the trailing
 * button), actions (right zone .oc-site-header__actions, outside the menu).
 * container: fold the menu at the width of the header itself, not of the window (.oc-site-header--container, 0.17.0).
 * brandMark: a .oc-brand-mark as the logo link. progress: reading-progress line. variant: center | dark | floating | glass.
 * menuIcon: webicon name for the menu button (default the menu character).
 * Classes: .oc-site-header, --container, --center, --dark, --floating, --glass, __inner, __brand, __toggle, __nav, __actions, __progress, .oc-container
 */
import { useUid } from '../composables/useUid'
import OcBrandMark from '../components/OcBrandMark.vue'
import OcWebicon from '../components/OcWebicon.vue'

export interface SiteHeaderLink {
  label: string
  href: string
  current?: boolean
}
export interface SiteHeaderBrandMark {
  name: string
  accent?: string
  tagline?: string
  size?: 'sm' | 'md' | 'lg'
  /** aria-label of the logo link ("Company 1, home"). */
  label?: string
}
withDefaults(
  defineProps<{
    items?: SiteHeaderLink[]
    homeHref?: string
    menuLabel?: string
    navLabel?: string
    container?: boolean
    brandMark?: SiteHeaderBrandMark
    progress?: boolean
    variant?: 'center' | 'dark' | 'floating' | 'glass'
    menuIcon?: string
  }>(),
  { items: () => [], homeHref: '/', menuLabel: 'Menu', navLabel: 'Main' },
)
const navId = useUid('oc-site-nav')
</script>

<template>
  <header :class="['oc-site-header', variant && `oc-site-header--${variant}`, { 'oc-site-header--container': container }]">
    <div class="oc-container oc-site-header__inner">
      <OcBrandMark
        v-if="brandMark"
        :href="homeHref"
        :name="brandMark.name"
        :accent="brandMark.accent"
        :tagline="brandMark.tagline"
        :size="brandMark.size ?? 'md'"
        :aria-label="brandMark.label"
      ><template #icon><slot name="brand-icon" /></template></OcBrandMark>
      <a v-else class="oc-site-header__brand" :href="homeHref"><slot name="brand" /></a>
      <button class="oc-site-header__toggle" type="button" :popovertarget="navId" :aria-label="menuLabel"><OcWebicon v-if="menuIcon" :name="menuIcon" bare fallback="iconify" /><template v-else>&#9776;</template></button>
      <nav :id="navId" class="oc-site-header__nav" popover :aria-label="navLabel">
        <slot name="nav">
          <a v-for="item in items" :key="item.href + item.label" :href="item.href" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
        </slot>
        <slot name="cta" />
      </nav>
      <div v-if="$slots.actions" class="oc-site-header__actions"><slot name="actions" /></div>
    </div>
    <span v-if="progress" class="oc-site-header__progress" aria-hidden="true"></span>
  </header>
</template>
