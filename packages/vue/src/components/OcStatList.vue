<!-- File: packages/vue/src/components/OcStatList.vue | Map: items -> dl.oc-dl.oc-dl--stat -> rows (label + sublabel, value) -> total row -->
<script setup lang="ts">
/** Stat list (0.18.0): a score or cost breakdown, label / value rows in tabular numbers with an optional total row.
 *  Classes: dl.oc-dl.oc-dl--stat, .oc-dl-row(--total), .oc-dl-term, .oc-dl-sub, .oc-dl-detail */
type Item = { label: string; value: string | number; sublabel?: string }
defineProps<{ items: Item[]; total?: Item }>()
</script>

<template>
  <dl class="oc-dl oc-dl--stat">
    <div v-for="(item, i) in items" :key="i" class="oc-dl-row">
      <dt class="oc-dl-term">{{ item.label }}<span v-if="item.sublabel" class="oc-dl-sub">{{ item.sublabel }}</span></dt>
      <dd class="oc-dl-detail">{{ item.value }}</dd>
    </div>
    <div v-if="total" class="oc-dl-row oc-dl-row--total">
      <dt class="oc-dl-term">{{ total.label }}<span v-if="total.sublabel" class="oc-dl-sub">{{ total.sublabel }}</span></dt>
      <dd class="oc-dl-detail">{{ total.value }}</dd>
    </div>
  </dl>
</template>
