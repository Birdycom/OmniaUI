<!-- File: packages/vue/src/components/OcProjectCard.vue | Map: props -> a.oc-project-card -> frame (bar + shot) -> body -->
<script setup lang="ts">
/**
 * Portfolio card with a browser-like preview. Without `image` the preview is an accent gradient.
 * Slots: type, name, meta, more. Classes: .oc-project-card (--flat), __frame, __bar, __shot, __body, __type, __name, __meta, __more
 */
withDefaults(
  defineProps<{
    href: string
    name?: string
    type?: string
    meta?: string
    more?: string
    image?: string
    imageAlt?: string
    flat?: boolean
  }>(),
  { more: 'View project', imageAlt: '' },
)
</script>

<template>
  <a :class="['oc-project-card', flat && 'oc-project-card--flat']" :href="href">
    <span class="oc-project-card__frame">
      <span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span>
      <img v-if="image" class="oc-project-card__shot" :src="image" :alt="imageAlt" loading="lazy" />
      <span v-else class="oc-project-card__shot" role="img" :aria-label="imageAlt || undefined" :aria-hidden="imageAlt ? undefined : 'true'"></span>
    </span>
    <span class="oc-project-card__body">
      <span v-if="type || $slots.type" class="oc-project-card__type"><slot name="type">{{ type }}</slot></span>
      <span class="oc-project-card__name"><slot name="name">{{ name }}</slot></span>
      <span v-if="meta || $slots.meta" class="oc-project-card__meta"><slot name="meta">{{ meta }}</slot></span>
      <span v-if="more" class="oc-project-card__more"><slot name="more">{{ more }}</slot></span>
    </span>
  </a>
</template>
