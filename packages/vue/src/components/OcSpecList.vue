<!-- File: packages/vue/src/components/OcSpecList.vue | Map: groups -> group title -> rows (label, value, note) -->
<script setup lang="ts">
/** Technical specifications in named groups (same markup as snippets/spec-list.html). */
export interface SpecGroup { title: string; rows: { label: string; value: string; note?: string }[] }
defineProps<{ groups: SpecGroup[]; stack?: boolean }>()
</script>

<template>
  <div :class="['oc-spec-list', stack && 'oc-spec-list--stack']">
    <section v-for="(group, g) in groups" :key="g" class="oc-spec-group">
      <h3 class="oc-spec-group__title">{{ group.title }}</h3>
      <dl class="oc-spec-group__rows">
        <div v-for="(row, r) in group.rows" :key="r" class="oc-spec-row"><dt>{{ row.label }}</dt><dd>{{ row.value }}<small v-if="row.note">{{ row.note }}</small></dd></div>
      </dl>
    </section>
  </div>
</template>
