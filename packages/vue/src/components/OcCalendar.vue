<!-- File: packages/vue/src/components/OcCalendar.vue | Map: props + v-model (day or range) + v-model:month -> month grid -> header -> table (weekdays, days with state) -> pick -> arrow keys -->
<script setup lang="ts">
/**
 * The CSS calendar (.oc-calendar) as a component (0.17.0). mode 'single' (v-model: '2026-10-20') or 'range'
 * (v-model:range: { start, end }); v-model:month ('2026-10'); min, max, isDisabled(date); today; locale; weekStart (1 = Monday).
 * Arrow keys move a day or a week (into the next month too), Home / End the week, PageUp / PageDown a month.
 */
import { computed, nextTick, ref } from 'vue'
import { dayState, monthGrid, shiftDate, shiftMonth } from '../../../ui/src/calendar.js'

interface CalendarRange { start?: string; end?: string }
const props = withDefaults(defineProps<{
  mode?: 'single' | 'range'
  min?: string
  max?: string
  isDisabled?: (date: string) => boolean
  today?: string
  locale?: string
  weekStart?: 0 | 1
  labels?: { previous?: string; next?: string }
}>(), { mode: 'single', weekStart: 1 })
const day = defineModel<string | undefined>()
const span = defineModel<CalendarRange>('range', { default: () => ({}) })

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const now = computed(() => props.today ?? iso(new Date()))
const month = defineModel<string | undefined>('month')
const shown = computed({
  get: () => month.value ?? ((props.mode === 'range' ? span.value.start : day.value)?.slice(0, 7) ?? now.value.slice(0, 7)),
  set: (m: string) => { month.value = m },
})
const focusDate = ref<string | null>(null)
const grid = ref<HTMLTableElement | null>(null)

const weeks = computed(() => monthGrid(shown.value, props.weekStart))
const title = computed(() => new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(new Date(`${shown.value}-01T12:00:00`)))
const weekday = (d: string, long = false) => new Intl.DateTimeFormat(props.locale, { weekday: long ? 'long' : 'short' }).format(new Date(`${d}T12:00:00`))
const off = (d: string) => (props.min != null && d < props.min) || (props.max != null && d > props.max) || !!props.isDisabled?.(d)
const state = (d: string) => (props.mode === 'single' ? dayState(d, day.value) : dayState(d, span.value.start, span.value.end))
const selected = computed(() => (props.mode === 'single' ? day.value : span.value.start))
const tabDay = computed(() => {
  const f = focusDate.value
  if (f && f.slice(0, 7) === shown.value) return f
  if (selected.value && selected.value.slice(0, 7) === shown.value) return selected.value
  return now.value.slice(0, 7) === shown.value ? now.value : `${shown.value}-01`
})

function pick(d: string) {
  if (off(d)) return
  if (props.mode === 'single') day.value = d
  else if (!span.value.start || span.value.end) span.value = { start: d }
  else if (d < span.value.start) span.value = { start: d, end: span.value.start }
  else span.value = { start: span.value.start, end: d }
  if (d.slice(0, 7) !== shown.value) shown.value = d.slice(0, 7)
}
async function onKey(e: KeyboardEvent) {
  const from = (e.target as HTMLElement).dataset.date
  if (!from) return
  const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key]
  let to: string | undefined
  if (step) to = shiftDate(from, step)
  else if (e.key === 'Home' || e.key === 'End') {
    const dow = (new Date(`${from}T12:00:00`).getDay() - props.weekStart + 7) % 7
    to = shiftDate(from, e.key === 'Home' ? -dow : 6 - dow)
  } else if (e.key === 'PageUp' || e.key === 'PageDown') to = shiftMonth(from.slice(0, 7), e.key === 'PageUp' ? -1 : 1) + from.slice(7)
  if (!to) return
  e.preventDefault()
  if (to.slice(0, 7) !== shown.value) shown.value = to.slice(0, 7)
  focusDate.value = to
  await nextTick()
  grid.value?.querySelector<HTMLButtonElement>(`button[data-date="${to}"]`)?.focus()
}
</script>

<template>
  <div class="oc-calendar" role="group" :aria-label="title">
    <div class="oc-calendar-header">
      <button class="oc-calendar-nav" type="button" :aria-label="labels?.previous ?? 'Previous month'" @click="shown = shiftMonth(shown, -1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <h3 class="oc-calendar-title" aria-live="polite">{{ title }}</h3>
      <button class="oc-calendar-nav" type="button" :aria-label="labels?.next ?? 'Next month'" @click="shown = shiftMonth(shown, 1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
    <table ref="grid" class="oc-calendar-grid" role="grid" :aria-label="title" @keydown="onKey">
      <thead>
        <tr><th v-for="d in weeks[0]" :key="d.iso" class="oc-calendar-weekday" scope="col" :abbr="weekday(d.iso, true)">{{ weekday(d.iso).slice(0, 2) }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="w in weeks" :key="w[0].iso">
          <td v-for="d in w" :key="d.iso">
            <button
              :class="['oc-calendar-day', d.outside && 'oc-calendar-day--outside', d.iso === now && 'oc-calendar-day--today', ...state(d.iso).cls]"
              type="button"
              :data-date="d.iso"
              :tabindex="d.iso === tabDay ? 0 : -1"
              :aria-selected="state(d.iso).selected ? 'true' : undefined"
              :aria-current="d.iso === now ? 'date' : undefined"
              :disabled="off(d.iso)"
              @click="pick(d.iso)"
            >{{ d.day }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
