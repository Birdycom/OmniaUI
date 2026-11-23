<!-- File: packages/vue/src/blocks/OcBlockTypePicker.vue | Map: props -> filter state -> head -> tools (search, category chips) -> radio cards (preview slot) -> empty -> footer slot -->
<script setup lang="ts">
/**
 * Gallery of content types to add, each card with a small preview, picked like radios (click or arrow keys).
 * mode="action": every card is a button, a click emits `pick` (value, option); `draggable` cards emit `item-dragstart`;
 * an option with `disabledReason` stays focusable and shows why; the arrow keys only move the focus.
 * v-model = picked value. Slots: preview (scoped: { option }), footer. Classes: .oc-block-type-picker, -head, -title, -text,
 * -tools, -search, -cats, -grid, -item, -input, -preview, -name, -hint, -empty, -foot
 */
import { computed, ref } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'

export interface TypePickerOption {
  value: string
  label: string
  hint?: string
  category?: string
  disabled?: boolean
  /** Action mode: why the card cannot be used now (shown on the card, the card stays focusable). */
  disabledReason?: string
}
export interface TypePickerCategory {
  value: string
  label: string
}
const props = withDefaults(
  defineProps<{
    title?: string
    text?: string
    options: TypePickerOption[]
    categories?: TypePickerCategory[]
    search?: boolean
    searchLabel?: string
    allLabel?: string
    categoryLabel?: string
    typeLabel?: string
    emptyText?: string
    name?: string
    mode?: 'pick' | 'action'
    draggable?: boolean
  }>(),
  {
    title: 'Add a block', categories: () => [], search: true, searchLabel: 'Search blocks', allLabel: 'All',
    categoryLabel: 'Category', typeLabel: 'Block type', emptyText: 'No block matches your search.', mode: 'pick',
  },
)
const emit = defineEmits<{ pick: [value: string, option: TypePickerOption]; 'item-dragstart': [option: TypePickerOption, event: DragEvent] }>()
const off = (o: TypePickerOption) => !!(o.disabled || o.disabledReason)
function moveFocus(e: KeyboardEvent) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(e.key)) return
  const items = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.oc-block-type-picker-item')]
  const at = items.indexOf(document.activeElement as HTMLElement)
  if (at < 0) return
  e.preventDefault()
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : at + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)
  items[(next + items.length) % items.length]?.focus()
}
const model = defineModel<string>()
const titleId = useUid('oc-picker-title')
const auto = useUid('oc-picker')
const group = computed(() => props.name ?? auto)
const query = ref('')
const cat = ref('all')
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.options.filter((o) => (cat.value === 'all' || o.category === cat.value) && (!q || `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(q)))
})
</script>

<template>
  <section :class="['oc-block-type-picker', mode === 'action' && 'oc-block-type-picker--action']" :aria-labelledby="titleId">
    <div class="oc-block-type-picker-head">
      <h2 :id="titleId" class="oc-block-type-picker-title">{{ title }}</h2>
      <p v-if="text" class="oc-block-type-picker-text">{{ text }}</p>
    </div>
    <div v-if="search || categories.length" class="oc-block-type-picker-tools">
      <div v-if="search" class="oc-input-group oc-input-group--affix">
        <span class="oc-input-addon" aria-hidden="true"><OcWebicon name="mdi:magnify" bare fallback="iconify" /></span>
        <input v-model="query" class="oc-input oc-block-type-picker-search" type="search" :placeholder="searchLabel" :aria-label="searchLabel">
      </div>
      <fieldset v-if="categories.length" class="oc-chip-filter oc-chip-filter--sm oc-block-type-picker-cats" :aria-label="categoryLabel">
        <label v-for="c in [{ value: 'all', label: allLabel }, ...categories]" :key="c.value" class="oc-chip-filter-item">
          <input v-model="cat" type="radio" :name="`${group}-cat`" :value="c.value"> {{ c.label }}
        </label>
      </fieldset>
    </div>
    <div v-if="mode === 'action'" class="oc-block-type-picker-grid" role="group" :aria-label="typeLabel" @keydown="moveFocus">
      <button
        v-for="o in shown"
        :key="o.value"
        type="button"
        class="oc-block-type-picker-item"
        :data-category="o.category"
        :data-value="o.value"
        :aria-disabled="off(o) ? 'true' : undefined"
        :aria-describedby="o.disabledReason ? `${group}-${o.value}-reason` : undefined"
        :draggable="draggable && !off(o) ? 'true' : undefined"
        @dragstart="draggable && !off(o) && emit('item-dragstart', o, $event)"
        @click="!off(o) && emit('pick', o.value, o)"
      >
        <span v-if="$slots.preview" class="oc-block-type-picker-preview" aria-hidden="true"><slot name="preview" :option="o" /></span>
        <span class="oc-block-type-picker-name">{{ o.label }}</span>
        <span v-if="o.hint" class="oc-block-type-picker-hint">{{ o.hint }}</span>
        <span v-if="o.disabledReason" :id="`${group}-${o.value}-reason`" class="oc-block-type-picker-reason">{{ o.disabledReason }}</span>
      </button>
      <p v-if="!shown.length" class="oc-block-type-picker-empty">{{ emptyText }}</p>
    </div>
    <fieldset v-else class="oc-block-type-picker-grid">
      <legend class="oc-visually-hidden">{{ typeLabel }}</legend>
      <label v-for="o in shown" :key="o.value" class="oc-block-type-picker-item" :data-category="o.category">
        <input v-model="model" class="oc-block-type-picker-input" type="radio" :name="group" :value="o.value" :disabled="o.disabled">
        <span v-if="$slots.preview" class="oc-block-type-picker-preview" aria-hidden="true"><slot name="preview" :option="o" /></span>
        <span class="oc-block-type-picker-name">{{ o.label }}</span>
        <span v-if="o.hint" class="oc-block-type-picker-hint">{{ o.hint }}</span>
      </label>
      <p v-if="!shown.length" class="oc-block-type-picker-empty">{{ emptyText }}</p>
    </fieldset>
    <div v-if="$slots.footer" class="oc-block-type-picker-foot"><slot name="footer" /></div>
  </section>
</template>
