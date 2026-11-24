// File: packages/vue/tests/v0180-qp.test.ts
// Map: OcBarcode QR -> OcProgress striped + OcSplitBar -> OcSeverityCard compact + calm -> OcSortableList (keyboard, arrows, v-model)
//      -> OcSheet floating / rounded -> OcOtpInput block / lg / tiles -> OcStatList -> OcSaveStatus queued / online / compact
//      -> OcModeBadge staging / offline + OcEnvFrame -> OcToast action + useToast -> OcCopyField block -> OcCombobox data-typing
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcBarcode from '../src/components/OcBarcode.vue'
import OcProgress from '../src/components/OcProgress.vue'
import OcSplitBar from '../src/components/OcSplitBar.vue'
import OcSeverityCard from '../src/components/OcSeverityCard.vue'
import OcSortableList from '../src/components/OcSortableList.vue'
import OcSheet from '../src/components/OcSheet.vue'
import OcOtpInput from '../src/components/OcOtpInput.vue'
import OcStatList from '../src/components/OcStatList.vue'
import OcSaveStatus from '../src/components/OcSaveStatus.vue'
import OcModeBadge from '../src/components/OcModeBadge.vue'
import OcEnvFrame from '../src/components/OcEnvFrame.vue'
import OcToast from '../src/components/OcToast.vue'
import OcToastContainer from '../src/components/OcToastContainer.vue'
import OcCopyField from '../src/components/OcCopyField.vue'
import OcCombobox from '../src/components/OcCombobox.vue'
import { useToast } from '../src/composables/useToast'

describe('OcBarcode format QR (0.18.0)', () => {
  it('draws a square QR SVG with the --qr class', () => {
    const w = mount(OcBarcode, { props: { value: 'CUSTOMER-1', format: 'QR', level: 'H' } })
    expect(w.classes()).toContain('oc-barcode--qr')
    const [, , a, b] = w.find('svg.oc-barcode__qr').attributes('viewBox')!.split(' ')
    expect(a).toBe(b)
    expect(w.find('.oc-barcode__digits').text()).toBe('CUSTOMER-1')
  })
})

describe('OcProgress striped + OcSplitBar (0.18.0)', () => {
  it('track striped and segments', async () => {
    const p = mount(OcProgress, { props: { value: 3, max: 8, track: 'striped' } })
    expect(p.classes()).toContain('oc-progress--striped')
    expect(p.attributes('role')).toBe('progressbar')
    const s = mount(OcSplitBar, { props: { legend: true, segments: [{ value: 12, tone: 'success', label: 'Right' }, { value: 4, tone: 'danger', label: 'Wrong' }, { value: 4, label: 'Open' }] } })
    const bar = s.find('.oc-progress--split')
    expect(bar.attributes('role')).toBe('img')
    expect(bar.attributes('aria-label')).toBe('Right 12, Wrong 4, Open 4')
    const parts = bar.findAll('.oc-progress-segment')
    expect(parts.map((x) => (x.element as HTMLElement).style.inlineSize)).toEqual(['60%', '20%', '20%'])
    expect(parts[1].classes()).toContain('oc-progress-segment--danger')
    expect(s.findAll('.oc-progress-legend li')).toHaveLength(3)
    const max = mount(OcSplitBar, { props: { max: 20, segments: [{ value: 9 }, { value: 3, tone: 'warning' }] } })
    expect(max.findAll('.oc-progress-segment').map((x) => (x.element as HTMLElement).style.inlineSize)).toEqual(['45%', '15%'])
  })
})

describe('OcSeverityCard compact + calm (0.18.0)', () => {
  it('compact is a div row with the slot as text', () => {
    const w = mount(OcSeverityCard, { props: { compact: true, level: 'calm', title: 'All teams on route', tags: ['Team 1'] }, slots: { default: 'Last check 1 minute ago.' } })
    expect(w.element.tagName).toBe('DIV')
    expect(w.classes()).toEqual(expect.arrayContaining(['oc-severity-card--compact', 'oc-severity-card--calm']))
    expect(w.find('summary').exists()).toBe(false)
    expect(w.find('.oc-severity-card-text').text()).toBe('Last check 1 minute ago.')
    expect(w.find('.oc-severity-card-level').text()).toBe('Calm')
  })
})

describe('OcSortableList (0.18.0)', () => {
  const Host = defineComponent({
    setup() {
      const items = ref([{ id: 'a', label: 'Town hall' }, { id: 'b', label: 'Old harbour' }, { id: 'c', label: 'Windmill' }])
      return () => h(OcSortableList, { items: items.value, 'onUpdate:items': (v: unknown[]) => { items.value = v as typeof items.value }, ordered: true, arrows: true })
    },
  })
  const ids = (w: ReturnType<typeof mount>) => w.findAll('li').map((li) => li.attributes('data-id'))
  it('keyboard moves and v-model:items gets the new order', async () => {
    const w = mount(Host, { attachTo: document.body })
    expect(w.find('ol.oc-sortable-list').exists()).toBe(true)
    const grip = w.find('[data-id="a"] .oc-sortable-row-grip')
    expect(grip.attributes('aria-label')).toBe('Move Town hall')
    ;(grip.element as HTMLElement).focus()
    await grip.trigger('keydown', { key: ' ' })
    expect(grip.attributes('aria-pressed')).toBe('true')
    await grip.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(ids(w)).toEqual(['b', 'a', 'c'])
    w.unmount()
  })
  it('arrow buttons', async () => {
    const w = mount(Host, { attachTo: document.body })
    await w.find('[data-id="c"] [data-oc-move="up"]').trigger('click')
    await nextTick()
    expect(ids(w)).toEqual(['a', 'c', 'b'])
    w.unmount()
  })
})

describe('OcSheet floating / rounded (0.18.0)', () => {
  it('adds the classes', () => {
    const w = mount(OcSheet, { props: { floating: true, rounded: true, side: 'bottom', title: 'Share' } })
    expect(w.find('dialog').classes()).toEqual(expect.arrayContaining(['oc-sheet--floating', 'oc-sheet--rounded', 'oc-sheet--bottom']))
  })
})

describe('OcOtpInput block / lg / tiles (0.18.0)', () => {
  it('adds the modifiers', () => {
    const w = mount(OcOtpInput, { props: { block: true, size: 'lg', tiles: true } })
    expect(w.find('input').classes()).toEqual(expect.arrayContaining(['oc-otp--block', 'oc-otp--lg', 'oc-otp--tiles']))
  })
})

describe('OcStatList (0.18.0)', () => {
  it('rows and a total', () => {
    const w = mount(OcStatList, { props: { items: [{ label: 'Questions', sublabel: '12 of 15 right', value: 120 }], total: { label: 'Total', value: 120 } } })
    expect(w.classes()).toEqual(['oc-dl', 'oc-dl--stat'])
    expect(w.find('.oc-dl-sub').text()).toBe('12 of 15 right')
    expect(w.find('.oc-dl-row--total .oc-dl-detail').text()).toBe('120')
  })
})

describe('OcSaveStatus sync states (0.18.0)', () => {
  it('queued with count, online, compact', () => {
    expect(mount(OcSaveStatus, { props: { state: 'queued', count: 3 } }).text()).toBe('3 changes waiting to sync')
    expect(mount(OcSaveStatus, { props: { state: 'online' } }).find('.oc-status-dot--done').exists()).toBe(true)
    const c = mount(OcSaveStatus, { props: { state: 'queued', count: 2, compact: true } })
    expect(c.classes()).toContain('oc-status--compact')
    expect(c.attributes('title')).toBe('2 changes waiting to sync')
    expect(c.find('.oc-status__count').text()).toBe('2')
  })
})

describe('OcModeBadge staging / offline + OcEnvFrame (0.18.0)', () => {
  it('words and frame', () => {
    expect(mount(OcModeBadge, { props: { mode: 'staging' } }).text()).toBe('Staging')
    expect(mount(OcModeBadge, { props: { mode: 'offline' } }).text()).toBe('Offline')
    const f = mount(OcEnvFrame, { props: { mode: 'live', contained: true } })
    expect(f.classes()).toEqual(['oc-env-frame', 'oc-env-frame--contained'])
    expect(f.attributes('data-mode')).toBe('live')
    expect(f.attributes('aria-hidden')).toBe('true')
  })
})

describe('OcToast action (0.18.0)', () => {
  it('the button runs the action and emits dismiss', async () => {
    const onClick = vi.fn()
    const w = mount(OcToast, { props: { title: 'Round published', action: { label: 'Undo', onClick } } })
    await w.find('button.oc-toast-action').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
  it('useToast push with an action; the container closes it after the click', async () => {
    const undo = vi.fn()
    const w = mount(OcToastContainer)
    const { push, clear } = useToast()
    push({ title: 'Round published', action: { label: 'Undo', onClick: undo } })
    await nextTick()
    await w.find('.oc-toast-action').trigger('click')
    expect(undo).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(w.find('.oc-toast').exists()).toBe(false)
    clear()
  })
})

describe('OcCopyField block (0.18.0)', () => {
  it('adds the modifier', () => {
    expect(mount(OcCopyField, { props: { value: 'K7QM2XPA', block: true } }).classes()).toContain('oc-copy-field--block')
  })
})

describe('OcCombobox icon-only data-typing (0.18.0)', () => {
  it('data-typing while a query is typed', async () => {
    const w = mount(OcCombobox, { props: { size: 'header', iconOnly: true, portal: false, triggerAriaLabel: 'Language', options: [{ value: 'nl', label: 'Nederlands' }, { value: 'en', label: 'English' }] } })
    expect(w.attributes('data-typing')).toBeUndefined()
    const input = w.find('input[role="combobox"]')
    ;(input.element as HTMLInputElement).value = 'Ned'
    await input.trigger('input')
    expect(w.attributes('data-typing')).toBe('')
  })
  it('focus and click select the invisible chosen label, so typing replaces it', async () => {
    const w = mount(OcCombobox, { props: { size: 'header', iconOnly: true, portal: false, triggerAriaLabel: 'Language', modelValue: 'nl', options: [{ value: 'nl', label: 'Nederlands' }, { value: 'en', label: 'English' }] } })
    const el = w.find('input[role="combobox"]').element as HTMLInputElement
    expect(el.value).toBe('Nederlands')
    await w.find('input[role="combobox"]').trigger('focus')
    expect([el.selectionStart, el.selectionEnd]).toEqual([0, 10])
    el.setSelectionRange(3, 3)
    await w.find('input[role="combobox"]').trigger('click')
    expect([el.selectionStart, el.selectionEnd]).toEqual([0, 10])
  })
})
