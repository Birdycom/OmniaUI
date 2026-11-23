<!-- File: packages/vue/src/components/OcCombobox.vue | Map: props + v-model -> rows (clear, options, custom) -> filter or server search (debounce) -> portal position -> keyboard -> template (.oc-combobox, optional icons, catalog extras) -->
<script setup lang="ts">
/**
 * Combobox: an input with a filtered listbox. v-model = chosen value. Typing filters, arrow keys move the active option,
 * Enter or a click chooses, Escape closes. `icon` per option (a webicon name such as "mdi:github" or "flag:nl-4x3")
 * draws an icon in front of the option and of the chosen value. Slot `option` (scoped: { option }) replaces a label.
 * Same markup as packages/ui/snippets/combobox.html.
 * Catalog mode (0.17.0, all optional): valueType="number" (v-model gets numbers; the clear row gives null), `@search`
 * (debounced by searchDelay; no local filter, pass the results as options) + `loading` + `selected` (the chosen option
 * when it is not in options), `clearLabel` (first row that clears), `manageHref` / `manageLabel` / `@manage` (footer link
 * outside the listbox), `allowCustomFromSearch` + `customLabel` + `@custom` (take what was typed), `portal` (list in
 * document.body), options with `description`, `image` or `emoji`, `variant="ledger"`, `module`.
 * Header trigger (0.17.2): trigger-variant="ghost" (no border, shadow or margin; muted text, fuller on hover with a light
 * background), size="full" (default) | "header" (36px high, 6.5rem to 14rem wide; the list goes to document.body unless
 * :portal="false"), icon-only (with header: a square 36x36 button that shows trigger-label, else the icon / image / emoji
 * of the chosen option, else a dots icon), trigger-aria-label (aria-label of the field; default: label).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from './OcWebicon.vue'

export interface ComboboxItem {
  value: string | number
  label: string
  /** Webicon name ("mdi:github", "flag:nl-4x3") */
  icon?: string
  /** Muted second line under the label */
  description?: string
  /** Image URL in front of the label (decorative) */
  image?: string
  /** Emoji in front of the label */
  emoji?: string
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
    /** "number": v-model gets numbers */
    valueType?: 'string' | 'number'
    /** Server search (bind with @search): no local filter */
    onSearch?: (query: string) => void
    /** Debounce of @search in ms */
    searchDelay?: number
    loading?: boolean
    loadingText?: string
    /** The chosen option when it is not in options */
    selected?: ComboboxItem | null
    /** Text of a first row that clears the choice */
    clearLabel?: string
    /** Manage link in a footer under the list */
    manageHref?: string
    manageLabel?: string
    /** Bind with @manage: the footer link without (or next to) manageHref */
    onManage?: () => void
    /** Offer what was typed when nothing matches exactly */
    allowCustomFromSearch?: boolean
    /** Text of that row; {query} is replaced */
    customLabel?: string
    /** Render the list in document.body */
    portal?: boolean
    variant?: 'ledger'
    /** Module colour name: data-module */
    module?: string
    /** 0.17.2: ghost = a trigger for a header bar */
    triggerVariant?: 'default' | 'ghost'
    /** 0.17.2: full (default) or header (compact, 36px) */
    size?: 'full' | 'header'
    /** 0.17.2, with size="header": a square icon-only trigger */
    iconOnly?: boolean
    /** 0.17.2: short code in an icon-only trigger ("NL") */
    triggerLabel?: string
    /** 0.17.2: aria-label of the field (default: label) */
    triggerAriaLabel?: string
  }>(),
  { portal: undefined, size: 'full', label: 'Choose', emptyText: 'No results', valueType: 'string', searchDelay: 250, loadingText: 'Loading...', manageLabel: 'Manage', customLabel: 'Use "{query}"' },
)
const emit = defineEmits<{ custom: [query: string] }>()
// string | number | null; typed loosely (like OcSelect) so existing string handlers keep compiling.
const model = defineModel<any>()
const listId = useUid('oc-combobox')
const text = ref<string | null>(null)
const open = ref(false)
const active = ref<string | null>(null)
const picked = ref<ComboboxItem | null>(null)

type Row = { key: string; kind: 'clear' | 'option' | 'custom'; option?: ComboboxItem; disabled?: boolean }

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const same = (a: unknown, b: unknown) => a != null && b != null && String(a) === String(b)
const remote = computed(() => !!props.onSearch)
const query = computed(() => (text.value ?? '').trim())
const chosen = computed(
  () =>
    props.options.find((o) => same(o.value, model.value))
    ?? (props.selected && same(props.selected.value, model.value) ? props.selected : undefined)
    ?? (picked.value && same(picked.value.value, model.value) ? picked.value : undefined),
)
const shown = computed(() => (text.value && !remote.value ? props.options.filter((o) => fold(o.label).includes(fold(text.value ?? '').trim())) : props.options))
const showCustom = computed(() => !!props.allowCustomFromSearch && query.value !== '' && !props.options.some((o) => fold(o.label) === fold(query.value)))
const rows = computed<Row[]>(() => [
  ...(props.clearLabel ? [{ key: 'clear', kind: 'clear' as const }] : []),
  ...shown.value.map((o) => ({ key: `o:${String(o.value)}`, kind: 'option' as const, option: o, disabled: o.disabled })),
  ...(showCustom.value ? [{ key: 'custom', kind: 'custom' as const }] : []),
])
const enabled = computed(() => rows.value.filter((r) => !r.disabled))
const hasVisual = (o?: ComboboxItem | null) => !!o && !!(o.icon || o.image || o.emoji)
const header = computed(() => props.size === 'header')
const iconOnlyOn = computed(() => header.value && props.iconOnly)
const usePortal = computed(() => props.portal ?? header.value)
const withIcons = computed(() => iconOnlyOn.value || !!props.icon || props.options.some(hasVisual) || hasVisual(props.selected) || hasVisual(chosen.value))
const fieldItem = computed(() => (hasVisual(chosen.value) ? chosen.value : undefined))
const rowId = (r: Row) => (r.kind === 'option' ? `${listId}-${props.options.findIndex((o) => same(o.value, r.option!.value))}` : `${listId}-${r.kind}`)
const activeId = computed(() => {
  const r = rows.value.find((x) => x.key === active.value)
  return open.value && r ? rowId(r) : undefined
})
const footer = computed(() => props.manageHref != null || !!props.onManage)

// Server search, debounced.
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
function search(q: string) {
  clearTimeout(timer)
  timer = setTimeout(() => props.onSearch?.(q), props.searchDelay)
}

// Portal: fixed under the field, follows scrolling and resizing while open.
const wrap = ref<HTMLElement | null>(null)
const place = ref<Record<string, string>>({})
const mounted = ref(false)
onMounted(() => { mounted.value = true })
function measure() {
  const r = wrap.value?.getBoundingClientRect()
  if (!r) return
  // A header (or icon-only) trigger is narrow: the list gets at least 12rem and stays inside the viewport.
  const width = header.value ? Math.max(r.width, 192) : r.width
  const left = header.value ? Math.max(8, Math.min(r.left, window.innerWidth - width - 8)) : r.left
  place.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${left}px`, width: `${width}px` }
}
function listen(on: boolean) {
  const fn = on ? window.addEventListener : window.removeEventListener
  fn.call(window, 'scroll', measure, true)
  fn.call(window, 'resize', measure)
}
watch(open, (now) => {
  if (!usePortal.value || typeof window === 'undefined') return
  if (now) measure()
  listen(now)
})
onBeforeUnmount(() => { if (usePortal.value && typeof window !== 'undefined') listen(false) })

function close() {
  open.value = false
  text.value = null
  active.value = null
}
function choose(r?: Row) {
  if (!r || r.disabled) return
  if (r.kind === 'clear') {
    picked.value = null
    model.value = (props.valueType === 'number' ? null : '')
  } else if (r.kind === 'custom') {
    const q = query.value
    // Numeric ids: the custom row only reports the text (create the record, then set its id).
    if (props.valueType !== 'number') {
      picked.value = { value: q, label: q }
      model.value = q
    }
    emit('custom', q)
  } else {
    const o = r.option!
    picked.value = o
    model.value = (props.valueType === 'number' ? Number(o.value) : String(o.value))
  }
  close()
}
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  text.value = v
  open.value = true
  if (remote.value) {
    search(v)
    active.value = null
    return
  }
  const first = enabled.value.find((r) => r.kind === 'option')
  active.value = first?.key ?? null
}
function onKey(e: KeyboardEvent) {
  const items = enabled.value
  const at = items.findIndex((r) => r.key === active.value)
  const move = (i: number) => {
    e.preventDefault()
    open.value = true
    active.value = items[(i + items.length) % items.length]?.key ?? null
  }
  if (e.key === 'ArrowDown') move(open.value ? at + 1 : Math.max(at, 0))
  else if (e.key === 'ArrowUp') move(at <= 0 ? items.length - 1 : at - 1)
  else if (e.key === 'Home' && open.value) move(0)
  else if (e.key === 'End' && open.value) move(items.length - 1)
  else if (e.key === 'Enter' && open.value && at >= 0) { e.preventDefault(); choose(items[at]) }
  else if (e.key === 'Escape' && open.value) { e.preventDefault(); close() }
}
function onManageClick(e: MouseEvent) {
  if (props.manageHref == null) e.preventDefault()
  props.onManage?.()
  close()
}
const customText = computed(() => props.customLabel.replace('{query}', query.value))
function rowAttrs(r: Row): Record<string, unknown> {
  const base = { id: rowId(r), role: 'option', tabindex: -1, 'data-active': r.key === active.value ? '' : undefined }
  if (r.kind === 'clear') return { ...base, class: 'oc-combobox-option oc-combobox-clear', 'aria-selected': 'false' }
  if (r.kind === 'custom') return { ...base, class: 'oc-combobox-option oc-combobox-custom', 'aria-selected': 'false' }
  const o = r.option!
  return { ...base, class: 'oc-combobox-option', 'data-value': String(o.value), 'aria-selected': String(same(o.value, model.value)), 'aria-disabled': o.disabled ? 'true' : undefined }
}
const listClass = computed(() => ['oc-combobox-list', footer.value && 'oc-combobox-list--panel', usePortal.value && 'oc-combobox-list--portal'])
const portalAttrs = computed(() => (usePortal.value ? { style: place.value, 'data-open': open.value ? '' : 'false', 'data-module': props.module } : {}))
</script>

<template>
  <div
    ref="wrap"
    :class="['oc-combobox', variant === 'ledger' && 'oc-combobox--ledger', triggerVariant === 'ghost' && 'oc-combobox--ghost', header && 'oc-combobox--header', iconOnlyOn && 'oc-combobox--icon-only']"
    :data-open="open ? '' : 'false'"
    :data-module="module"
  >
    <span v-if="withIcons" class="oc-combobox-icon" aria-hidden="true">
      <span v-if="iconOnlyOn && triggerLabel" class="oc-combobox-code">{{ triggerLabel }}</span>
      <template v-else-if="fieldItem">
        <OcWebicon v-if="fieldItem.icon" :name="fieldItem.icon" bare fallback="iconify" />
        <img v-else-if="fieldItem.image" class="oc-combobox-option-image" :src="fieldItem.image" alt="" />
        <span v-else class="oc-combobox-option-emoji" aria-hidden="true">{{ fieldItem.emoji }}</span>
      </template>
      <OcWebicon v-else-if="icon" :name="icon" bare fallback="iconify" />
      <svg v-else-if="iconOnlyOn" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-webicon="mdi:dots-horizontal"><path d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" /></svg>
    </span>
    <input
      :class="['oc-input oc-combobox-input', variant === 'ledger' && 'oc-input--ledger']"
      type="text"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open"
      :aria-controls="listId"
      aria-autocomplete="list"
      :aria-activedescendant="activeId"
      :aria-label="triggerAriaLabel ?? label"
      :aria-busy="loading || undefined"
      :placeholder="placeholder"
      :value="text ?? chosen?.label ?? ''"
      @input="onInput"
      @keydown="onKey"
      @focus="open = true"
      @click="open = true"
      @blur="close"
    />
    <input v-if="name" type="hidden" :name="name" :value="model == null ? '' : String(model)" />
    <Teleport to="body" :disabled="!usePortal || !mounted">
      <div v-if="footer" :class="listClass" v-bind="portalAttrs" @mousedown.prevent>
        <ul :id="listId" class="oc-combobox-options" role="listbox" :aria-label="label" :aria-busy="loading || undefined">
          <li v-for="r in rows" :key="r.key" v-bind="rowAttrs(r)" @click="choose(r)">
            <template v-if="r.kind === 'clear'">{{ clearLabel }}</template>
            <template v-else-if="r.kind === 'custom'">{{ customText }}</template>
            <template v-else>
              <span v-if="r.option!.icon" class="oc-combobox-option-icon" aria-hidden="true"><OcWebicon :name="r.option!.icon" bare fallback="iconify" /></span>
              <img v-else-if="r.option!.image" class="oc-combobox-option-image" :src="r.option!.image" alt="" />
              <span v-else-if="r.option!.emoji" class="oc-combobox-option-emoji" aria-hidden="true">{{ r.option!.emoji }}</span>
              <span v-if="r.option!.description" class="oc-combobox-option-text"><span class="oc-combobox-option-label"><slot name="option" :option="r.option!">{{ r.option!.label }}</slot></span><span class="oc-combobox-option-description">{{ r.option!.description }}</span></span>
              <slot v-else name="option" :option="r.option!">{{ r.option!.label }}</slot>
            </template>
          </li>
          <li v-if="loading" class="oc-combobox-loading" role="presentation">{{ loadingText }}</li>
          <li v-else-if="!shown.length && !showCustom" class="oc-combobox-empty" role="presentation">{{ emptyText }}</li>
        </ul>
        <div class="oc-combobox-footer">
          <a :href="manageHref ?? '#'" tabindex="-1" @click="onManageClick">{{ manageLabel }}</a>
        </div>
      </div>
      <ul v-else :id="listId" :class="listClass" role="listbox" :aria-label="label" :aria-busy="loading || undefined" v-bind="portalAttrs" @mousedown.prevent>
        <li v-for="r in rows" :key="r.key" v-bind="rowAttrs(r)" @click="choose(r)">
          <template v-if="r.kind === 'clear'">{{ clearLabel }}</template>
          <template v-else-if="r.kind === 'custom'">{{ customText }}</template>
          <template v-else>
            <span v-if="r.option!.icon" class="oc-combobox-option-icon" aria-hidden="true"><OcWebicon :name="r.option!.icon" bare fallback="iconify" /></span>
            <img v-else-if="r.option!.image" class="oc-combobox-option-image" :src="r.option!.image" alt="" />
            <span v-else-if="r.option!.emoji" class="oc-combobox-option-emoji" aria-hidden="true">{{ r.option!.emoji }}</span>
            <span v-if="r.option!.description" class="oc-combobox-option-text"><span class="oc-combobox-option-label"><slot name="option" :option="r.option!">{{ r.option!.label }}</slot></span><span class="oc-combobox-option-description">{{ r.option!.description }}</span></span>
            <slot v-else name="option" :option="r.option!">{{ r.option!.label }}</slot>
          </template>
        </li>
        <li v-if="loading" class="oc-combobox-loading" role="presentation">{{ loadingText }}</li>
        <li v-else-if="!shown.length && !showCustom" class="oc-combobox-empty" role="presentation">{{ emptyText }}</li>
      </ul>
    </Teleport>
  </div>
</template>
