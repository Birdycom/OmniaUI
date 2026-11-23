<!-- File: packages/vue/src/blockParts/OcSidebarBlock.vue | Map: props -> aside (brand header, groups: label / details, items: link / sub list / collapsible, user footer) -> main (bar with breadcrumb, body) -->
<script setup lang="ts">
/**
 * @internal Shared renderer of the sidebar page blocks (OcBlockSidebar01..05). Not listed as a block: it lives outside src/blocks.
 * Slots: header (replaces the brand row), footer (replaces the user row), bar (extra content after the breadcrumb),
 * default (main column; default the placeholder blocks of the snippet).
 */
import OcWebicon from '../components/OcWebicon.vue'
import { initialsOf, SIDEBAR_BRAND, SIDEBAR_CRUMBS } from './sidebarBlock'
import type { SidebarBlockProps } from './sidebarBlock'

withDefaults(defineProps<SidebarBlockProps>(), {
  brand: () => SIDEBAR_BRAND,
  groups: () => [],
  user: null,
  breadcrumbs: () => SIDEBAR_CRUMBS,
  submenu: 'list',
  navLabel: 'Main navigation',
})
</script>

<template>
  <div :class="['oc-block-sb', floating && 'oc-block-sb--floating']">
    <aside :class="['oc-sidebar', floating && 'oc-sidebar--floating']" :aria-label="navLabel">
      <div v-if="$slots.header || brand" class="oc-sidebar-header">
        <slot name="header">
          <a v-if="brand" class="oc-sidebar-menu-button oc-sidebar-menu-button--lg" :href="brand.href ?? '#'">
            <span class="oc-block-sb-tile"><OcWebicon :name="brand.icon ?? 'mdi:layers-outline'" bare fallback="iconify" /></span>
            <span class="oc-sidebar-menu-label"><strong>{{ brand.title }}</strong><span v-if="brand.sub" class="oc-block-sb-sub">{{ brand.sub }}</span></span>
          </a>
        </slot>
      </div>
      <div class="oc-sidebar-content">
        <template v-for="(g, gi) in groups" :key="gi">
          <component :is="collapsibleGroups ? 'details' : 'div'" :class="collapsibleGroups ? 'oc-block-sb-group' : 'oc-sidebar-group'" :open="collapsibleGroups ? g.open ?? true : undefined">
            <summary v-if="collapsibleGroups">{{ g.label }}</summary>
            <div v-else-if="g.label" class="oc-sidebar-group-label">{{ g.label }}</div>
            <ul class="oc-sidebar-menu">
              <li v-for="(item, ii) in g.items" :key="ii">
                <details v-if="item.items && submenu === 'collapsible'" class="oc-sidebar-collapsible" :open="item.open">
                  <summary class="oc-sidebar-menu-button">
                    <OcWebicon v-if="item.icon" :name="item.icon" class="oc-sidebar-menu-icon" bare fallback="iconify" /><span class="oc-sidebar-menu-label">{{ item.label }}</span><span v-if="item.badge != null" class="oc-sidebar-menu-badge">{{ item.badge }}</span>
                  </summary>
                  <ul class="oc-sidebar-menu-sub">
                    <li v-for="(s, si) in item.items" :key="si"><a class="oc-sidebar-menu-button" :href="s.href ?? '#'" :aria-current="s.current ? 'page' : undefined">{{ s.label }}</a></li>
                  </ul>
                </details>
                <template v-else>
                  <a class="oc-sidebar-menu-button" :href="item.href ?? '#'" :aria-current="item.current ? 'page' : undefined"><OcWebicon v-if="item.icon" :name="item.icon" class="oc-sidebar-menu-icon" bare fallback="iconify" /><span class="oc-sidebar-menu-label">{{ item.label }}</span><span v-if="item.badge != null" class="oc-sidebar-menu-badge">{{ item.badge }}</span></a>
                  <ul v-if="item.items" class="oc-sidebar-menu-sub">
                    <li v-for="(s, si) in item.items" :key="si"><a class="oc-sidebar-menu-button" :href="s.href ?? '#'" :aria-current="s.current ? 'page' : undefined">{{ s.label }}</a></li>
                  </ul>
                </template>
              </li>
            </ul>
          </component>
        </template>
      </div>
      <div v-if="$slots.footer || user" class="oc-sidebar-footer">
        <slot name="footer">
          <div v-if="user" class="oc-user">
            <span class="oc-avatar oc-avatar--sm">{{ user.initials ?? initialsOf(user.name) }}</span>
            <span class="oc-user-text"><span class="oc-user-name">{{ user.name }}</span><span v-if="user.email" class="oc-user-email">{{ user.email }}</span></span>
          </div>
        </slot>
      </div>
    </aside>
    <div class="oc-block-sb-main">
      <header class="oc-block-sb-bar">
        <span class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" aria-hidden="true"><OcWebicon name="mdi:dock-left" bare fallback="iconify" /></span>
        <span class="oc-block-sb-sep"></span>
        <nav v-if="breadcrumbs.length" aria-label="Breadcrumb">
          <ol class="oc-breadcrumb oc-breadcrumb--chevron">
            <li v-for="(c, ci) in breadcrumbs" :key="ci" class="oc-breadcrumb-item" :aria-current="c.href && ci < breadcrumbs.length - 1 ? undefined : 'page'">
              <a v-if="c.href && ci < breadcrumbs.length - 1" :href="c.href"><OcWebicon v-if="c.icon" :name="c.icon" bare fallback="iconify" />{{ c.label }}</a>
              <template v-else><OcWebicon v-if="c.icon" :name="c.icon" bare fallback="iconify" />{{ c.label }}</template>
            </li>
          </ol>
        </nav>
        <slot name="bar" />
      </header>
      <div class="oc-block-sb-body">
        <slot>
          <div class="oc-block-sb-ph"></div><div class="oc-block-sb-ph"></div><div class="oc-block-sb-ph"></div>
          <div class="oc-block-sb-ph oc-block-sb-ph--wide"></div>
        </slot>
      </div>
    </div>
  </div>
</template>
