<script setup lang="ts">
/**
 * Tabs with radio inputs and :has() (the CSS switches the panels). v-model = value of the active tab.
 * One named slot per tab value renders its panel: <template #account>...</template>.
 * variant: pill | vertical. mode="buttons": class-toggle tabs (button role=tab, aria-selected, .is-active on the panel).
 * Tab items may have an icon (webicon name), a count (+ countTone) and disabled.
 * Compound (0.17.0): leave out `tabs` and use OcTabsList / OcTabsTrigger / OcTabsContent as children (class-toggle tabs,
 * arrow keys); v-model / default-value = the active value. module = data-module on the root.
 * Classes: .oc-tabs (compound root), .oc-tabset, .oc-tab-list(--pill/--vertical), .oc-tab-trigger, .oc-tab-panel, .oc-data-table-tabs, .oc-data-table-tab-count
 */
import { computed, provide, toRef } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from './OcWebicon.vue'
import { tabsKey } from '../composables/keys-d3'
import { revealTab } from '../../../ui/src/tabs.js'

export interface TabItem {
  label: string
  /** Slot name and model value; defaults to the label. */
  value?: string
  /** Webicon name before the label ("mdi:domain"). */
  icon?: string
  /** Count after the label; the tab list then gets .oc-data-table-tabs. */
  count?: string | number
  countTone?: 'success' | 'info' | 'warning'
  disabled?: boolean
}
const props = withDefaults(
  defineProps<{
    /** The tabs (props API). Leave it out for the compound API. */
    tabs?: TabItem[]
    /** Compound API: active value when v-model is not bound. */
    defaultValue?: string
    /** Module color (data-module on the root). */
    module?: string
    name?: string
    variant?: 'pill' | 'vertical'
    /** radio (default): radio inputs + :has(). buttons: class-toggle tabs (the component holds the state). */
    mode?: 'radio' | 'buttons'
    /** aria-label of the tab list. */
    listLabel?: string
  }>(),
  { mode: 'radio' },
)
const model = defineModel<string>()
const uid = useUid('oc-tabs')
const group = computed(() => props.name ?? uid)
const key = (tab: TabItem) => tab.value ?? tab.label
const items = computed(() => props.tabs ?? [])
const firstIndex = computed(() => Math.max(0, items.value.findIndex((t) => !t.disabled)))
const active = computed(() => model.value ?? (props.tabs ? (items.value[firstIndex.value] ? key(items.value[firstIndex.value]) : undefined) : props.defaultValue))
provide(tabsKey, {
  value: active,
  select: (value: string) => { model.value = value },
  base: props.name ?? uid,
  variant: toRef(props, 'variant'),
})
const listClass = computed(() => [
  'oc-tab-list',
  props.variant && `oc-tab-list--${props.variant}`,
  items.value.some((t) => t.count != null && t.count !== '') && 'oc-data-table-tabs',
])
</script>

<template>
  <div v-if="!tabs" class="oc-tabs" :data-module="module"><slot /></div>
  <div v-else-if="mode === 'buttons'" :data-module="module">
    <div :class="listClass" role="tablist" :aria-label="listLabel">
      <button
        v-for="(tab, i) in tabs"
        :id="`${group}-tab-${i + 1}`"
        :key="key(tab)"
        class="oc-tab-trigger"
        type="button"
        role="tab"
        :aria-selected="active === key(tab) ? 'true' : 'false'"
        :aria-controls="`${group}-${i + 1}`"
        :disabled="tab.disabled || undefined"
        @click="model = key(tab); revealTab($event.currentTarget as HTMLElement)"
      >
        <OcWebicon v-if="tab.icon" :name="tab.icon" bare fallback="iconify" />{{ tab.label }}<span
          v-if="tab.count != null && tab.count !== ''"
          :class="['oc-data-table-tab-count', tab.countTone && `oc-data-table-tab-count--${tab.countTone}`]"
        >{{ tab.count }}</span>
      </button>
    </div>
    <div
      v-for="(tab, i) in tabs"
      :id="`${group}-${i + 1}`"
      :key="key(tab)"
      :class="['oc-tab-panel', active === key(tab) && 'is-active']"
      role="tabpanel"
      :aria-labelledby="`${group}-tab-${i + 1}`"
    >
      <slot :name="key(tab)" />
    </div>
  </div>
  <div v-else class="oc-tabset" :data-module="module">
    <div :class="listClass" role="tablist" :aria-label="listLabel">
      <label v-for="(tab, i) in tabs" :key="key(tab)" class="oc-tab-trigger">
        <input
          v-model="model"
          type="radio"
          :name="group"
          :value="key(tab)"
          :checked="model === undefined && i === firstIndex"
          :disabled="tab.disabled || undefined"
        />
        <OcWebicon v-if="tab.icon" :name="tab.icon" bare fallback="iconify" />
        {{ tab.label }}
        <span
          v-if="tab.count != null && tab.count !== ''"
          :class="['oc-data-table-tab-count', tab.countTone && `oc-data-table-tab-count--${tab.countTone}`]"
        >{{ tab.count }}</span>
      </label>
    </div>
    <div v-for="tab in tabs" :key="key(tab)" class="oc-tab-panel">
      <slot :name="key(tab)" />
    </div>
  </div>
</template>
