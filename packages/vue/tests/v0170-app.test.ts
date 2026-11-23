// File: packages/vue/tests/v0170-app.test.ts
// Map: 0.17.0 app-migration fixes: OcOtpInput complete after the v-model update -> OcBarcode bare + digit groups ->
//      OcCopyField masked / wrap / copiedLabel / ariaLabel / icon -> OcRecoveryCodes copied feedback, icons, print

import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import OcOtpInput from '../src/components/OcOtpInput.vue'
import OcBarcode from '../src/components/OcBarcode.vue'
import OcCopyField from '../src/components/OcCopyField.vue'
import OcRecoveryCodes from '../src/components/OcRecoveryCodes.vue'

describe('0.17.0 OcOtpInput complete', () => {
  it('the parent model already holds the full code when complete fires', async () => {
    const seen: string[] = []
    const Parent = defineComponent({
      setup() {
        const code = ref('')
        return () => h(OcOtpInput, { modelValue: code.value, 'onUpdate:modelValue': (v: string) => (code.value = v), onComplete: () => seen.push(code.value), length: 4 })
      },
    })
    const w = mount(Parent)
    await w.find('input').setValue('123')
    expect(seen).toEqual([])
    await w.find('input').setValue('1234')
    await flushPromises()
    expect(seen).toEqual(['1234'])
  })
})

describe('0.17.0 OcBarcode', () => {
  it('bare variant and grouped digits', () => {
    const w = mount(OcBarcode, { props: { value: '5400000000010', variant: 'bare' } })
    expect(w.classes()).toEqual(['oc-barcode', 'oc-barcode--bare'])
    expect(w.findAll('.oc-barcode__group').map((g) => g.text())).toEqual(['5', '400000', '000010'])
    expect(w.find('.oc-barcode__digits').element.textContent!.replace(/\s/g, '')).toBe('5400000000010')
  })
  it('EAN-8 4 4, UPC-A 1 5 5 1, groupDigits false', () => {
    const groups = (props: Record<string, unknown>) => mount(OcBarcode, { props: props as { value: string } }).findAll('.oc-barcode__group').map((g) => g.text())
    expect(groups({ value: '96385074' })).toEqual(['9638', '5074'])
    expect(groups({ value: '03600029145', format: 'UPC' })).toEqual(['0', '36000', '29145', '2'])
    expect(groups({ value: '5400000000010', groupDigits: false })).toEqual(['5400000000010'])
    expect(mount(OcBarcode, { props: { value: '5400000000010' } }).classes()).toEqual(['oc-barcode'])
  })
})

describe('0.17.0 OcCopyField', () => {
  it('masked: password input and a toggle with aria-pressed', async () => {
    const w = mount(OcCopyField, { props: { value: 'sk_test_123', masked: true, ariaLabel: 'API key', revealLabel: 'Show key' } })
    const input = w.find('input')
    expect(input.attributes('type')).toBe('password')
    expect(input.attributes('aria-label')).toBe('API key')
    const toggle = w.find('.oc-copy-field-toggle')
    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(toggle.attributes('aria-label')).toBe('Show key')
    expect(toggle.attributes('aria-controls')).toBe(input.attributes('id'))
    expect(toggle.find('svg').attributes('data-webicon')).toBe('mdi:eye')
    await toggle.trigger('click')
    expect(w.find('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(toggle.find('svg').attributes('data-webicon')).toBe('mdi:eye-off')
  })
  it('copy icon, copiedLabel on the button and in the live region', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const w = mount(OcCopyField, { props: { value: 'abc', copiedLabel: 'Gekopieerd' } })
    const btn = w.find('.oc-copy-field-button')
    expect(btn.find('svg').attributes('data-webicon')).toBe('mdi:content-copy')
    const status = w.find('.oc-copy-field-status')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    await btn.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('abc')
    expect(btn.classes()).toContain('is-copied')
    expect(btn.text()).toBe('Gekopieerd')
    expect(status.text()).toBe('Gekopieerd')
  })
  it('wrap renders an output; default aria-label stays Value', () => {
    const w = mount(OcCopyField, { props: { value: 'https://company1.example/a/long/path', wrap: true, icon: false } })
    expect(w.classes()).toEqual(['oc-copy-field', 'oc-copy-field--wrap'])
    expect(w.find('output.oc-copy-field-value').attributes('aria-label')).toBe('Value')
    expect(w.find('.oc-copy-field-button svg').exists()).toBe(false)
  })
})

describe('0.17.0 OcRecoveryCodes', () => {
  it('icons, Copied feedback in a live region, optional print', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const w = mount(OcRecoveryCodes, { props: { codes: ['AAAA-1111', 'BBBB-2222'], print: true, copiedLabel: 'Gekopieerd' } })
    expect(w.find('.oc-recovery-codes-warning svg').attributes('data-webicon')).toBe('mdi:alert-outline')
    expect(w.findAll('.oc-recovery-codes-actions svg').map((s) => s.attributes('data-webicon'))).toEqual(['mdi:content-copy', 'mdi:download', 'mdi:printer'])
    const copy = w.findAll('button')[0]
    await copy.trigger('click')
    await flushPromises()
    expect(copy.text()).toBe('Gekopieerd')
    expect(copy.classes()).toContain('is-copied')
    expect(w.find('.oc-recovery-codes-status').text()).toBe('Gekopieerd')
    expect(w.emitted('copy')).toHaveLength(1)
  })
  it('two buttons by default; icons false draws none', () => {
    const w = mount(OcRecoveryCodes, { props: { codes: ['AAAA-1111'], icons: false } })
    expect(w.findAll('.oc-recovery-codes-actions button')).toHaveLength(2)
    expect(w.find('svg').exists()).toBe(false)
  })
})
