// File: packages/vue/tests/v0172.test.ts
// Map: OcDropdownRadioGroup / OcDropdownRadioItem -> OcDataTable bulk-actions + column width -> OcButton as
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcDropdown from '../src/components/OcDropdown.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcDropdownRadioGroup from '../src/components/OcDropdownRadioGroup.vue'
import OcDropdownRadioItem from '../src/components/OcDropdownRadioItem.vue'
import OcDataTable from '../src/components/OcDataTable.vue'
import OcButton from '../src/components/OcButton.vue'
import OcCombobox from '../src/components/OcCombobox.vue'

describe('OcDropdownRadioGroup (0.17.2)', () => {
  it('checks the item of the v-model and updates it on a click', async () => {
    const value = ref('date')
    const Demo = defineComponent({
      setup: () => () =>
        h(OcDropdownRadioGroup, { modelValue: value.value, 'onUpdate:modelValue': (v: string | undefined) => (value.value = v as string) }, () => [
          h(OcDropdownRadioItem, { value: 'name', icon: 'mdi:sort' }, () => 'Name'),
          h(OcDropdownRadioItem, { value: 'date' }, () => 'Date'),
        ]),
    })
    const w = mount(Demo)
    expect(w.find('[role="group"]').exists()).toBe(true)
    const items = w.findAll('[role="menuitemradio"]')
    expect(items).toHaveLength(2)
    expect(items[0].attributes('aria-checked')).toBe('false')
    expect(items[1].attributes('aria-checked')).toBe('true')
    expect(items[0].attributes('data-value')).toBe('name')
    expect(items[0].find('.oc-dropdown-icon').exists()).toBe(true)
    await items[0].trigger('click')
    expect(value.value).toBe('name')
    await nextTick()
    expect(w.findAll('[role="menuitemradio"]')[0].attributes('aria-checked')).toBe('true')
  })

  it('keeps a toggle menu open (a check item), and the old radio item still works', async () => {
    const w = mount(OcDropdown, {
      props: { mode: 'toggle', label: 'Sort', open: true },
      slots: { default: () => h(OcDropdownRadioGroup, { modelValue: 'a' }, () => [h(OcDropdownRadioItem, { value: 'b' }, () => 'B')]) },
    })
    await w.find('[role="menuitemradio"]').trigger('click')
    expect(w.emitted('update:open')).toBeUndefined()
    const old = mount(OcDropdownItem, { props: { radio: true, checked: true }, slots: { default: 'Old' } })
    expect(old.attributes('role')).toBe('menuitemradio')
    expect(old.attributes('aria-checked')).toBe('true')
  })
})

const columns = [
  { key: 'name', header: 'Name', minWidth: '12rem', truncate: '10rem' },
  { key: 'amount', header: 'Amount', numeric: true, width: '8rem' },
]
const rows = [{ key: '1', cells: { name: 'Company 1', amount: '10' } }]

describe('OcDataTable bulk-actions and column width (0.17.2)', () => {
  it('keeps the built-in bar without bulk-actions', () => {
    const w = mount(OcDataTable, { props: { columns, rows } })
    expect(w.findAll('.oc-data-table-bulk [data-oc-bulk]').map((b) => b.attributes('data-oc-bulk'))).toEqual(['export', 'duplicate', 'archive', 'restore', 'delete', 'clear'])
  })

  it('adds, replaces and hides buttons', () => {
    const w = mount(OcDataTable, {
      props: {
        columns,
        rows,
        bulkActions: [
          { key: 'remind', label: 'Send reminder', icon: 'mdi:email-outline', tone: 'primary' },
          { key: 'mark', label: 'Mark paid', disabled: true },
          { key: 'delete', label: 'Remove' },
          { key: 'restore', label: '', hidden: true },
        ],
      },
    })
    const bar = w.find('.oc-data-table-bulk')
    expect(bar.findAll('[data-oc-bulk]').map((b) => b.attributes('data-oc-bulk'))).toEqual(['export', 'duplicate', 'archive', 'delete', 'remind', 'mark', 'clear'])
    const remind = bar.find('[data-oc-bulk="remind"]')
    expect(remind.classes()).toEqual(['oc-btn', 'oc-btn--sm'])
    expect(remind.find('svg, iconify-icon').exists()).toBe(true)
    expect(bar.find('[data-oc-bulk="mark"]').attributes('disabled')).toBeDefined()
    const del = bar.find('[data-oc-bulk="delete"]')
    expect(del.text()).toBe('Remove')
    expect(del.classes()).toContain('oc-btn--destructive')
  })

  it('emits bulk with the custom key', async () => {
    const w = mount(OcDataTable, { props: { columns, rows, bulkActions: [{ key: 'remind', label: 'Remind' }] }, attachTo: document.body })
    await w.find('[data-oc-select]').setValue(true)
    await w.find('[data-oc-bulk="remind"]').trigger('click')
    expect(w.emitted('bulk')?.[0]).toEqual(['remind', ['1']])
    w.unmount()
  })

  it('puts width and min-width on the th', () => {
    const w = mount(OcDataTable, { props: { columns, rows } })
    expect((w.find('th[data-oc-col="name"]').element as HTMLElement).style.minWidth).toBe('12rem')
    expect((w.find('th[data-oc-col="amount"]').element as HTMLElement).style.width).toBe('8rem')
    expect(w.find('.oc-data-table-truncate').attributes('title')).toBe('Company 1')
  })
})

describe('OcButton as (documented next to React asChild)', () => {
  it('renders the button classes on another tag', () => {
    const w = mount(OcButton, { props: { as: 'label', variant: 'secondary' }, slots: { default: 'Upload' } })
    expect(w.element.tagName).toBe('LABEL')
    expect(w.classes()).toEqual(['oc-btn', 'oc-btn--secondary'])
  })
})

describe('OcCombobox header trigger (0.17.2)', () => {
  const langs = [
    { value: 'nl', label: 'Nederlands', icon: 'flag:nl-4x3' },
    { value: 'en', label: 'English', emoji: 'E' },
  ]

  it('ghost + header: classes, list teleported by default, aria-label from trigger-aria-label', async () => {
    const w = mount(OcCombobox, { props: { triggerVariant: 'ghost', size: 'header', label: 'Workspaces', triggerAriaLabel: 'Workspace', options: langs, modelValue: 'nl' }, attachTo: document.body })
    await nextTick()
    expect(w.find('.oc-combobox').classes()).toEqual(['oc-combobox', 'oc-combobox--ghost', 'oc-combobox--header'])
    expect(w.find('input[role="combobox"]').attributes('aria-label')).toBe('Workspace')
    expect(w.find('[role="listbox"]').exists()).toBe(false)
    expect(document.body.querySelector('.oc-combobox-list--portal')).not.toBeNull()
    w.unmount()
  })

  it(':portal="false" keeps the list inside; full adds nothing', () => {
    const a = mount(OcCombobox, { props: { size: 'header', portal: false, options: langs } })
    expect(a.find('.oc-combobox-list').exists()).toBe(true)
    const b = mount(OcCombobox, { props: { options: langs, label: 'Language' } })
    expect(b.find('.oc-combobox').classes()).toEqual(['oc-combobox'])
    expect(b.find('input[role="combobox"]').attributes('aria-label')).toBe('Language')
  })

  it('icon-only: code, else chosen icon, else emoji, else dots; only with size=header', () => {
    const code = mount(OcCombobox, { props: { size: 'header', iconOnly: true, triggerLabel: 'NL', options: langs, modelValue: 'nl' } })
    expect(code.find('.oc-combobox').classes()).toContain('oc-combobox--icon-only')
    expect(code.find('.oc-combobox-icon .oc-combobox-code').text()).toBe('NL')
    const icon = mount(OcCombobox, { props: { size: 'header', iconOnly: true, options: langs, modelValue: 'nl' } })
    expect(icon.find('.oc-combobox-icon').find('svg, iconify-icon').exists()).toBe(true)
    expect(icon.find('.oc-combobox-icon svg[data-webicon="mdi:dots-horizontal"]').exists()).toBe(false)
    const emoji = mount(OcCombobox, { props: { size: 'header', iconOnly: true, options: langs, modelValue: 'en' } })
    expect(emoji.find('.oc-combobox-icon .oc-combobox-option-emoji').text()).toBe('E')
    const dots = mount(OcCombobox, { props: { size: 'header', iconOnly: true, options: [{ value: 'a', label: 'A' }] } })
    expect(dots.find('.oc-combobox-icon svg[data-webicon="mdi:dots-horizontal"]').exists()).toBe(true)
    const notHeader = mount(OcCombobox, { props: { iconOnly: true, options: langs } })
    expect(notHeader.find('.oc-combobox').classes()).not.toContain('oc-combobox--icon-only')
  })
})
