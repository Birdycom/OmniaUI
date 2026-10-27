<script setup lang="ts">
/**
 * Pagination. v-model = current page (1-based), `pages` = page count. Links point to
 * `hrefFor(page)` (default ?page=n); without a custom hrefFor, clicks update the model instead of navigating.
 */
const props = withDefaults(
  defineProps<{
    pages: number
    hrefFor?: (page: number) => string
    label?: string
  }>(),
  { label: 'Pagination' },
)
const page = defineModel<number>({ default: 1 })

function go(e: Event, n: number) {
  if (!props.hrefFor) e.preventDefault()
  page.value = n
}
</script>

<template>
  <nav class="oc-pagination" :aria-label="label">
    <a
      v-for="n in pages"
      :key="n"
      class="oc-pagination-item"
      :href="hrefFor ? hrefFor(n) : `?page=${n}`"
      :aria-current="n === page ? 'page' : undefined"
      @click="go($event, n)"
    >{{ n }}</a>
  </nav>
</template>
