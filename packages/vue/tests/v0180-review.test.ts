// File: packages/vue/tests/v0180-review.test.ts
// Map: OcCombobox opens on a user action only (not on the focus a dialog gives it) -> OcTimeInput selectOnFocus
//      -> OcPhoneInput regroups the number when the country changes
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcCombobox from '../src/components/OcCombobox.vue'
import OcPhoneInput from '../src/components/OcPhoneInput.vue'
import OcTimeInput from '../src/components/OcTimeInput.vue'

const options = [
  { value: '1', label: 'Customer 1' },
  { value: '2', label: 'Customer 2' },
]
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('OcCombobox opens on a user action only (0.18.0)', () => {
  it('a focus from a script or autofocus keeps the list closed; click, Arrow Down, Enter and typing open it', async () => {
    const w = mount(OcCombobox, { props: { options, label: 'Customer' }, attachTo: document.body })
    const input = w.find('.oc-combobox-input')
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('click')
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    await input.setValue('Cust')
    expect(input.attributes('aria-expanded')).toBe('true')
    w.unmount()
  })

  it('Tab into the field still opens it', async () => {
    const w = mount(OcCombobox, { props: { options, label: 'Customer' }, attachTo: document.body })
    const input = w.find('.oc-combobox-input')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('blur')
    await tick(450)
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
})

describe('OcTimeInput selectOnFocus (0.18.0)', () => {
  it('is on with slotsPopover: focus selects the whole time, the first mouseup keeps it', async () => {
    const w = mount(OcTimeInput, { props: { modelValue: '09:00', slots: ['09:00', '09:30'], slotsPopover: true }, attachTo: document.body })
    const el = w.find('input.oc-time-input').element as HTMLInputElement
    el.focus()
    expect([el.selectionStart, el.selectionEnd]).toEqual([0, 5])
    const up = new MouseEvent('mouseup', { bubbles: true, cancelable: true })
    el.dispatchEvent(up)
    expect(up.defaultPrevented).toBe(true)
    w.unmount()
  })

  it('is off without slotsPopover and with select-on-focus false; on when asked', () => {
    const plain = mount(OcTimeInput, { props: { modelValue: '09:00' }, attachTo: document.body })
    const a = plain.find('input').element as HTMLInputElement
    a.setSelectionRange(5, 5)
    a.focus()
    expect(a.selectionStart).toBe(5)
    const off = mount(OcTimeInput, { props: { modelValue: '09:00', slots: ['09:00'], slotsPopover: true, selectOnFocus: false }, attachTo: document.body })
    const b = off.find('input.oc-time-input').element as HTMLInputElement
    b.setSelectionRange(5, 5)
    b.focus()
    expect(b.selectionStart).toBe(5)
    const on = mount(OcTimeInput, { props: { modelValue: '10:30', selectOnFocus: true }, attachTo: document.body })
    const c = on.find('input').element as HTMLInputElement
    c.focus()
    expect([c.selectionStart, c.selectionEnd]).toEqual([0, 5])
    plain.unmount()
    off.unmount()
    on.unmount()
  })
})

describe('OcPhoneInput regroups on a country change (0.18.0)', () => {
  it('keeps the digits and shows them in the grouping of the new country', async () => {
    const w = mount(OcPhoneInput, {
      props: { modelValue: '+32470123456', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) },
    })
    const input = () => (w.find('.oc-phone-input-number').element as HTMLInputElement).value
    expect(input()).toBe('470 12 34 56')
    await w.find('select').setValue('+31')
    expect(w.props('modelValue')).toBe('+31470123456')
    expect(input()).toBe('4 70 12 34 56')
    await w.find('select').setValue('+49')
    expect(input()).toBe('470 1234 56')
  })
})
