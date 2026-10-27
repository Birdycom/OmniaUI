<!-- File: packages/vue/src/components/OcMarquee.vue | Map: props -> .oc-marquee -> track (items + aria-hidden copy) -->
<script setup lang="ts">
/**
 * Endless strip; pauses on hover / focus, stands still with reduced motion. The items are rendered twice
 * (the copy is aria-hidden). Classes: .oc-marquee (--reverse, --slow, --fast, --plain, --no-fade), __track, __item
 */
withDefaults(
  defineProps<{
    items: string[]
    label?: string
    reverse?: boolean
    speed?: 'default' | 'slow' | 'fast'
    plain?: boolean
    noFade?: boolean
  }>(),
  { speed: 'default' },
)
</script>

<template>
  <div
    :class="[
      'oc-marquee',
      reverse && 'oc-marquee--reverse',
      speed !== 'default' && `oc-marquee--${speed}`,
      plain && 'oc-marquee--plain',
      noFade && 'oc-marquee--no-fade',
    ]"
    :aria-label="label"
  >
    <div class="oc-marquee__track">
      <span v-for="(item, i) in items" :key="i" class="oc-marquee__item">{{ item }}</span>
      <span v-for="(item, i) in items" :key="'copy-' + i" class="oc-marquee__item" aria-hidden="true">{{ item }}</span>
    </div>
  </div>
</template>
