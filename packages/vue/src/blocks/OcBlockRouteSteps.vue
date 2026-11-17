<!-- File: packages/vue/src/blocks/OcBlockRouteSteps.vue | Map: props -> filter + move state -> head -> tools -> ol of steps (grip, main, status, menu) -> empty -> footer slot -> live status -->
<script setup lang="ts">
/**
 * Ordered steps of a route or course in an editor; the numbers are a CSS counter, so they follow the order.
 * Emits `select` (id), `move` (id, toIndex), `duplicate` (id), `remove` (id). Slots: thumb (scoped: { step }), footer.
 * Classes: .oc-block-route-steps, -head, -title, -count, -tools, -search, -kinds, -list, -item, -main, -thumb (--num), -text, -name, -meta, -status, -menu, -empty, -foot
 */
import { computed, ref } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'

export interface RouteStep {
  id: string
  name: string
  meta?: string[]
  kind?: string
  numbered?: boolean
  icon?: string
  color?: string
  status?: string
  statusTone?: 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' | 'info'
  /** Tooltip on the status (the messages behind it); the status becomes focusable. */
  statusTooltip?: string
  /** Small badges under the name. */
  badges?: { label: string; tone?: 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' | 'info' }[]
}
export interface RouteStepsKind {
  value: string
  label: string
}
const props = withDefaults(
  defineProps<{
    title: string; count?: string; steps: RouteStep[]; selected?: string; search?: boolean; kinds?: RouteStepsKind[]; actions?: boolean; searchLabel?: string; emptyText?: string
    /** The order cannot change now: no grips, no dragging, no move items; a lock line in the head. */
    locked?: boolean; lockedLabel?: string
  }>(),
  { search: true, kinds: () => [], actions: true, searchLabel: 'Search steps', emptyText: 'No step matches your search.', lockedLabel: 'Order locked' },
)
const emit = defineEmits<{ select: [id: string]; move: [id: string, toIndex: number]; duplicate: [id: string]; remove: [id: string] }>()
const titleId = useUid('oc-rsteps')
const query = ref('')
const kind = ref('all')
const picked = ref<string | null>(null)
const grabbed = ref<string | null>(null)
const drag = ref<{ id: string; over?: string; after?: boolean } | null>(null)
const status = ref('')
// A move re-inserts the row; that blur must not drop the grip picked up with the keyboard.
let moving = false
const list = ref<HTMLOListElement | null>(null)
const visible = (s: RouteStep) => {
  const q = query.value.trim().toLowerCase()
  return (kind.value === 'all' || kind.value.split(' ').includes(s.kind ?? '')) && (!q || `${s.name} ${(s.meta ?? []).join(' ')}`.toLowerCase().includes(q))
}
const shown = computed(() => props.steps.filter(visible).length)

function move(id: string, to: number) {
  const from = props.steps.findIndex((x) => x.id === id)
  if (from < 0 || to < 0 || to >= props.steps.length || to === from) return
  emit('move', id, to)
  status.value = `${props.steps[from].name}: position ${to + 1} of ${props.steps.length}`
}
function onGripKey(e: KeyboardEvent, s: RouteStep, i: number) {
  if (picked.value !== s.id) return
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    moving = true
    move(s.id, i + (e.key === 'ArrowUp' ? -1 : 1))
    requestAnimationFrame(() => { moving = false; ([...(list.value?.children ?? [])] as HTMLElement[]).find((x) => x.dataset.id === s.id)?.querySelector<HTMLElement>(".oc-sortable-row-grip")?.focus() })
  } else if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    picked.value = null
  }
}
function onBlur(id: string) {
  if (!moving && picked.value === id) picked.value = null
}
function onDragOver(e: DragEvent, s: RouteStep) {
  if (!drag.value) return
  e.preventDefault()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  drag.value = { ...drag.value, over: s.id, after: e.clientY > r.top + r.height / 2 }
}
function onDrop(e: DragEvent) {
  const d = drag.value
  drag.value = null
  if (!d?.over || d.over === d.id) return
  e.preventDefault()
  const from = props.steps.findIndex((x) => x.id === d.id)
  let to = props.steps.findIndex((x) => x.id === d.over) + (d.after ? 1 : 0)
  if (to > from) to--
  move(d.id, to)
}
function rowClass(id: string) {
  const d = drag.value
  if (!d) return null
  if (d.id === id) return 'is-dragging'
  return d.over === id ? (d.after ? 'is-drop-after' : 'is-drop-before') : null
}
function hideMenu(e: MouseEvent) {
  try { (e.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover?.() } catch { /* already closed */ }
}
</script>

<template>
  <section :class="['oc-block-route-steps', locked && 'oc-block-route-steps--locked']" :aria-labelledby="titleId">
    <div class="oc-block-route-steps-head">
      <h2 :id="titleId" class="oc-block-route-steps-title">{{ title }}</h2>
      <span v-if="count" class="oc-block-route-steps-count">{{ count }}</span>
      <span v-if="locked" class="oc-block-route-steps-lock">{{ lockedLabel }}</span>
    </div>
    <div v-if="search || kinds.length" class="oc-block-route-steps-tools">
      <div v-if="search" class="oc-input-group oc-input-group--affix">
        <span class="oc-input-addon" aria-hidden="true"><OcWebicon name="mdi:magnify" bare fallback="iconify" /></span>
        <input v-model="query" class="oc-input oc-block-route-steps-search" type="search" :placeholder="searchLabel" :aria-label="searchLabel">
      </div>
      <fieldset v-if="kinds.length" class="oc-chip-filter oc-chip-filter--sm oc-block-route-steps-kinds" aria-label="Kind">
        <label v-for="k in [{ value: 'all', label: 'All' }, ...kinds]" :key="k.value" class="oc-chip-filter-item"><input v-model="kind" type="radio" :name="`${titleId}-kind`" :value="k.value"> {{ k.label }}</label>
      </fieldset>
    </div>
    <ol ref="list" class="oc-block-route-steps-list" aria-label="Steps in route order" @drop="onDrop">
      <li
        v-for="(s, i) in steps" :key="s.id" :data-id="s.id" :data-kind="s.kind"
        :class="['oc-block-route-steps-item', !visible(s) && 'is-filtered', rowClass(s.id)]" :draggable="!locked && grabbed === s.id"
        @dragstart="(e: DragEvent) => { e.dataTransfer?.setData('text/plain', s.id); drag = { id: s.id } }"
        @dragover="(e: DragEvent) => onDragOver(e, s)" @dragend="grabbed = null; drag = null" @pointerup="() => { if (!drag) grabbed = null }"
      >
        <button
          class="oc-sortable-row-grip" type="button" :aria-label="`Move ${s.name}`" :aria-pressed="picked === s.id" :disabled="locked"
          @pointerdown="grabbed = s.id" @click="picked = picked === s.id ? null : s.id"
          @keydown="(e: KeyboardEvent) => onGripKey(e, s, i)" @blur="onBlur(s.id)"
        ></button>
        <button class="oc-block-route-steps-main" type="button" :aria-current="selected === s.id ? 'true' : undefined" @click="emit('select', s.id)">
          <span v-if="s.numbered !== false" class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num"><slot name="thumb" :step="s" /></span>
          <span v-else class="oc-block-route-steps-thumb" :style="s.color ? { '--oc-step-color': s.color } : undefined"><slot name="thumb" :step="s"><OcWebicon v-if="s.icon" :name="s.icon" bare fallback="iconify" /></slot></span>
          <span class="oc-block-route-steps-text">
            <span class="oc-block-route-steps-name">{{ s.name }}</span>
            <span v-if="s.meta?.length" class="oc-block-route-steps-meta"><span v-for="m in s.meta" :key="m">{{ m }}</span></span>
            <span v-if="s.badges?.length" class="oc-block-route-steps-badges"><span v-for="b in s.badges" :key="b.label" :class="['oc-badge', b.tone && `oc-badge--${b.tone}`]">{{ b.label }}</span></span>
          </span>
        </button>
        <span v-if="s.status && s.statusTooltip" class="oc-block-route-steps-status oc-tooltip oc-tooltip--left" :data-tooltip="s.statusTooltip" tabindex="0"><span :class="['oc-badge', s.statusTone && `oc-badge--${s.statusTone}`]">{{ s.status }}</span></span>
        <span v-else-if="s.status" :class="['oc-badge', s.statusTone && `oc-badge--${s.statusTone}`, 'oc-block-route-steps-status']">{{ s.status }}</span>
        <template v-if="actions">
          <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" :popovertarget="`${titleId}-menu-${i}`" :aria-label="`Actions for ${s.name}`"><OcWebicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
          <div :id="`${titleId}-menu-${i}`" class="oc-dropdown-menu" popover>
            <button v-if="!locked" class="oc-dropdown-item" type="button" :disabled="i === 0" @click="(e) => { hideMenu(e); move(s.id, i - 1) }"><span class="oc-dropdown-icon" aria-hidden="true"><OcWebicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
            <button v-if="!locked" class="oc-dropdown-item" type="button" :disabled="i === steps.length - 1" @click="(e) => { hideMenu(e); move(s.id, i + 1) }"><span class="oc-dropdown-icon" aria-hidden="true"><OcWebicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
            <button class="oc-dropdown-item" type="button" @click="(e) => { hideMenu(e); emit('duplicate', s.id) }"><span class="oc-dropdown-icon" aria-hidden="true"><OcWebicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
            <div class="oc-dropdown-separator"></div>
            <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" @click="(e) => { hideMenu(e); emit('remove', s.id) }"><span class="oc-dropdown-icon" aria-hidden="true"><OcWebicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
          </div>
        </template>
      </li>
    </ol>
    <p v-if="!shown" class="oc-block-route-steps-empty">{{ emptyText }}</p>
    <div v-if="$slots.footer" class="oc-block-route-steps-foot"><slot name="footer" /></div>
    <p class="oc-block-route-steps-status-line oc-visually-hidden" aria-live="polite">{{ status }}</p>
  </section>
</template>
