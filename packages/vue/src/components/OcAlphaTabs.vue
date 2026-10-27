<!-- File: packages/vue/src/components/OcAlphaTabs.vue | Map: nav -> "All" item -> one item per letter (current / disabled) -->
<script setup lang="ts">
/**
 * All + A-Z letter filter. v-model = current letter ("all" by default).
 * With `href` (e.g. "?letter={letter}") the items are links; otherwise buttons that update v-model.
 * Classes: nav.oc-alpha-tabs(--wrap/--sm/--plain), .oc-alpha-tabs-item(--all), aria-current, aria-disabled
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    letters?: string[]
    /** Letters with entries; the others are disabled. Default: all. */
    available?: string[]
    /** Link pattern; "{letter}" is replaced, e.g. "?letter={letter}". */
    href?: string
    allLabel?: string
    wrap?: boolean
    size?: 'sm'
    plain?: boolean
  }>(),
  { letters: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), allLabel: 'All' },
)
const current = defineModel<string>({ default: 'all' })

const items = computed(() => [
  { key: 'all', label: props.allLabel, all: true },
  ...props.letters.map((l) => ({ key: l, label: l, all: false })),
])
const isDisabled = (key: string) => key !== 'all' && props.available !== undefined && !props.available.includes(key)
const link = (key: string) => props.href?.replace('{letter}', key)
</script>

<template>
  <nav :class="['oc-alpha-tabs', wrap && 'oc-alpha-tabs--wrap', size && `oc-alpha-tabs--${size}`, plain && 'oc-alpha-tabs--plain']" aria-label="Filter by letter">
    <template v-for="item in items" :key="item.key">
      <a
        v-if="href"
        :class="['oc-alpha-tabs-item', item.all && 'oc-alpha-tabs-item--all']"
        :href="isDisabled(item.key) ? undefined : link(item.key)"
        :aria-current="current === item.key ? 'true' : undefined"
        :aria-disabled="isDisabled(item.key) ? 'true' : undefined"
      >{{ item.label }}</a>
      <button
        v-else
        type="button"
        :class="['oc-alpha-tabs-item', item.all && 'oc-alpha-tabs-item--all']"
        :aria-current="current === item.key ? 'true' : undefined"
        :disabled="isDisabled(item.key)"
        @click="current = item.key"
      >{{ item.label }}</button>
    </template>
  </nav>
</template>
