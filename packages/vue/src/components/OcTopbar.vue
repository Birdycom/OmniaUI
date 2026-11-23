<!-- File: packages/vue/src/components/OcTopbar.vue | Map: optional strip -> header.oc-topbar (variant, center, plain, fixed) -> brand (logo + name) -> checkbox toggle + burger -> nav (navmenu links) -> actions -->
<script setup lang="ts">
/**
 * Site bar with brand, menu (.oc-navmenu--site), actions and a burger menu without JavaScript (checkbox).
 * Slots: brand (brand link content after the logo; default `brand`), default (replaces the navmenu inside the nav),
 * actions (.oc-topbar-actions), strip (.oc-topbar-strip above the bar). Attributes go on the header.
 * Classes: .oc-topbar, --collapsible, --dark, --brand, --floating, --center, --plain, --fixed, -brand, -logo, -toggle,
 * -burger, -nav, -actions, -strip, .oc-navmenu, .oc-navmenu--site, .oc-navmenu-link, .oc-navmenu-icon
 */
import { useUid } from '../composables/useUid'
import OcWebicon from './OcWebicon.vue'

defineOptions({ inheritAttrs: false })

export interface TopbarLink {
  label: string
  href: string
  current?: boolean
  /** Icon-only link: webicon name ("mdi:github"); the label becomes its aria-label. */
  icon?: string
}
withDefaults(
  defineProps<{
    brand?: string
    brandHref?: string
    /** Webicon name in .oc-topbar-logo ("mdi:lightning-bolt"). */
    logo?: string
    links?: TopbarLink[]
    variant?: 'dark' | 'brand' | 'floating'
    center?: boolean
    plain?: boolean
    fixed?: boolean
    collapsible?: boolean
    menuLabel?: string
    navLabel?: string
  }>(),
  { brandHref: '/', links: () => [], collapsible: true, menuLabel: 'Toggle menu', navLabel: 'Main' },
)
const toggleId = useUid('oc-topbar')
</script>

<template>
  <div v-if="$slots.strip" class="oc-topbar-strip"><slot name="strip" /></div>
  <header
    v-bind="$attrs"
    :class="['oc-topbar', collapsible && 'oc-topbar--collapsible', variant && `oc-topbar--${variant}`, center && 'oc-topbar--center', plain && 'oc-topbar--plain', fixed && 'oc-topbar--fixed']"
  >
    <a class="oc-topbar-brand" :href="brandHref"><span v-if="logo" class="oc-topbar-logo" aria-hidden="true"><OcWebicon :name="logo" bare fallback="iconify" /></span><slot name="brand">{{ brand }}</slot></a>
    <template v-if="collapsible">
      <input :id="toggleId" type="checkbox" class="oc-topbar-toggle" :aria-label="menuLabel">
      <label class="oc-topbar-burger" :for="toggleId" aria-hidden="true">&#9776;</label>
    </template>
    <nav class="oc-topbar-nav" :aria-label="navLabel">
      <slot>
        <ul class="oc-navmenu oc-navmenu--site">
          <li v-for="l in links" :key="l.href + l.label">
            <a class="oc-navmenu-link" :href="l.href" :aria-current="l.current ? 'page' : undefined" :aria-label="l.icon ? l.label : undefined"><OcWebicon v-if="l.icon" :name="l.icon" class="oc-navmenu-icon" bare fallback="iconify" /><template v-else>{{ l.label }}</template></a>
          </li>
        </ul>
      </slot>
    </nav>
    <div v-if="$slots.actions" class="oc-topbar-actions"><slot name="actions" /></div>
  </header>
</template>
