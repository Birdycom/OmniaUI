<!-- File: packages/vue/src/components/OcBrowserFrame.vue | Map: props -> figure -> bar (dots, address, actions) -> view (slot or img) -> caption -->
<script setup lang="ts">
/**
 * Fake browser chrome (same markup as snippets/browser-frame.html).
 * Props: url (address pill), src / alt (screenshot), caption, minimal, dark, tilt, auto (free height), ratio ("16 / 9").
 * glow (accent shadow, zoom on hover), mark (webicon name in a large tile on the bottom end corner), markAccent.
 * Slots: default (live content, replaces the screenshot), actions (glyphs right in the bar), caption, mark (own mark).
 * Classes: .oc-browser-frame(--minimal/--dark/--tilt/--auto/--glow), __bar, __address, __actions, __view, __mark, __caption
 */
import OcWebicon from './OcWebicon.vue'

withDefaults(
  defineProps<{ url?: string; src?: string; alt?: string; caption?: string; minimal?: boolean; dark?: boolean; tilt?: boolean; auto?: boolean; ratio?: string; glow?: boolean; mark?: string; markAccent?: string }>(),
  { alt: '' },
)
</script>

<template>
  <figure
    :class="['oc-browser-frame', minimal && 'oc-browser-frame--minimal', dark && 'oc-browser-frame--dark', tilt && 'oc-browser-frame--tilt', auto && 'oc-browser-frame--auto', glow && 'oc-browser-frame--glow']"
    :style="ratio ? { '--oc-browser-frame-ratio': ratio } : undefined"
  >
    <div class="oc-browser-frame__bar">
      <i /><i /><i />
      <span v-if="url" class="oc-browser-frame__address">{{ url }}</span>
      <span v-if="$slots.actions" class="oc-browser-frame__actions" aria-hidden="true"><slot name="actions" /></span>
    </div>
    <div class="oc-browser-frame__view">
      <slot>
        <img v-if="src" :src="src" :alt="alt" />
        <div v-else class="oc-media-art" role="img" :aria-label="alt" />
      </slot>
    </div>
    <span v-if="$slots.mark" class="oc-browser-frame__mark"><slot name="mark" /></span>
    <span v-else-if="mark" :class="['oc-browser-frame__mark oc-icon-tile oc-icon-tile--lg', markAccent && `oc-accent--${markAccent}`]" aria-hidden="true"><OcWebicon :name="mark" bare fallback="iconify" /></span>
    <figcaption v-if="caption || $slots.caption" class="oc-browser-frame__caption"><slot name="caption">{{ caption }}</slot></figcaption>
  </figure>
</template>
