// File: packages/vue/tests/v0170.test.ts
// Map: language menu flags="auto" + languageFlag -> dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group -> copy field display -> type picker action mode -> route steps status, badges, locked -> content blocks pinned + issues -> data table labels, view, pagination, bulk -> color field contrast -> countdown -> answer tiles -> save status -> calendar

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OcLanguageMenu from '../src/components/OcLanguageMenu.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcSidebarMeta from '../src/components/OcSidebarMeta.vue'
import OcFormSection from '../src/components/OcFormSection.vue'
import OcOtpInput from '../src/components/OcOtpInput.vue'
import OcCopyField from '../src/components/OcCopyField.vue'
import OcBlockTypePicker from '../src/blocks/OcBlockTypePicker.vue'
import OcBlockRouteSteps from '../src/blocks/OcBlockRouteSteps.vue'
import OcBlockContentBlocks from '../src/blocks/OcBlockContentBlocks.vue'
import OcDataTable from '../src/components/OcDataTable.vue'
import OcColorField from '../src/components/OcColorField.vue'
import OcCountdown from '../src/components/OcCountdown.vue'
import OcBlockStepView from '../src/blocks/OcBlockStepView.vue'
import OcSaveStatus from '../src/components/OcSaveStatus.vue'
import OcCalendar from '../src/components/OcCalendar.vue'
import { contrastRatio, languageFlag, pickOnColor } from '../src/index'

describe('0.17.0 language menu', () => {
  it('languageFlag: region wins, else the usual country', () => {
    expect(languageFlag('en')).toBe('flag:gb-4x3')
    expect(languageFlag('pt-BR')).toBe('flag:br-4x3')
    expect(languageFlag('fil')).toBeUndefined()
  })

  it('flags="auto" draws a flag from the code; own flag and flagFor win', () => {
    const options = [{ value: 'en', label: 'English' }, { value: 'nl-BE', label: 'Vlaams' }, { value: 'fr', label: 'Français', flag: 'flag:be-4x3' }, { value: 'de', label: 'Deutsch' }]
    const w = mount(OcLanguageMenu, { props: { options, modelValue: 'en', flags: 'auto', flagFor: (v: string) => (v === 'de' ? 'flag:it-4x3' : undefined) } })
    const names = w.findAll('.oc-language-flag svg').map((f) => f.attributes('data-webicon'))
    expect(names).toEqual(['flag:gb-4x3', 'flag:gb-4x3', 'flag:be-4x3', 'flag:be-4x3', 'flag:it-4x3'])
  })
})

describe('0.17.0 dropdown item', () => {
  it('description makes a two-line item; icon-tone a tinted icon square', () => {
    const w = mount(OcDropdownItem, { props: { icon: 'mdi:check', iconTone: 'warning', description: 'Second line' }, slots: { default: 'Label' } })
    expect(w.find('.oc-dropdown-icon').classes()).toEqual(['oc-dropdown-icon', 'oc-dropdown-icon--warning'])
    expect(w.find('.oc-dropdown-text > span').text()).toBe('Label')
    expect(w.find('.oc-dropdown-desc').text()).toBe('Second line')
    expect(mount(OcDropdownItem, { slots: { default: 'Edit' } }).find('.oc-dropdown-text').exists()).toBe(false)
  })
})

describe('0.17.0 sidebar meta', () => {
  it('wrap and collapsed add their modifiers', () => {
    expect(mount(OcSidebarMeta, { props: { wrap: true, version: '1' } }).classes()).toContain('oc-sidebar-meta--wrap')
    expect(mount(OcSidebarMeta, { props: { collapsed: true, version: '1' } }).classes()).toContain('oc-sidebar-meta--collapsed')
  })
})

describe('0.17.0 form section', () => {
  it('invalid sets data-issue, issues shows a labelled count', () => {
    const w = mount(OcFormSection, { props: { title: 'Location', invalid: 'warning', issues: 3 } })
    expect(w.attributes('data-issue')).toBe('warning')
    expect(w.find('.oc-form-section__count').attributes('aria-label')).toBe('3 warnings')
  })
})

describe('0.17.0 otp input', () => {
  it('fit and group add their classes and the group size', () => {
    const w = mount(OcOtpInput, { props: { length: 8, fit: true, group: 4 } })
    expect(w.classes()).toEqual(['oc-otp', 'oc-otp--fit', 'oc-otp--group'])
    expect(w.attributes('style')).toContain('--oc-otp-group: 4')
  })
})

describe('0.17.0 copy field display', () => {
  it('display shows the grouped code with a caption; data-copy holds the raw value', () => {
    const w = mount(OcCopyField, { props: { value: 'K7QM2XPA', display: true, group: 4, caption: 'Type it in the app' } })
    expect(w.classes()).toEqual(['oc-copy-field', 'oc-copy-field--display'])
    expect((w.find('input').element as HTMLInputElement).value).toBe('K7QM 2XPA')
    expect(w.find('button').attributes('data-copy')).toBe('K7QM2XPA')
    expect(w.find('.oc-copy-field-caption').text()).toBe('Type it in the app')
  })
})

describe('0.17.0 type picker action mode', () => {
  it('cards are buttons; a click emits pick, a card with a reason does not', async () => {
    const options = [{ value: 'text', label: 'Text' }, { value: 'photo', label: 'Photo', disabledReason: 'One photo per step' }]
    const w = mount(OcBlockTypePicker, { props: { mode: 'action', options, search: false, draggable: true } })
    const [text, photo] = w.findAll('button.oc-block-type-picker-item')
    await text.trigger('click')
    await photo.trigger('click')
    expect(w.emitted('pick')).toHaveLength(1)
    expect(w.emitted('pick')![0][0]).toBe('text')
    expect(photo.attributes('aria-disabled')).toBe('true')
    expect(photo.find('.oc-block-type-picker-reason').text()).toBe('One photo per step')
    expect(text.attributes('draggable')).toBe('true')
  })
})

describe('0.17.0 route steps', () => {
  it('status tooltip, badges and locked', () => {
    const steps = [{ id: 'a', name: 'Gate', status: '2 problems', statusTone: 'destructive' as const, statusTooltip: 'No location', badges: [{ label: 'Counts' }, { label: 'Team', tone: 'info' as const }] }]
    const w = mount(OcBlockRouteSteps, { props: { title: 'Steps', steps, search: false, locked: true } })
    expect(w.find('.oc-block-route-steps-status.oc-tooltip').attributes('data-tooltip')).toBe('No location')
    expect(w.findAll('.oc-block-route-steps-badges .oc-badge')).toHaveLength(2)
    expect(w.classes()).toContain('oc-block-route-steps--locked')
    expect(w.find('.oc-sortable-row-grip').attributes('disabled')).toBeDefined()
    expect(w.text()).not.toContain('Move up')
  })
})

describe('0.17.0 content blocks', () => {
  it('pinned items show a pin and no move buttons; issues show a count', async () => {
    const items = [{ id: 'intro', type: 'Intro', pinned: true }, { id: 'text', type: 'Text', issue: 'warning' as const, issues: 1 }, { id: 'photo', type: 'Photo' }]
    const w = mount(OcBlockContentBlocks, { props: { title: 'Step 1', items } })
    const rows = w.findAll('.oc-block-content-blocks-item')
    expect(rows[0].find('.oc-block-content-blocks-pin').exists()).toBe(true)
    expect(rows[0].find('.oc-sortable-row-grip').exists()).toBe(false)
    expect(rows[1].find('[aria-label="Move Text up"]').attributes('disabled')).toBeDefined()
    expect(rows[1].attributes('data-issue')).toBe('warning')
    expect(rows[1].find('.oc-block-content-blocks-count').attributes('aria-label')).toBe('1 warning')
    await rows[1].find('[aria-label="Move Text down"]').trigger('click')
    expect(w.emitted('move')![0]).toEqual(['text', 2])
  })
})

describe('0.17.0 data table', () => {
  const columns = [{ key: 'name', header: 'Naam' }]
  const rows = Array.from({ length: 12 }, (_, i) => ({ key: String(i), cells: { name: `Game ${i + 1}` } }))
  it('labels translate the texts; view, pagination and bulk can be switched off', () => {
    const w = mount(OcDataTable, { props: { title: 'Spellen', columns, rows, labels: { exportCsv: 'CSV exporteren', nextPage: 'Volgende pagina' }, view: false, pagination: false, filters: false } })
    expect(w.text()).toContain('CSV exporteren')
    expect(w.attributes('data-oc-labels')).toBe('{"nextPage":"Volgende pagina"}')
    expect(w.attributes('data-oc-no-grid')).toBe('')
    expect(w.attributes('data-page-size')).toBe('0')
    expect(w.find('.oc-data-table-view').exists()).toBe(false)
    expect(w.find('.oc-data-table-pager').exists()).toBe(false)
    expect(w.find('.oc-data-table-bulk').exists()).toBe(false)
  })
})

describe('0.17.0 color field contrast', () => {
  it('helpers and the report', async () => {
    expect(contrastRatio('#fff', '#000')!.toFixed(0)).toBe('21')
    expect(pickOnColor('#003366')).toBe('#ffffff')
    const w = mount(OcColorField, { props: { modelValue: '#ffeb3b', contrastAgainst: [{ name: 'the light page', color: '#ffffff' }] } })
    await nextTick()
    expect(w.findAll('.oc-color-field-check').map((li) => li.attributes('data-ok'))).toEqual(['true', 'false'])
  })
})

describe('0.17.0 countdown', () => {
  it('ticks and emits end once', async () => {
    vi.useFakeTimers()
    const w = mount(OcCountdown, { props: { seconds: 2, variant: 'display' } })
    expect(w.classes()).toContain('oc-countdown--display')
    expect(w.find('.oc-countdown-time').text()).toBe('0:02')
    vi.advanceTimersByTime(2500)
    await nextTick()
    expect(w.find('.oc-countdown-time').text()).toBe('0:00')
    expect(w.emitted('end')).toHaveLength(1)
    vi.useRealTimers()
  })
})

describe('0.17.0 answer tiles', () => {
  it('result marks the answers and shows the feedback slot', () => {
    const w = mount(OcBlockStepView, { props: { title: 'Old gate', question: { text: 'Year?', options: ['1890', '1910', '1930'], result: { picked: 2, correct: 1 } } }, slots: { feedback: '<p class="fb">Not quite</p>' } })
    expect(w.findAll('.oc-radio-item--card').map((c) => c.attributes('data-result'))).toEqual([undefined, 'correct', 'wrong'])
    expect(w.find('.fb').exists()).toBe(true)
    expect(w.find('.oc-block-step-view-send').exists()).toBe(false)
  })
})

describe('0.17.0 save status', () => {
  it('maps the state to a dot and words', () => {
    const w = mount(OcSaveStatus, { props: { state: 'dirty' } })
    expect(w.attributes('aria-live')).toBe('polite')
    expect(w.find('.oc-status-dot').classes()).toContain('oc-status-dot--waiting')
    expect(w.text()).toBe('Unsaved changes')
  })
})

describe('0.17.0 calendar', () => {
  it('picks a day and a range', async () => {
    const w = mount(OcCalendar, { props: { modelValue: '2026-10-20', today: '2026-10-14', locale: 'en' } })
    expect(w.find('.oc-calendar-title').text()).toBe('October 2026')
    await w.find('[data-date="2026-10-22"]').trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['2026-10-22'])
    const r = mount(OcCalendar, { props: { mode: 'range', month: '2026-10', today: '2026-10-14', locale: 'en', range: { start: '2026-10-28' } } })
    await r.find('[data-date="2026-10-30"]').trigger('click')
    expect(r.emitted('update:range')![0]).toEqual([{ start: '2026-10-28', end: '2026-10-30' }])
  })
})
