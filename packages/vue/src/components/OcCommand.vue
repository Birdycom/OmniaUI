<script setup lang="ts">
/**
 * Command palette / searchable list. Filtering, aria-selected and keyboard navigation
 * (ArrowUp/ArrowDown/Enter) are handled here (the CSS only styles the markup).
 * v-model:query is the search text. Emits `select` with the chosen item.
 * Classes: .oc-command, -input, -list, -group-label, -item, -shortcut, -separator, -empty
 */
import { computed, ref, watch } from 'vue'

export interface CommandItem {
  label: string
  value?: string
  group?: string
  shortcut?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    items: CommandItem[]
    placeholder?: string
    label?: string
    emptyText?: string
  }>(),
  { placeholder: 'Type a command or search...', label: 'Search commands', emptyText: 'No results found.' },
)
const emit = defineEmits<{ select: [item: CommandItem] }>()
const query = defineModel<string>('query', { default: '' })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.items.filter((i) => i.label.toLowerCase().includes(q)) : props.items
})

const sections = computed(() => {
  const order: string[] = []
  const map = new Map<string, CommandItem[]>()
  for (const item of filtered.value) {
    const key = item.group ?? ''
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(item)
  }
  return order.map((key) => ({ label: key, items: map.get(key)! }))
})

const flat = computed(() => sections.value.flatMap((s) => s.items))
const active = ref(0)

function firstEnabled(from = 0, step = 1) {
  const list = flat.value
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i
  return -1
}

watch(flat, () => {
  active.value = Math.max(firstEnabled(), 0)
})

function move(step: 1 | -1) {
  const next = firstEnabled(active.value + step, step)
  if (next !== -1) active.value = next
}

function choose(item: CommandItem) {
  if (!item.disabled) emit('select', item)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  } else if (e.key === 'Enter') {
    const item = flat.value[active.value]
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
      <template v-for="(section, s) in sections" :key="section.label + s">
        <li v-if="s > 0" class="oc-command-separator" role="separator"></li>
        <li v-if="section.label" class="oc-command-group-label" role="presentation">{{ section.label }}</li>
        <li
          v-for="item in section.items"
          :key="item.value ?? item.label"
          class="oc-command-item"
          role="option"
          :aria-selected="flat[active] === item ? 'true' : undefined"
          :aria-disabled="item.disabled ? 'true' : undefined"
          @click="choose(item)"
          @mousemove="!item.disabled && (active = flat.indexOf(item))"
        >
          {{ item.label }}
          <span v-if="item.shortcut" class="oc-command-shortcut">{{ item.shortcut }}</span>
        </li>
      </template>
    </ul>
    <div class="oc-command-empty" :hidden="flat.length > 0">{{ emptyText }}</div>
  </div>
</template>
