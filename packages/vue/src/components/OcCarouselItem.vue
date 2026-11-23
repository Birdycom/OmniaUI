<!-- File: packages/vue/src/components/OcCarouselItem.vue | Map: props (index, total) -> div.oc-carousel-item (role group, "2 of 4") -->
<script setup lang="ts">
/** One slide of OcCarousel (OcCarousel sets index and total: aria-label "2 of 4"). Class: .oc-carousel-item */
defineProps<{ index?: number; total?: number }>()
</script>

<template>
  <div
    class="oc-carousel-item"
    role="group"
    aria-roledescription="slide"
    :aria-label="index != null && total != null ? `${index + 1} of ${total}` : undefined"
  >
    <slot />
  </div>
</template>
