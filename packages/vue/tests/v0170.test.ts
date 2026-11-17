// File: packages/vue/tests/v0170.test.ts
// Map: language menu flags="auto" + languageFlag -> dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group -> copy field display -> type picker action mode -> route steps status, badges, locked -> content blocks pinned + issues -> data table labels, view, pagination, bulk

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
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
import { languageFlag } from '../src/index'

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
