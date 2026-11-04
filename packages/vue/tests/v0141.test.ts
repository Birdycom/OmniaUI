// File: packages/vue/tests/v0141.test.ts
// Map: OcTintCard (link, tone, webicon art, arrow, meta) -> OcTintCard as article (lg, icon slot, no arrow)

import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import OcDefinitionList from '../src/components/OcDefinitionList.vue'
import OcDocLayout from '../src/components/OcDocLayout.vue'
import OcStepList from '../src/components/OcStepList.vue'
import OcTintCard from '../src/components/OcTintCard.vue'

describe('0.14.1 components', () => {
  it('tint card is a link with a tone, a corner webicon, an arrow chip and a meta line', () => {
    const w = mount(OcTintCard, {
      props: { href: '/delivery', title: 'Delivery', icon: 'mdi-light:truck', tone: 'destructive', meta: '12 modules' },
      slots: { default: 'Routes on the phone' },
    })
    const card = w.find('a.oc-tint-card')
    expect(card.classes()).toContain('oc-tint-card--destructive')
    expect(card.attributes('href')).toBe('/delivery')
    expect(w.find('iconify-icon.oc-tint-card__art').attributes('icon')).toBe('mdi-light:truck')
    expect(w.find('h3.oc-tint-card__title').text()).toBe('Delivery')
    expect(w.find('.oc-tint-card__go').exists()).toBe(true)
    expect(w.find('.oc-tint-card__text').text()).toBe('Routes on the phone')
    expect(w.find('.oc-tint-card__meta').text()).toBe('12 modules')
  })

  it('tint card without href is an article; lg, icon slot, no arrow', () => {
    const w = mount(OcTintCard, {
      props: { title: 'Reports', size: 'lg', headingLevel: 2, noArrow: true },
      slots: { icon: () => h('svg', { 'data-x': '1' }) },
    })
    expect(w.find('article.oc-tint-card').classes()).toEqual(['oc-tint-card', 'oc-tint-card--lg'])
    expect(w.find('span.oc-tint-card__art svg').exists()).toBe(true)
    expect(w.find('h2.oc-tint-card__title').exists()).toBe(true)
    expect(w.find('.oc-tint-card__go').exists()).toBe(false)
    expect(w.find('.oc-tint-card__text').exists()).toBe(false)
  })

  it('tint card fill adds the Pro shape class', () => {
    const w = mount(OcTintCard, { props: { href: '/a', title: 'A', fill: true, size: 'lg' } })
    expect(w.classes()).toEqual(['oc-tint-card', 'oc-tint-card--lg', 'oc-tint-card--fill'])
  })

  it('doc layout puts the side column next to the text, on the right with end', () => {
    const w = mount(OcDocLayout, { props: { end: true }, slots: { aside: '<nav class="oc-toc"></nav>', default: '<p>Text</p>' } })
    expect(w.classes()).toEqual(['oc-doc-layout', 'oc-doc-layout--end'])
    expect(w.find('aside.oc-doc-layout__aside .oc-toc').exists()).toBe(true)
    expect(w.find('.oc-doc-layout__main').text()).toBe('Text')
  })

  it('definition list as a glossary', () => {
    const w = mount(OcDefinitionList, { props: { glossary: true, rows: [{ term: 'Service', detail: 'The software.' }] } })
    expect(w.find('dl').classes()).toEqual(['oc-dl', 'oc-dl--glossary'])
  })

  it('step list renders one li per item, small', () => {
    const w = mount(OcStepList, { props: { items: ['Sign in', 'Open Settings'], size: 'sm' } })
    expect(w.classes()).toEqual(['oc-step-list', 'oc-step-list--sm'])
    expect(w.findAll('li')).toHaveLength(2)
  })
})
