// File: packages/vue/tests/shop.test.ts
// Map: OcRating -> OcRatingInput -> OcPrice -> OcQuantity (steps, limits) -> OcGallery -> OcStock -> OcSpecList -> OcRibbon

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcGallery from '../src/components/OcGallery.vue'
import OcPrice from '../src/components/OcPrice.vue'
import OcQuantity from '../src/components/OcQuantity.vue'
import OcRating from '../src/components/OcRating.vue'
import OcRatingInput from '../src/components/OcRatingInput.vue'
import OcRibbon from '../src/components/OcRibbon.vue'
import OcSpecList from '../src/components/OcSpecList.vue'
import OcStock from '../src/components/OcStock.vue'

describe('shop components', () => {
  it('OcRating shows the score and a label', () => {
    const w = mount(OcRating, { props: { value: 4.5 } })
    expect(w.attributes('aria-label')).toBe('4.5 out of 5')
    expect(w.attributes('style')).toContain('--oc-rating: 4.5')
  })

  it('OcRatingInput updates v-model', async () => {
    const w = mount(OcRatingInput, { props: { modelValue: 2, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    expect(w.findAll('input[type=radio]')).toHaveLength(5)
    await w.findAll('input')[3].setValue(true)
    expect(w.props('modelValue')).toBe(4)
  })

  it('OcPrice formats the amount and shows the old price', () => {
    const w = mount(OcPrice, { props: { amount: 119, old: 149, discount: '-20%', sale: true } })
    expect(w.classes()).toContain('oc-price--sale')
    expect(w.find('.oc-price__amount').text()).toMatch(/119,00/)
    expect(w.find('.oc-price__old').text()).toMatch(/149,00/)
  })

  it('OcQuantity steps within min and max', async () => {
    const w = mount(OcQuantity, { props: { modelValue: 1, min: 1, max: 2, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const [minus, plus] = w.findAll('button')
    expect(minus.attributes('disabled')).toBeDefined()
    await plus.trigger('click')
    expect(w.props('modelValue')).toBe(2)
    expect(w.findAll('button')[1].attributes('disabled')).toBeDefined()
  })

  it('OcGallery renders slides and thumbnail radios (max 8)', () => {
    const images = Array.from({ length: 9 }, (_, i) => ({ src: `/p${i}.svg`, alt: `Photo ${i + 1}` }))
    const w = mount(OcGallery, { props: { images, side: true } })
    expect(w.findAll('.oc-gallery__slide')).toHaveLength(8)
    expect(w.findAll('.oc-gallery__thumb input')).toHaveLength(8)
    expect((w.find('.oc-gallery__thumb input').element as HTMLInputElement).checked).toBe(true)
  })

  it('OcStock picks the default text and level', () => {
    expect(mount(OcStock).text()).toBe('In stock')
    const low = mount(OcStock, { props: { level: 'low', note: '3 left' } })
    expect(low.attributes('data-level')).toBe('low')
    expect(low.find('.oc-stock__note').text()).toBe('· 3 left')
  })

  it('OcSpecList renders groups and rows', () => {
    const w = mount(OcSpecList, { props: { groups: [{ title: 'Dimensions', rows: [{ label: 'Height', value: '52 cm' }] }] } })
    expect(w.find('.oc-spec-group__title').text()).toBe('Dimensions')
    expect(w.findAll('.oc-spec-row')).toHaveLength(1)
  })

  it('OcRibbon puts corner, tone and size on the band', () => {
    expect(mount(OcRibbon, { slots: { default: 'New' } }).classes()).toEqual(['oc-ribbon'])
    const w = mount(OcRibbon, { props: { corner: 'bottom-end', tone: 'destructive', size: 'sm' }, slots: { default: 'Sale' } })
    expect(w.classes()).toEqual(['oc-ribbon', 'oc-ribbon--bottom-end', 'oc-ribbon--destructive', 'oc-ribbon--sm'])
    expect(w.text()).toBe('Sale')
  })
})
