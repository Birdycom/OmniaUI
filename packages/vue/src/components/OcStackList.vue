<!-- File: packages/vue/src/components/OcStackList.vue | Map: props (items, neutral, size) -> ul.oc-stack-list -> li pills -->
<script setup lang="ts">
/**
 * Technology pills. Pass `items` (strings or { label, icon }), or your own li.oc-stack-list__item in the default slot.
 * Classes: .oc-stack-list (--neutral, --sm), __item, __icon. Accent: class="oc-accent--violet".
 */
export interface StackListItem {
  label: string
  icon?: string
}
withDefaults(
  defineProps<{
    items?: Array<string | StackListItem>
    neutral?: boolean
    size?: 'default' | 'sm'
  }>(),
  { items: () => [], size: 'default' },
)
const label = (item: string | StackListItem) => (typeof item === 'string' ? item : item.label)
const icon = (item: string | StackListItem) => (typeof item === 'string' ? undefined : item.icon)
</script>

<template>
  <ul :class="['oc-stack-list', neutral && 'oc-stack-list--neutral', size === 'sm' && 'oc-stack-list--sm']">
    <slot>
      <li v-for="(item, i) in items" :key="i" class="oc-stack-list__item">
        <span v-if="icon(item)" class="oc-stack-list__icon" aria-hidden="true">{{ icon(item) }}</span>{{ label(item) }}
      </li>
    </slot>
  </ul>
</template>
