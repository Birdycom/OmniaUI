<script setup lang="ts">
/**
 * Highlighted flagship product: badge, big title with icon tile, tagline, copy, button and a module list.
 * Slots: cta (default: a gradient link from `ctaLabel` / `ctaHref`). Classes: .oc-spotlight(__title/__tagline/__modules),
 * .oc-accent--<name>, .oc-pill--accent, .oc-status-dot, .oc-icon-tile(--lg/--sm), .oc-lead
 */
export interface SpotlightModule {
  icon?: string
  label: string
}
defineProps<{
  accent?: string
  badge?: string
  icon?: string
  title: string
  tagline?: string
  lead?: string
  ctaLabel?: string
  ctaHref?: string
  modules?: SpotlightModule[]
}>()
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container">
      <div :class="['oc-spotlight', accent && `oc-accent--${accent}`]">
        <div>
          <span v-if="badge" class="oc-pill oc-pill--accent"><span class="oc-status-dot"></span>{{ badge }}</span>
          <h2 class="oc-spotlight__title">
            <span v-if="icon" class="oc-icon-tile oc-icon-tile--lg" aria-hidden="true">{{ icon }}</span>{{ title }}
          </h2>
          <p v-if="tagline" class="oc-spotlight__tagline">{{ tagline }}</p>
          <p v-if="lead" class="oc-lead">{{ lead }}</p>
          <slot name="cta">
            <a v-if="ctaLabel" class="oc-btn oc-btn--gradient oc-btn--lg" :href="ctaHref ?? '#'">{{ ctaLabel }}</a>
          </slot>
        </div>
        <ul v-if="modules?.length" class="oc-spotlight__modules">
          <li v-for="m in modules" :key="m.label">
            <span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">{{ m.icon }}</span>{{ m.label }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
