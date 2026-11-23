// File: packages/vue/tests/v0170-r3a.test.ts
// Map: dropdown toggle mode -> dropdown item extras + sub-menu -> accordion script mode -> card action/text + link + grid -> webicons
// 0.17.0 (round 3, A): the last plain markup of the docs as components.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcDropdown from '../src/components/OcDropdown.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcDropdownSub from '../src/components/OcDropdownSub.vue'
import OcAccordion from '../src/components/OcAccordion.vue'
import OcAccordionItem from '../src/components/OcAccordionItem.vue'
import OcCard from '../src/components/OcCard.vue'
import OcCardLink from '../src/components/OcCardLink.vue'
import OcCardGrid from '../src/components/OcCardGrid.vue'
import OcDatePicker from '../src/components/OcDatePicker.vue'
import OcSearch from '../src/components/OcSearch.vue'

describe('OcDropdown toggle mode', () => {
  it('renders .oc-dropdown without popover, toggles .is-open and closes on an item click', async () => {
    const w = mount(OcDropdown, { props: { mode: 'toggle', label: 'Options' }, attrs: { id: 'm1' }, slots: { default: () => h(OcDropdownItem, null, () => 'Profile') }, attachTo: document.body })
    const menu = w.get('.oc-dropdown-menu')
    expect(menu.attributes('popover')).toBeUndefined()
    expect(menu.attributes('id')).toBe('m1')
    const btn = w.get('button.oc-btn')
    expect(btn.attributes('aria-expanded')).toBe('false')
    expect(btn.attributes('aria-controls')).toBe('m1')
    await btn.trigger('click')
    expect(w.get('.oc-dropdown').classes()).toEqual(['oc-dropdown', 'is-open'])
    expect(w.emitted('update:open')![0]).toEqual([true])
    await w.get('.oc-dropdown-item').trigger('click')
    expect(w.get('.oc-dropdown').classes()).toEqual(['oc-dropdown'])
    w.unmount()
  })

  it('closes on Esc and an outside click', async () => {
    const w = mount(OcDropdown, { props: { mode: 'toggle' as const, label: 'Options', open: true, 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) }, attachTo: document.body })
    expect(w.get('.oc-dropdown').classes()).toContain('is-open')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(w.get('.oc-dropdown').classes()).not.toContain('is-open')
    await w.get('button.oc-btn').trigger('click')
    expect(w.get('.oc-dropdown').classes()).toContain('is-open')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(w.get('.oc-dropdown').classes()).not.toContain('is-open')
    w.unmount()
  })

  it('keeps the popover version by default', () => {
    const w = mount(OcDropdown, { props: { label: 'Options' }, attrs: { id: 'm2' } })
    expect(w.find('.oc-dropdown').exists()).toBe(false)
    expect(w.get('.oc-dropdown-menu').attributes('popover')).toBe('')
    expect(w.get('button').attributes('popovertarget')).toBe('m2')
  })
})

describe('OcDropdownItem extras and OcDropdownSub', () => {
  it('destructive, radio and a sub-menu', () => {
    const w = mount(OcDropdown, {
      props: { label: 'Menu' },
      slots: {
        default: () => [
          h(OcDropdownItem, { checked: true, radio: true }, () => 'Top'),
          h(OcDropdownItem, { destructive: true }, () => 'Delete'),
          h(OcDropdownSub, { label: 'More tools', icon: 'mdi:magnify' }, () => h(OcDropdownItem, null, () => 'Developer tools')),
        ],
      },
    })
    const items = w.findAll('.oc-dropdown-menu > .oc-dropdown-item')
    expect(items[0].attributes('role')).toBe('menuitemradio')
    expect(items[0].attributes('aria-checked')).toBe('true')
    expect(items[1].classes()).toEqual(['oc-dropdown-item', 'oc-dropdown-item--destructive'])
    const trigger = w.get('.oc-dropdown-sub > button')
    expect(trigger.classes()).toEqual(['oc-dropdown-item'])
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.text()).toBe('More tools')
    expect(trigger.find('.oc-dropdown-icon svg[data-webicon="mdi:magnify"]').exists()).toBe(true)
    expect(w.get('.oc-dropdown-sub > .oc-dropdown-submenu').attributes('role')).toBe('menu')
    expect(w.get('.oc-dropdown-submenu').text()).toBe('Developer tools')
  })
})

describe('OcAccordionItem script mode', () => {
  it('renders div + button with .is-open and v-model:expanded', async () => {
    const Demo = defineComponent({
      setup() {
        const open = ref<number | null>(0)
        return () =>
          h(OcAccordion, null, () => [
            h(OcAccordionItem, { title: 'One', expanded: open.value === 0, 'onUpdate:expanded': (v?: boolean) => (open.value = v ? 0 : null) }, () => 'A'),
            h(OcAccordionItem, { title: 'Two', expanded: false, disabled: true }, () => 'B'),
            h(OcAccordionItem, { title: 'Three', expanded: open.value === 2, 'onUpdate:expanded': (v?: boolean) => (open.value = v ? 2 : null) }, () => 'C'),
          ])
      },
    })
    const w = mount(Demo)
    expect(w.find('details').exists()).toBe(false)
    const items = w.findAll('div.oc-accordion-item')
    expect(items).toHaveLength(3)
    expect(items[0].classes()).toEqual(['oc-accordion-item', 'is-open'])
    const triggers = w.findAll('button.oc-accordion-trigger')
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('disabled')).toBeDefined()
    expect(triggers[1].attributes('aria-expanded')).toBeUndefined()
    await triggers[2].trigger('click')
    expect(w.findAll('div.oc-accordion-item')[0].classes()).toEqual(['oc-accordion-item'])
    expect(w.findAll('div.oc-accordion-item')[2].classes()).toEqual(['oc-accordion-item', 'is-open'])
  })

  it('stays a details element without expanded', () => {
    const w = mount(OcAccordionItem, { props: { title: 'One' } })
    expect(w.element.tagName).toBe('DETAILS')
  })
})

describe('OcCard action and text, OcCardLink, OcCardGrid', () => {
  it('action slot in the header and text before the content', () => {
    const w = mount(OcCard, { props: { title: 'Team', text: 'Two seats left.' }, slots: { action: () => '3 / 5', footer: () => h(OcCardLink, { href: '/members' }, () => 'Manage members') } })
    expect(w.get('.oc-card-header > .oc-card-action').text()).toBe('3 / 5')
    expect(w.get('.oc-card-content > p.oc-card-text').text()).toBe('Two seats left.')
    expect(w.get('.oc-card-footer > a.oc-card-link').attributes('href')).toBe('/members')
  })

  it('a card with only the action slot still gets a header', () => {
    const w = mount(OcCard, { slots: { action: () => 'x' } })
    expect(w.get('.oc-card-header > .oc-card-action').text()).toBe('x')
    expect(w.find('.oc-card-content').exists()).toBe(false)
  })

  it('grid classes and custom properties', () => {
    const w = mount(OcCardGrid, { props: { bands: true, fit: true, min: 15, gap: '1rem' } })
    expect(w.classes()).toEqual(['oc-card-grid', 'oc-card-grid--bands', 'oc-card-grid--fit'])
    expect(w.attributes('style')).toContain('--oc-card-min: 15rem')
    expect(w.attributes('style')).toContain('--oc-card-gap: 1rem')
    const plain = mount(OcCardGrid, { props: { wide: true } })
    expect(plain.classes()).toEqual(['oc-card-grid', 'oc-card-grid--wide'])
    expect(plain.attributes('style')).toBeUndefined()
  })
})

describe('Built-in webicons in OcDatePicker and OcSearch', () => {
  it('date picker draws mdi:calendar', () => {
    const w = mount(OcDatePicker)
    const svg = w.get('button.oc-date-picker-trigger > svg')
    expect(svg.attributes('data-webicon')).toBe('mdi:calendar')
    expect(svg.classes()).toEqual(['oc-icon', 'oc-icon--sm'])
  })

  it('search draws mdi:magnify', () => {
    const w = mount(OcSearch, { props: { placeholder: 'Search' } })
    const svg = w.get('label.oc-search > svg')
    expect(svg.attributes('data-webicon')).toBe('mdi:magnify')
    expect(svg.classes()).toEqual(['oc-search-icon'])
  })
})
