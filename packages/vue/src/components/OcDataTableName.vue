<!-- File: packages/vue/src/components/OcDataTableName.vue | Map: props -> avatar + name line + second line -->
<script setup lang="ts">
/** Name cell of a data table: avatar (initials or image), name with a badge (slot) and a muted second line. */
import { computed } from 'vue'

const props = defineProps<{ name: string; initials?: string; avatar?: string; sub?: string }>()
const letters = computed(() => props.initials ?? props.name.split(/[\s&-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase())
</script>

<template>
  <span class="oc-data-table-name">
    <span class="oc-avatar" aria-hidden="true"><img v-if="avatar" :src="avatar" alt=""><template v-else>{{ letters }}</template></span>
    <span class="oc-data-table-name-text">
      <span class="oc-data-table-name-line">{{ name }} <slot name="badge" /></span>
      <span v-if="sub || $slots.sub" class="oc-data-table-name-sub"><slot name="sub">{{ sub }}</slot></span>
    </span>
  </span>
</template>
