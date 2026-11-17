<!-- File: packages/vue/src/blocks/OcBlockContentBlocks.vue | Map: props -> move (buttons, keyboard grip, drag) -> bar -> ol of cards (block slot per item) -> add slot -> live status -->
<script setup lang="ts">
/**
 * Editor column of content blocks: cards you open and close (details), move up or down, drag and remove.
 * Emits `move` (id, toIndex) and `remove` (id): keep `items` in the new order. Slots: nav, actions, block (scoped: { item }), add.
 * Classes: .oc-block-content-blocks, -bar, -nav, -heading, -title, -meta, -actions, -list, -item, -card, -head, -type, -peek, -tools, -body, -foot, -status
 */
import { ref } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'

export interface ContentBlockItem {
  id: string
  type: string
  /** Webicon name (mdi:text …). */
  icon?: string
  color?: string
  peek?: string
  open?: boolean
  locked?: boolean
}
const props = withDefaults(defineProps<{ title: string; meta?: string; items: ContentBlockItem[]; listLabel?: string }>(), { listLabel: 'Blocks' })
const emit = defineEmits<{ move: [id: string, toIndex: number]; remove: [id: string] }>()
const titleId = useUid('oc-cblocks')
const picked = ref<string | null>(null)
const grabbed = ref<string | null>(null)
const drag = ref<{ id: string; over?: string; after?: boolean } | null>(null)
const status = ref('')
// A move re-inserts the row; that blur must not drop the grip picked up with the keyboard.
let moving = false
const list = ref<HTMLOListElement | null>(null)

function move(id: string, to: number) {
  const from = props.items.findIndex((x) => x.id === id)
  if (from < 0 || to < 0 || to >= props.items.length || to === from) return
  emit('move', id, to)
  status.value = `${props.items[from].type}: position ${to + 1} of ${props.items.length}`
}
function onGripKey(e: KeyboardEvent, item: ContentBlockItem, i: number) {
  if (picked.value !== item.id) return
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    moving = true
    move(item.id, i + (e.key === 'ArrowUp' ? -1 : 1))
    requestAnimationFrame(() => { moving = false; ([...(list.value?.children ?? [])] as HTMLElement[]).find((x) => x.dataset.id === item.id)?.querySelector<HTMLElement>(".oc-sortable-row-grip")?.focus() })
  } else if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    picked.value = null
  }
}
function onBlur(id: string) {
  if (!moving && picked.value === id) picked.value = null
}
function onDragOver(e: DragEvent, item: ContentBlockItem) {
  if (!drag.value) return
  e.preventDefault()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  drag.value = { ...drag.value, over: item.id, after: e.clientY > r.top + r.height / 2 }
}
function onDrop(e: DragEvent) {
  const d = drag.value
  drag.value = null
  if (!d?.over || d.over === d.id) return
  e.preventDefault()
  const from = props.items.findIndex((x) => x.id === d.id)
  let to = props.items.findIndex((x) => x.id === d.over) + (d.after ? 1 : 0)
  if (to > from) to--
  move(d.id, to)
}
function dropClass(id: string) {
  const d = drag.value
  if (!d) return null
  if (d.id === id) return 'is-dragging'
  return d.over === id ? (d.after ? 'is-drop-after' : 'is-drop-before') : null
}
</script>

<template>
  <section class="oc-block-content-blocks" :aria-labelledby="titleId">
    <div class="oc-block-content-blocks-bar">
      <div v-if="$slots.nav" class="oc-block-content-blocks-nav"><slot name="nav" /></div>
      <div class="oc-block-content-blocks-heading">
        <h2 :id="titleId" class="oc-block-content-blocks-title">{{ title }}</h2>
        <p v-if="meta" class="oc-block-content-blocks-meta">{{ meta }}</p>
      </div>
      <div v-if="$slots.actions" class="oc-block-content-blocks-actions"><slot name="actions" /></div>
    </div>
    <ol ref="list" class="oc-block-content-blocks-list" :aria-label="listLabel" @drop="onDrop">
      <li
        v-for="(item, i) in items" :key="item.id" :data-id="item.id"
        :class="['oc-block-content-blocks-item', dropClass(item.id)]"
        :draggable="grabbed === item.id"
        @dragstart="(e: DragEvent) => { e.dataTransfer?.setData('text/plain', item.id); drag = { id: item.id } }"
        @dragover="(e: DragEvent) => onDragOver(e, item)"
        @dragend="grabbed = null; drag = null"
        @pointerup="() => { if (!drag) grabbed = null }"
      >
        <button
          class="oc-sortable-row-grip" type="button" :aria-label="`Move ${item.type}`" :aria-pressed="picked === item.id"
          @pointerdown="grabbed = item.id" @click="picked = picked === item.id ? null : item.id"
          @keydown="(e: KeyboardEvent) => onGripKey(e, item, i)" @blur="onBlur(item.id)"
        ></button>
        <details class="oc-block-content-blocks-card" :open="item.open">
          <summary class="oc-block-content-blocks-head">
            <span class="oc-block-content-blocks-type" :style="item.color ? { '--oc-block-type-color': item.color } : undefined"><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" />{{ item.type }}</span>
            <span v-if="item.peek" class="oc-block-content-blocks-peek">{{ item.peek }}</span>
          </summary>
          <div class="oc-block-content-blocks-body"><slot name="block" :item="item" /></div>
        </details>
        <div class="oc-block-content-blocks-tools">
          <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" :aria-label="`Move ${item.type} up`" :disabled="i === 0" @click="move(item.id, i - 1)"><OcWebicon name="mdi:arrow-up" bare fallback="iconify" /></button>
          <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" :aria-label="`Move ${item.type} down`" :disabled="i === items.length - 1" @click="move(item.id, i + 1)"><OcWebicon name="mdi:arrow-down" bare fallback="iconify" /></button>
          <button v-if="!item.locked" class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" :aria-label="`Remove ${item.type}`" @click="emit('remove', item.id)"><OcWebicon name="mdi:trash-can-outline" bare fallback="iconify" /></button>
        </div>
      </li>
    </ol>
    <div v-if="$slots.add" class="oc-block-content-blocks-foot"><slot name="add" /></div>
    <p class="oc-block-content-blocks-status oc-visually-hidden" aria-live="polite">{{ status }}</p>
  </section>
</template>
