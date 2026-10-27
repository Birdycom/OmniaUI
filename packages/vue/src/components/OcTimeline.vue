<!-- File: packages/vue/src/components/OcTimeline.vue | Map: props (items, size, accent) -> ol.oc-timeline -> li.oc-timeline__item -->
<script setup lang="ts">
/**
 * Vertical timeline. Pass `items`, or put your own li.oc-timeline__item elements in the default slot.
 * Classes: .oc-timeline (--lg, --accent), .oc-timeline__item (--current), __date, __title, __text
 */
export interface TimelineEntry {
  date: string
  /** Renders a <time datetime> when set. */
  dateTime?: string
  title?: string
  text?: string
  current?: boolean
}
withDefaults(
  defineProps<{
    items?: TimelineEntry[]
    size?: 'default' | 'lg'
    accent?: boolean
  }>(),
  { items: () => [], size: 'default', accent: false },
)
</script>

<template>
  <ol :class="['oc-timeline', size === 'lg' && 'oc-timeline--lg', accent && 'oc-timeline--accent']">
    <slot>
      <li v-for="(item, i) in items" :key="i" :class="['oc-timeline__item', item.current && 'oc-timeline__item--current']">
        <time v-if="item.dateTime" class="oc-timeline__date" :datetime="item.dateTime">{{ item.date }}</time>
        <span v-else class="oc-timeline__date">{{ item.date }}</span>
        <h3 v-if="item.title" class="oc-timeline__title">{{ item.title }}</h3>
        <p v-if="item.text" class="oc-timeline__text">{{ item.text }}</p>
      </li>
    </slot>
  </ol>
</template>
