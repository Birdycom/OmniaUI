<!-- File: packages/vue/src/components/OcBrowserFrame.vue | Map: props -> figure -> bar (dots, address, actions) -> view (slot or img) -> caption -->
<script setup lang="ts">
/**
 * Fake browser chrome (same markup as snippets/browser-frame.html).
 * Props: url (address pill), src / alt (screenshot), caption, minimal, dark, tilt, auto (free height), ratio ("16 / 9").
 * Slots: default (live content, replaces the screenshot), actions (glyphs right in the bar), caption.
 * Classes: .oc-browser-frame(--minimal/--dark/--tilt/--auto), __bar, __address, __actions, __view, __caption
 */
withDefaults(
  defineProps<{ url?: string; src?: string; alt?: string; caption?: string; minimal?: boolean; dark?: boolean; tilt?: boolean; auto?: boolean; ratio?: string }>(),
  { alt: '' },
)
</script>

<template>
  <figure
    :class="['oc-browser-frame', minimal && 'oc-browser-frame--minimal', dark && 'oc-browser-frame--dark', tilt && 'oc-browser-frame--tilt', auto && 'oc-browser-frame--auto']"
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
    <figcaption v-if="caption || $slots.caption" class="oc-browser-frame__caption"><slot name="caption">{{ caption }}</slot></figcaption>
  </figure>
</template>
