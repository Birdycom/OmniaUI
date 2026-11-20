// File: packages/vue/tests/v0170-w3.test.ts
// Map: tabs (variant, buttons mode, icons + counts) -> card footer + bare -> accordion multiple + flush -> version banner href/short
//      -> theme toggle text -> navmenu site + group heading -> live frame src + slot -> barcode input error/no preview
//      -> lazy image placeholder/thumb -> price card group label -> tint card title link

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import OcTabs from '../src/components/OcTabs.vue'
import OcCard from '../src/components/OcCard.vue'
import OcAccordion from '../src/components/OcAccordion.vue'
import OcAccordionItem from '../src/components/OcAccordionItem.vue'
import OcVersionBanner from '../src/components/OcVersionBanner.vue'
import OcThemeToggle from '../src/components/OcThemeToggle.vue'
import OcNavmenu from '../src/components/OcNavmenu.vue'
import OcLiveFrame from '../src/components/OcLiveFrame.vue'
import OcBarcodeInput from '../src/components/OcBarcodeInput.vue'
import OcLazyImage from '../src/components/OcLazyImage.vue'
import OcPriceCard from '../src/components/OcPriceCard.vue'
import OcTintCard from '../src/components/OcTintCard.vue'

const tabs = [
  { label: 'All', value: 'all', icon: 'mdi:account-group-outline', count: 11 },
  { label: 'Customers', value: 'customers', count: 5, countTone: 'success' as const },
  { label: 'RAL palette', value: 'ral', disabled: true },
]

describe('tabs', () => {
  it('variant on the tab list, radio mode by default', () => {
    const w = mount(OcTabs, { props: { tabs: [{ label: 'A' }, { label: 'B' }], variant: 'pill', name: 't1' } })
    expect(w.find('.oc-tabset > .oc-tab-list.oc-tab-list--pill').exists()).toBe(true)
    expect(w.findAll('input[type=radio][name=t1]')).toHaveLength(2)
    expect((w.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('buttons mode: role=tab, aria-selected, .is-active panel, disabled, counts', async () => {
    const w = mount(OcTabs, {
      props: { tabs, mode: 'buttons', name: 'rel', listLabel: 'Relation type' },
      slots: { all: () => 'All relations', customers: () => 'Customer 1', ral: () => 'RAL' },
    })
    expect(w.find('.oc-tabset').exists()).toBe(false)
    const list = w.find('.oc-tab-list')
    expect(list.classes()).toContain('oc-data-table-tabs')
    expect(list.attributes('aria-label')).toBe('Relation type')
    const buttons = w.findAll('button[role=tab]')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].attributes('aria-selected')).toBe('true')
    expect(buttons[0].attributes('aria-controls')).toBe('rel-1')
    expect(buttons[1].find('.oc-data-table-tab-count.oc-data-table-tab-count--success').text()).toBe('5')
    expect(buttons[2].attributes('disabled')).toBeDefined()
    expect(w.find('#rel-1').classes()).toContain('is-active')
    await buttons[1].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['customers'])
    expect(w.find('#rel-2').classes()).toContain('is-active')
    expect(w.find('#rel-1').classes()).not.toContain('is-active')
    expect(w.find('#rel-2').text()).toBe('Customer 1')
  })
})

describe('card', () => {
  it('footer divider/end/class and bare content', () => {
    const w = mount(OcCard, {
      props: { footerDivider: true, footerEnd: true, footerClass: 'mt-2', bare: true },
      slots: { default: () => h('table', { class: 'oc-table' }), footer: () => 'Actions' },
    })
    expect(w.find('.oc-card-footer').classes()).toEqual(['oc-card-footer', 'oc-card-footer--divider', 'oc-card-footer--end', 'mt-2'])
    expect(w.find('.oc-card-content').exists()).toBe(false)
    expect(w.find('.oc-card > table.oc-table').exists()).toBe(true)
    const plain = mount(OcCard, { slots: { default: () => 'x' } })
    expect(plain.find('.oc-card-content').text()).toBe('x')
  })
})

describe('accordion', () => {
  it('multiple: no group name; flush', () => {
    const w = mount(OcAccordion, { props: { multiple: true, flush: true }, slots: { default: () => [h(OcAccordionItem, { title: 'A' }), h(OcAccordionItem, { title: 'B' })] } })
    expect(w.find('.oc-accordion').classes()).toContain('oc-accordion--flush')
    for (const d of w.findAll('details')) expect(d.attributes('name')).toBeUndefined()
    const g = mount(OcAccordion, { props: { name: 'faq' }, slots: { default: () => [h(OcAccordionItem, { title: 'A' })] } })
    expect(g.find('details').attributes('name')).toBe('faq')
  })
})

describe('version banner', () => {
  it('own href and no short text when empty', () => {
    const w = mount(OcVersionBanner, { props: { version: 'v0.6.0', href: '/changelog', short: '' } })
    expect(w.find('a.oc-version-banner-action').attributes('href')).toBe('/changelog')
    expect(w.find('.oc-version-banner-short').exists()).toBe(false)
  })
})

describe('theme toggle', () => {
  it('text: icon and the theme name, no tooltip', () => {
    const w = mount(OcThemeToggle, { props: { text: true, ghost: false, modelValue: 'light' } })
    const b = w.find('button')
    expect(b.classes()).toEqual(['oc-btn', 'oc-btn--outline'])
    expect(b.attributes('data-tooltip')).toBeUndefined()
    expect(b.text()).toContain('Dark theme')
  })
})

describe('navmenu', () => {
  it('site variant and group headings in a dropdown', () => {
    const w = mount(OcNavmenu, {
      props: {
        variant: 'site',
        items: [{ label: 'Docs', children: [{ group: 'Documents' }, { label: 'Invoices', href: '/invoices' }] }],
      },
    })
    expect(w.find('ul').classes()).toEqual(['oc-navmenu', 'oc-navmenu--site'])
    expect(w.find('.oc-dropdown-menu > .oc-dropdown-label').text()).toBe('Documents')
    expect(w.find('a.oc-dropdown-item').attributes('href')).toBe('/invoices')
  })
})

describe('live frame', () => {
  it('src and slot together', () => {
    const w = mount(OcLiveFrame, { props: { src: '/samples/company-1.html', static: true }, slots: { default: () => h('span', { class: 'oc-watermark' }, 'Concept') } })
    expect(w.find('iframe').exists()).toBe(true)
    expect(w.find('.oc-live-frame > .oc-watermark').exists()).toBe(true)
  })
})

describe('barcode input', () => {
  it('error text in the preview and no preview', async () => {
    const w = mount(OcBarcodeInput, { props: { modelValue: '54123', error: true, errorText: 'Use 8 or 13 digits' } })
    expect(w.find('.oc-barcode-preview').classes()).toContain('oc-barcode-preview--empty')
    expect(w.find('.oc-barcode-preview-code').text()).toBe('Use 8 or 13 digits')
    await w.setProps({ error: false })
    await nextTick()
    expect(w.find('.oc-barcode-preview-code').text()).toBe('54123')
    const bare = mount(OcBarcodeInput, { props: { hidePreview: true } })
    expect(bare.find('figure').exists()).toBe(false)
  })
})

describe('lazy image', () => {
  it('placeholder without src, thumb', () => {
    const w = mount(OcLazyImage, { props: { alt: 'Loading' } })
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('figure').attributes('role')).toBe('img')
    expect(w.find('figure').attributes('aria-label')).toBe('Loading')
    const t = mount(OcLazyImage, { props: { src: '/img/p1.svg', alt: '', thumb: true } })
    expect(t.find('figure').classes()).toEqual(['oc-lazy', 'oc-lazy--thumb'])
    expect(t.find('figure').attributes('role')).toBeUndefined()
  })
})

describe('price card', () => {
  it('group name and group label', () => {
    const w = mount(OcPriceCard, { props: { name: 'Starter', group: 'oc-price-starter', groupLabel: 'Billing period, Starter', monthly: { amount: '€5' }, yearly: { amount: '€50' } } })
    expect(w.find('.oc-price-card__toggle').attributes('aria-label')).toBe('Billing period, Starter')
    expect(w.findAll('input[name=oc-price-starter]')).toHaveLength(2)
  })
})

describe('tint card', () => {
  it('titleHref: a title link while the card is an article', () => {
    const w = mount(OcTintCard, { props: { title: 'Backup', titleHref: '#backup' } })
    expect(w.find('article.oc-tint-card').exists()).toBe(true)
    expect(w.find('.oc-tint-card__title > a.oc-tint-card__link').attributes('href')).toBe('#backup')
  })
})
