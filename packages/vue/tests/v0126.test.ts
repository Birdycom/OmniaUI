// File: packages/vue/tests/v0126.test.ts
// Map: OcNameCard -> OcDateField (ISO week) -> OcBarcode -> OcMeterRow (levels)

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcBarcode from '../src/components/OcBarcode.vue'
import OcDateField from '../src/components/OcDateField.vue'
import OcMeterRow from '../src/components/OcMeterRow.vue'
import OcNameCard from '../src/components/OcNameCard.vue'

describe('v0.12.6 components', () => {
  it('name card shows name, amount and the rename pencil', () => {
    const w = mount(OcNameCard, { props: { name: 'Worktop', amount: '€ 1.940,00', renamable: true } })
    expect(w.find('.oc-name-card__title').text()).toBe('Worktop')
    expect(w.find('.oc-name-card__amount').text()).toBe('€ 1.940,00')
    expect(w.find('[data-oc-rename]').exists()).toBe(true)
  })

  it('date field shows the ISO week of its model', async () => {
    const w = mount(OcDateField, { props: { modelValue: '2027-01-01', weekLabel: 'Week {week} · {year}' } })
    expect(w.find('.oc-date-field__week').text()).toBe('Week 53 · 2026')
    await w.setProps({ modelValue: '2026-11-12' })
    expect(w.find('.oc-date-field__week').text()).toBe('Week 46 · 2026')
  })

  it('barcode draws bars, or the reason when the check digit is wrong', () => {
    expect(mount(OcBarcode, { props: { value: '5400000000010' } }).findAll('rect').length).toBeGreaterThan(20)
    const bad = mount(OcBarcode, { props: { value: '5400000000018' } })
    expect(bad.find('.oc-barcode').attributes('data-error')).toBe('')
    expect(bad.text()).toContain('check digit should be 0')
  })

  it('meter row picks its level from the percentage', () => {
    expect(mount(OcMeterRow, { props: { label: 'Week', percent: 81 } }).find('.oc-meter-row').attributes('data-level')).toBe('warn')
    expect(mount(OcMeterRow, { props: { label: 'Storage', percent: 96 } }).find('.oc-meter-row').attributes('data-level')).toBe('critical')
    expect(mount(OcMeterRow, { props: { label: 'Session', percent: 62 } }).find('.oc-meter-row').attributes('data-level')).toBeUndefined()
  })
})
