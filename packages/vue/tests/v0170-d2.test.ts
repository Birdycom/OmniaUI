// File: packages/vue/tests/v0170-d2.test.ts
// Map: OcCombobox catalog mode (numeric, @search debounce, selected, clear row, custom row, manage footer, portal,
//      description/image/emoji, ledger + module) -> OcFormField extras (tooltip, required, labelTrailing, errorKey,
//      hideLabel, ledger, module, validation message) -> OcInput mask + validation -> OcSelect/OcTextarea/OcInputGroup

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcCombobox from '../src/components/OcCombobox.vue'
import type { ComboboxItem } from '../src/components/OcCombobox.vue'
import OcFormField from '../src/components/OcFormField.vue'
import OcInput from '../src/components/OcInput.vue'
import OcSelect from '../src/components/OcSelect.vue'
import OcTextarea from '../src/components/OcTextarea.vue'
import OcInputGroup from '../src/components/OcInputGroup.vue'

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

const catalog: ComboboxItem[] = [
  { value: 1, label: 'Company 1', description: 'info@company1.example', emoji: '🏢' },
  { value: 2, label: 'Customer 1', image: '/img/customer-1.png' },
  { value: 3, label: 'Customer 2', icon: 'mdi:account' },
]

describe('0.17.0 OcCombobox catalog mode', () => {
  it('gives numbers with valueType=number; the hidden input stays a string', async () => {
    const w = mount(OcCombobox, { props: { options: catalog, valueType: 'number' as const, name: 'customer', modelValue: null, 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }) } })
    await w.find('input[role=combobox]').trigger('focus')
    await w.find('[data-value="2"]').trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([2])
    expect((w.find('input[type=hidden]').element as HTMLInputElement).value).toBe('2')
  })

  it('debounces @search and does not filter locally; loading marks the list busy', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const w = mount(OcCombobox, { props: { options: catalog, onSearch, searchDelay: 300, label: 'Customer' } })
    const input = w.find('input[role=combobox]')
    await input.trigger('focus')
    await input.setValue('c')
    await input.setValue('cu')
    vi.advanceTimersByTime(299)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledWith('cu')
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(w.text()).toContain('Company 1')
    await w.setProps({ options: [], loading: true })
    expect(w.find('[role=listbox]').attributes('aria-busy')).toBe('true')
    expect(w.find('.oc-combobox-loading').text()).toBe('Loading...')
    expect(w.find('.oc-combobox-empty').exists()).toBe(false)
  })

  it('shows the label of a selected option that is not in the options', () => {
    const w = mount(OcCombobox, { props: { options: [], modelValue: 42, selected: { value: 42, label: 'Company 42', emoji: '🏢' }, onSearch: () => {} } })
    expect((w.find('input[role=combobox]').element as HTMLInputElement).value).toBe('Company 42')
    expect(w.find('.oc-combobox-icon .oc-combobox-option-emoji').text()).toBe('🏢')
  })

  it('has a clear row first that empties the choice (null for numbers, "" for strings)', async () => {
    const w = mount(OcCombobox, { props: { options: catalog, modelValue: 1, valueType: 'number', clearLabel: 'No customer' } })
    const rows = w.findAll('[role=option]')
    expect(rows[0].classes()).toContain('oc-combobox-clear')
    await rows[0].trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([null])
    const s = mount(OcCombobox, { props: { options: [{ value: 'a', label: 'A' }], modelValue: 'a', clearLabel: 'None' } })
    await s.find('.oc-combobox-clear').trigger('click')
    expect(s.emitted('update:modelValue')![0]).toEqual([''])
  })

  it('offers what was typed and emits custom', async () => {
    const w = mount(OcCombobox, { props: { options: catalog, allowCustomFromSearch: true } })
    const input = w.find('input[role=combobox]')
    await input.trigger('focus')
    await input.setValue('Customer 9')
    const custom = w.find('.oc-combobox-custom')
    expect(custom.attributes('role')).toBe('option')
    expect(custom.text()).toBe('Use "Customer 9"')
    await input.trigger('keydown', { key: 'End' })
    expect(input.attributes('aria-activedescendant')).toBe(custom.attributes('id'))
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')![0]).toEqual(['Customer 9'])
    expect(w.emitted('custom')![0]).toEqual(['Customer 9'])
  })

  it('with numbers the custom row only emits custom', async () => {
    const w = mount(OcCombobox, { props: { options: catalog, valueType: 'number', allowCustomFromSearch: true } })
    const input = w.find('input[role=combobox]')
    await input.trigger('focus')
    await input.setValue('Company 9')
    await w.find('.oc-combobox-custom').trigger('click')
    expect(w.emitted('custom')![0]).toEqual(['Company 9'])
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('puts the manage link in a footer outside the listbox', async () => {
    const onManage = vi.fn()
    const w = mount(OcCombobox, { props: { options: catalog, manageHref: '/customers', manageLabel: 'Manage customers', onManage } })
    const link = w.find('.oc-combobox-footer a')
    expect(link.attributes('href')).toBe('/customers')
    expect(w.find('.oc-combobox-list--panel > ul.oc-combobox-options[role=listbox]').exists()).toBe(true)
    expect(link.element.closest('[role=listbox]')).toBeNull()
    link.element.addEventListener('click', (e) => e.preventDefault())
    await link.trigger('click')
    expect(onManage).toHaveBeenCalled()
  })

  it('teleports the list to body with portal and still chooses', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const w = mount(OcCombobox, { props: { options: catalog, portal: true, module: 'green' }, attachTo: host })
    await nextTick()
    const list = document.body.querySelector(':scope > .oc-combobox-list--portal') as HTMLElement
    expect(list).toBeTruthy()
    expect(w.element.querySelector('.oc-combobox-list')).toBeNull()
    expect(list.getAttribute('data-module')).toBe('green')
    await w.find('input[role=combobox]').trigger('focus')
    // 0.18.0: focus alone (a dialog that focuses the field) keeps it closed; the click of the user opens it
    await w.find('input[role=combobox]').trigger('click')
    expect(list.getAttribute('data-open')).toBe('')
    expect(list.style.position).toBe('fixed')
    const option = list.querySelector('[data-value="1"]') as HTMLElement
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    option.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    option.click()
    await nextTick()
    expect(w.emitted('update:modelValue')![0]).toEqual(['1'])
    w.unmount()
  })

  it('draws description, image and emoji', () => {
    const w = mount(OcCombobox, { props: { options: catalog, modelValue: '2' } })
    expect(w.find('.oc-combobox-option-description').text()).toBe('info@company1.example')
    expect(w.find('.oc-combobox-option-label').text()).toBe('Company 1')
    expect(w.find('.oc-combobox-list img.oc-combobox-option-image').attributes('alt')).toBe('')
    expect(w.find('.oc-combobox-icon img.oc-combobox-option-image').exists()).toBe(true)
  })

  it('sets ledger classes and data-module', () => {
    const w = mount(OcCombobox, { props: { options: catalog, variant: 'ledger', module: 'purple' } })
    expect(w.classes()).toContain('oc-combobox--ledger')
    expect(w.attributes('data-module')).toBe('purple')
    expect(w.find('input[role=combobox]').classes()).toContain('oc-input--ledger')
  })
})

describe('0.17.0 OcFormField extras', () => {
  it('draws tooltip, required mark and trailing content in a label row', () => {
    const w = mount(OcFormField, {
      props: { label: 'IBAN', tooltip: 'The account the refund goes to', required: true, labelTrailing: 'Optional help' },
      slots: { default: (f: { id: string; required?: boolean }) => h('input', { id: f.id, required: f.required }) },
    })
    const row = w.find('.oc-field-label-row')
    expect(row.find('.oc-field-label .oc-field-required').attributes('aria-hidden')).toBe('true')
    const button = row.find('button.oc-field-tooltip')
    expect(button.attributes('aria-label')).toBe('More information')
    expect(w.find(`#${button.attributes('aria-describedby')}`).text()).toBe('The account the refund goes to')
    expect(row.find('.oc-tooltip').attributes('data-tooltip')).toBe('The account the refund goes to')
    expect(row.find('.oc-field-label-trailing').text()).toBe('Optional help')
    expect(w.find('input').attributes('required')).toBeDefined()
  })

  it('renders a rich tooltip slot as .oc-tooltip__content', () => {
    const w = mount(OcFormField, { props: { label: 'VAT' }, slots: { tooltip: () => h('strong', 'BE0123.456.749'), default: () => h('input') } })
    expect(w.find('.oc-tooltip__content[role=tooltip] strong').text()).toBe('BE0123.456.749')
  })

  it('uses errorKey for data-error-key and the error id; hideLabel, ledger, module', () => {
    const w = mount(OcFormField, { props: { label: 'Email', errorKey: 'email', error: 'Required', hideLabel: true, variant: 'ledger', module: 'gold' } })
    expect(w.attributes('data-error-key')).toBe('email')
    expect(w.find('#email-error').text()).toBe('Required')
    expect(w.find('.oc-field-label').classes()).toContain('oc-visually-hidden')
    expect(w.classes()).toContain('oc-field--ledger')
    expect(w.attributes('data-module')).toBe('gold')
  })

  it('shows the validation message of its OcInput', async () => {
    const Form = defineComponent({
      setup: () => () => h(OcFormField, { label: 'IBAN' }, { default: () => h(OcInput, { validationType: 'iban', validationMessage: 'Not a valid IBAN' }) }),
    })
    const w = mount(Form)
    const input = w.find('input')
    await input.setValue('BE00 0000')
    await input.trigger('blur')
    expect(w.find('[role=alert]').text()).toBe('Not a valid IBAN')
    expect(input.attributes('aria-invalid')).toBe('true')
    await input.setValue('BE68 5390 0754 7034')
    expect(w.find('[role=alert]').exists()).toBe(false)
  })
})

describe('0.17.0 OcInput mask and validation', () => {
  it('formats an IBAN while typing and updates v-model', async () => {
    const value = ref('')
    const w = mount(OcInput, { props: { mask: 'iban', modelValue: value.value, 'onUpdate:modelValue': (v: unknown) => { value.value = String(v) } } })
    await w.find('input').setValue('be68539007547034')
    expect((w.find('input').element as HTMLInputElement).value).toBe('BE68 5390 0754 7034')
    expect(value.value).toBe('BE68 5390 0754 7034')
  })

  it('emits validate on blur and marks an invalid value', async () => {
    const w = mount(OcInput, { props: { validationType: 'email' } })
    await w.find('input').setValue('info@company1')
    await w.find('input').trigger('blur')
    expect(w.emitted('validate')![0]).toEqual([false, 'info@company1'])
    expect(w.classes()).toContain('oc-input--error')
  })

  it('sets ledger + module on OcInput, OcSelect, OcTextarea and OcInputGroup', () => {
    expect(mount(OcInput, { props: { variant: 'ledger', module: 'blue' } }).classes()).toContain('oc-input--ledger')
    const s = mount(OcSelect, { props: { variant: 'ledger', module: 'blue', options: ['A'] } })
    expect(s.classes()).toContain('oc-select--ledger')
    expect(s.attributes('data-module')).toBe('blue')
    expect(mount(OcTextarea, { props: { variant: 'ledger' } }).classes()).toContain('oc-textarea--ledger')
    const g = mount(OcInputGroup, { props: { variant: 'ledger', module: 'blue', prefix: 'EUR' } })
    expect(g.classes()).toContain('oc-input-group--ledger')
    expect(g.attributes('data-module')).toBe('blue')
  })
})
