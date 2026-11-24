<script setup lang="ts">
/**
 * Command palette / searchable list. Filtering, aria-selected and keyboard navigation
 * (ArrowUp/ArrowDown/Enter) are handled here (the CSS only styles the markup).
 * v-model:query is the search text. Emits `select` with the chosen item.
 * Classes: .oc-command, -input, -list, -group-label, -item, -shortcut, -separator, -empty
 * 0.18.0: the rows can also come from the default slot: <OcCommandGroup label="…"><OcCommandItem value="…">…</OcCommandItem>
 * </OcCommandGroup> (after `items`); an OcCommandItem shows its own slot content and may have its own @select.
 */
import { Fragment, isVNode, ref, useSlots, watch } from 'vue'
import type { VNode } from 'vue'
import OcCommandItem from './OcCommandItem.vue'
import OcCommandGroup from './OcCommandGroup.vue'

export interface CommandItem {
  label: string
  value?: string
  group?: string
  shortcut?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    items?: CommandItem[]
    placeholder?: string
    label?: string
    emptyText?: string
  }>(),
  { items: () => [], placeholder: 'Type a command or search...', label: 'Search commands', emptyText: 'No results found.' },
)
const emit = defineEmits<{ select: [item: CommandItem] }>()
const query = defineModel<string>('query', { default: '' })

type Row = CommandItem & { content?: () => unknown; onPick?: (item: CommandItem) => void }
const slots = useSlots()

/** Text of slot vnodes (the searched label of a slotted row). */
function textOf(nodes: unknown): string {
  if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes)
  if (Array.isArray(nodes)) return nodes.map(textOf).join('')
  if (isVNode(nodes)) {
    const c = nodes.children as unknown
    if (c && typeof c === 'object' && !Array.isArray(c) && typeof (c as { default?: unknown }).default === 'function') {
      return textOf((c as { default: () => unknown }).default())
    }
    return textOf(c)
  }
  return ''
}

const flag = (v: unknown) => v !== undefined && v !== false && v !== null
const slotFn = (node: VNode) => (node.children as { default?: () => VNode[] } | null)?.default

/** Rows from OcCommandGroup / OcCommandItem in the default slot (also inside v-for fragments). */
function slotRows(): Row[] {
  const rows: Row[] = []
  const walk = (nodes: unknown, group?: string) => {
    if (!Array.isArray(nodes)) return
    for (const node of nodes) {
      if (!isVNode(node)) continue
      if (node.type === Fragment) walk(node.children, group)
      else if (node.type === OcCommandGroup) walk(slotFn(node)?.(), (node.props?.label as string | undefined) ?? '')
      else if (node.type === OcCommandItem) {
        const p = (node.props ?? {}) as Record<string, unknown>
        const content = slotFn(node)
        const label = (p.label as string | undefined) ?? textOf(content?.()).trim()
        const row: Row = { label, content, onPick: p.onSelect as Row['onPick'] }
        if (p.value !== undefined) row.value = p.value as string
        if (group ?? p.group) row.group = (group ?? p.group) as string
        if (p.shortcut !== undefined) row.shortcut = p.shortcut as string
        if (flag(p.disabled)) row.disabled = true
        rows.push(row)
      }
    }
  }
  walk(slots.default?.())
  return rows
}

/** The flat list of the last render (keyboard navigation reads it). */
let flat: Row[] = []

/** Sections to render: `items` then the slotted rows, filtered by the query, grouped by `group`. Called in the render. */
function build() {
  const q = query.value.trim().toLowerCase()
  const all: Row[] = [...props.items, ...slotRows()]
  const filtered = q ? all.filter((i) => i.label.toLowerCase().includes(q)) : all
  const order: string[] = []
  const map = new Map<string, Row[]>()
  for (const item of filtered) {
    const key = item.group ?? ''
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(item)
  }
  const sections = order.map((key) => ({ label: key, items: map.get(key)! }))
  flat = sections.flatMap((s) => s.items)
  return sections
}

/** Renders the slot content of a slotted row. */
const RowContent = (p: { render: () => unknown }) => p.render() as VNode[]

const active = ref(0)

function firstEnabled(from = 0, step = 1) {
  const list = flat
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i
  return -1
}

watch([query, () => props.items], () => {
  active.value = 0
})

/** The active index: the chosen one, or the first enabled row when that one is gone or disabled. */
function current() {
  const i = active.value
  return flat[i] && !flat[i].disabled ? i : Math.max(firstEnabled(), 0)
}

function move(step: 1 | -1) {
  const next = firstEnabled(current() + step, step)
  if (next !== -1) active.value = next
}

function choose(item: Row) {
  if (item.disabled) return
  if (!('onPick' in item)) return emit('select', item)
  const { content: _content, onPick, ...data } = item
  onPick?.(data)
  emit('select', data)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  } else if (e.key === 'Enter') {
    const item = flat[current()]
    if (item) {
      e.preventDefault()
      choose(item)
    }
  }
}
</script>

<template>
  <div class="oc-command" role="combobox" aria-expanded="true" aria-haspopup="listbox">
    <input
      v-model="query"
      class="oc-command-input"
      type="search"
      :placeholder="placeholder"
      :aria-label="label"
      @keydown="onKeydown"
    />
    <ul class="oc-command-list" role="listbox">
      <template v-for="(section, s) in build()" :key="section.label + s">
        <li v-if="s > 0" class="oc-command-separator" role="separator"></li>
        <li v-if="section.label" class="oc-command-group-label" role="presentation">{{ section.label }}</li>
        <li
          v-for="item in section.items"
          :key="item.value ?? item.label"
          class="oc-command-item"
          role="option"
          :aria-selected="flat[current()] === item ? 'true' : undefined"
          :aria-disabled="item.disabled ? 'true' : undefined"
          @click="choose(item)"
          @mousemove="!item.disabled && (active = flat.indexOf(item))"
        >
          <RowContent v-if="item.content" :render="item.content" /><template v-else>{{ item.label }}</template>
          <span v-if="item.shortcut" class="oc-command-shortcut">{{ item.shortcut }}</span>
        </li>
      </template>
    </ul>
    <div class="oc-command-empty" :hidden="flat.length > 0">{{ emptyText }}</div>
  </div>
</template>
