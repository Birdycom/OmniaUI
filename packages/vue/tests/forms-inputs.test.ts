// File: packages/vue/tests/forms-inputs.test.ts
// Map: group A form components -> markup classes, modifiers and v-model behaviour of each wrapper.
// Imports straight from the .vue files, so this test does not depend on the generated index.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcAffixInput from '../src/components/OcAffixInput.vue'
import OcBarcodeInput from '../src/components/OcBarcodeInput.vue'
import OcChipFilter from '../src/components/OcChipFilter.vue'
import OcColorSelect from '../src/components/OcColorSelect.vue'
import OcDecimalInput from '../src/components/OcDecimalInput.vue'
import OcFilterCounts from '../src/components/OcFilterCounts.vue'
import OcLanguageSelect from '../src/components/OcLanguageSelect.vue'
import OcNumberInput from '../src/components/OcNumberInput.vue'
import OcPasswordRequirements from '../src/components/OcPasswordRequirements.vue'
import OcPhoneInput from '../src/components/OcPhoneInput.vue'
import OcTimeInput from '../src/components/OcTimeInput.vue'
import OcToggleField from '../src/components/OcToggleField.vue'

/** Minimal wrapper shape the v-model helper needs. */
type Settable = { setProps: (p: object) => unknown }

/**
 * v-model props that write the emitted value back, like a parent would.
 * Call it as `model(value, (): Settable => w)`: the explicit return type breaks
 * the circular type of `w` (vue-tsc error TS7022). The handler takes `unknown`
 * so it fits every wrapper's emit type.
 */
const model = <T>(value: T, get: () => Settable) => ({
  modelValue: value,
  'onUpdate:modelValue': (v: unknown) => get().setProps({ modelValue: v }),
})

describe('Forms - inputs', () => {
  it('OcPhoneInput groups digits and joins the dial code', async () => {
    const w = mount(OcPhoneInput, { props: model('+32470123456', (): Settable => w), attrs: { id: 'tel' } })
    const input = w.find('input')
    expect(input.element.value).toBe('470 12 34 56')
    expect(input.attributes('id')).toBe('tel')
    await input.setValue('485 11')
    expect(w.props('modelValue')).toBe('+3248511')
    await w.find('select').setValue('+31')
    expect(w.props('modelValue')).toBe('+3148511')
  })

  it('OcNumberInput steps and clamps', async () => {
    const w = mount(OcNumberInput, { props: { ...model(9, (): Settable => w), min: 0, max: 10, size: 'sm' as const } })
    expect(w.classes()).toEqual(['oc-number-input', 'oc-number-input--sm'])
    await w.findAll('button')[1].trigger('click')
    expect(w.props('modelValue')).toBe(10)
    expect(w.findAll('button')[1].attributes('disabled')).toBeDefined()
  })

  it('OcAffixInput applies the variant presets', () => {
    const w = mount(OcAffixInput, { props: { variant: 'currency' } })
    expect(w.classes()).toEqual(['oc-input-group', 'oc-input-group--affix'])
    expect(w.find('.oc-input-addon').text()).toBe('€')
    expect(w.find('input').attributes('inputmode')).toBe('decimal')
    expect(mount(OcAffixInput, { props: { variant: 'email' } }).find('input').attributes('type')).toBe('email')
  })

  it('OcDecimalInput parses while typing and formats on blur', async () => {
    const w = mount(OcDecimalInput, { props: { ...model<number | null>(null, (): Settable => w), locale: 'en-US', unit: 'kg' } })
    expect(w.classes()).toContain('oc-decimal-field')
    const input = w.find('input')
    await input.trigger('focus')
    await input.setValue('1234.5')
    expect(w.props('modelValue')).toBe(1234.5)
    await input.trigger('blur')
    expect(input.element.value).toBe('1,234.50')
  })

  it('OcTimeInput adds the colon and a datalist', async () => {
    const w = mount(OcTimeInput, { props: { ...model('', (): Settable => w), slots: ['08:00', '08:30'] } })
    await w.find('input').setValue('0815')
    expect(w.props('modelValue')).toBe('08:15')
    expect(w.findAll('datalist option')).toHaveLength(2)
  })

  it('OcBarcodeInput keeps digits and fills the preview', async () => {
    const w = mount(OcBarcodeInput, { props: { ...model('', (): Settable => w), label: 'EAN' } })
    expect(w.find('figure').classes()).toContain('oc-barcode-preview--empty')
    await w.find('input').setValue('SET-1105')
    expect(w.props('modelValue')).toBe('SET-1105')
    expect(w.find('.oc-barcode-preview-code').text()).toBe('SET-1105')
    expect(w.find('figure').classes()).not.toContain('oc-barcode-preview--empty')
  })

  it('OcColorSelect sets --oc-swatch and updates v-model', async () => {
    const w = mount(OcColorSelect, {
      props: { ...model('blue', (): Settable => w), options: [{ value: 'red', label: 'Red', color: 'var(--color-red-70)' }, { value: 'blue', label: 'Blue', color: 'var(--oc-primary)' }] },
    })
    expect(w.find('label').attributes('style')).toContain('--oc-swatch: var(--color-red-70)')
    await w.findAll('input')[0].setValue(true)
    expect(w.props('modelValue')).toBe('red')
  })

  it('OcLanguageSelect renders the currency pill', async () => {
    const w = mount(OcLanguageSelect, { props: { ...model('EUR', (): Settable => w), currency: true, options: [{ value: 'EUR', label: 'EUR' }, { value: 'USD', label: 'USD' }] } })
    expect(w.classes()).toEqual(['oc-language-select', 'oc-language-select--currency'])
    expect(w.find('select').attributes('aria-label')).toBe('Currency')
    await w.find('select').setValue('USD')
    expect(w.props('modelValue')).toBe('USD')
  })

  it('OcToggleField links the description and toggles', async () => {
    const w = mount(OcToggleField, { props: { ...model(false, (): Settable => w), label: 'Alerts', description: 'Daily mail', card: true } })
    const input = w.find('input')
    expect(input.attributes('role')).toBe('switch')
    expect(w.find(`#${input.attributes('aria-describedby')}`).text()).toBe('Daily mail')
    await input.setValue(true)
    expect(w.props('modelValue')).toBe(true)
  })

  it('OcPasswordRequirements marks met rules', () => {
    const w = mount(OcPasswordRequirements, { props: { password: 'Secret1' } })
    expect(w.findAll('li').map((li) => li.classes().includes('oc-password-requirement--met'))).toEqual([false, true, true, false])
    expect(mount(OcPasswordRequirements, { props: { password: '', hideWhenEmpty: true } }).find('ul').exists()).toBe(false)
  })

  it('OcChipFilter collects several values with multiple', async () => {
    const w = mount(OcChipFilter, { props: { ...model<string[] | undefined>(undefined, (): Settable => w), multiple: true, options: [{ value: 'a', label: 'A', count: 2 }, { value: 'b', label: 'B' }] } })
    expect(w.attributes('role')).toBe('group')
    await w.findAll('input')[0].trigger('change')
    await w.findAll('input')[1].trigger('change')
    expect(w.props('modelValue')).toEqual(['a', 'b'])
    expect(w.find('.oc-chip-filter-count').text()).toBe('2')
  })

  it('OcFilterCounts maps tones and v-model', async () => {
    const w = mount(OcFilterCounts, { props: { ...model('active', (): Settable => w), compact: true, options: [{ value: 'active', label: 'Active', count: 12, tone: 'success' as const }, { value: 'all', label: 'All', count: 14 }] } })
    expect(w.classes()).toEqual(['oc-filter-counts', 'oc-filter-counts--compact'])
    expect(w.findAll('label')[0].classes()).toContain('oc-filter-counts-item--success')
    await w.findAll('input')[1].setValue(true)
    expect(w.props('modelValue')).toBe('all')
  })
})
