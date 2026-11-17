<!-- File: packages/vue/src/components/OcCombobox.vue | Map: props + v-model -> filter + keyboard -> template (.oc-combobox, optional icons) -->
<script setup lang="ts">
/**
 * Combobox: an input with a filtered listbox. v-model = chosen value. Typing filters, arrow keys move the active option,
 * Enter or a click chooses, Escape closes. `icon` per option (a webicon name such as "mdi:github" or "flag:nl-4x3")
 * draws an icon in front of the option and of the chosen value. Slot `option` (scoped: { option }) replaces a label.
 * Same markup as packages/ui/snippets/combobox.html.
 */
import { computed, ref } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from './OcWebicon.vue'

export interface ComboboxItem {
  value: string
  label: string
  /** Webicon name ("mdi:github", "flag:nl-4x3") */
  icon?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: ComboboxItem[]
    /** aria-label of the field and the list */
    label?: string
    placeholder?: string
    /** Icon in the field while nothing is chosen */
    icon?: string
    emptyText?: string
    /** Name of a hidden input with the value, for forms */
    name?: string
  }>(),
  { label: 'Choose', emptyText: 'No results' },
)
const model = defineModel<string>()
const listId = useUid('oc-combobox')
const text = ref<string | null>(null)
const open = ref(false)
const active = ref<string | null>(null)

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const chosen = computed(() => props.options.find((o) => o.value === model.value))
const shown = computed(() => (text.value ? props.options.filter((o) => fold(o.label).includes(fold(text.value ?? '').trim())) : props.options))
const enabled = computed(() => shown.value.filter((o) => !o.disabled))
const withIcons = computed(() => !!props.icon || props.options.some((o) => o.icon))
const fieldIcon = computed(() => chosen.value?.icon ?? props.icon)
const optionId = (v: string) => `${listId}-${props.options.findIndex((o) => o.value === v)}`

function choose(o?: ComboboxItem) {
  if (!o || o.disabled) return
  model.value = o.value
  text.value = null
  open.value = false
  active.value = null
}
function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value
  open.value = true
  active.value = enabled.value[0]?.value ?? null
}
function onKey(e: KeyboardEvent) {
  const items = enabled.value
  const at = items.findIndex((o) => o.value === active.value)
  const move = (i: number) => {
    e.preventDefault()
    open.value = true
    active.value = items[(i + items.length) % items.length]?.value ?? null
  }
  if (e.key === 'ArrowDown') move(open.value ? at + 1 : Math.max(at, 0))
  else if (e.key === 'ArrowUp') move(at <= 0 ? items.length - 1 : at - 1)
  else if (e.key === 'Home' && open.value) move(0)
  else if (e.key === 'End' && open.value) move(items.length - 1)
  else if (e.key === 'Enter' && open.value && at >= 0) { e.preventDefault(); choose(items[at]) }
  else if (e.key === 'Escape' && open.value) { e.preventDefault(); open.value = false; text.value = null }
}
function onBlur() {
  open.value = false
  text.value = null
  active.value = null
}
</script>

<template>
  <div class="oc-combobox" :data-open="open ? '' : 'false'">
    <span v-if="withIcons" class="oc-combobox-icon" aria-hidden="true">
      <OcWebicon v-if="fieldIcon" :name="fieldIcon" bare fallback="iconify" />
    </span>
    <input
      class="oc-input oc-combobox-input"
      type="text"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open"
      :aria-controls="listId"
      aria-autocomplete="list"
      :aria-activedescendant="open && active != null ? optionId(active) : undefined"
      :aria-label="label"
      :placeholder="placeholder"
      :value="text ?? chosen?.label ?? ''"
      @input="onInput"
      @keydown="onKey"
      @focus="open = true"
      @click="open = true"
      @blur="onBlur"
    />
    <input v-if="name" type="hidden" :name="name" :value="model ?? ''" />
    <ul :id="listId" class="oc-combobox-list" role="listbox" :aria-label="label">
      <li
        v-for="o in shown"
        :id="optionId(o.value)"
        :key="o.value"
        class="oc-combobox-option"
        role="option"
        tabindex="-1"
        :aria-selected="o.value === model"
        :aria-disabled="o.disabled || undefined"
        :data-active="o.value === active ? '' : undefined"
        @mousedown.prevent
        @click="choose(o)"
      >
        <span v-if="o.icon" class="oc-combobox-option-icon" aria-hidden="true"><OcWebicon :name="o.icon" bare fallback="iconify" /></span>
        <slot name="option" :option="o">{{ o.label }}</slot>
      </li>
      <li v-if="!shown.length" class="oc-combobox-empty" role="presentation">{{ emptyText }}</li>
    </ul>
  </div>
</template>
