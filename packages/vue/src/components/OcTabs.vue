<script setup lang="ts">
/**
 * Tabs with radio inputs and :has() (the CSS switches the panels). v-model = value of the active tab.
 * One named slot per tab value renders its panel: <template #account>...</template>.
 * Classes: .oc-tabset, .oc-tab-list, .oc-tab-trigger, .oc-tab-panel
 */
import { useUid } from '../composables/useUid'

export interface TabItem {
  label: string
  /** Slot name and model value; defaults to the label. */
  value?: string
}
defineProps<{ tabs: TabItem[]; name?: string }>()
const model = defineModel<string>()
const uid = useUid('oc-tabs')
</script>

<template>
  <div class="oc-tabset">
    <div class="oc-tab-list" role="tablist">
      <label v-for="(tab, i) in tabs" :key="tab.value ?? tab.label" class="oc-tab-trigger">
        <input
          v-model="model"
          type="radio"
          :name="name ?? uid"
          :value="tab.value ?? tab.label"
          :checked="model === undefined && i === 0"
        />
        {{ tab.label }}
      </label>
    </div>
    <div v-for="tab in tabs" :key="tab.value ?? tab.label" class="oc-tab-panel">
      <slot :name="tab.value ?? tab.label" />
    </div>
  </div>
</template>
