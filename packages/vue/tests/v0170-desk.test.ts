// File: packages/vue/tests/v0170-desk.test.ts
// Map: OcBackLink fallbackHref/fallbackLabel (history.back() within the site, else the fallback) -> OcBadge icon + title ->
//      OcButton iconStart/iconEnd + as/is -> OcRadioGroup error -> OcFormSection dense + defaultOpen -> OcLauncherCard disabledFooter

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import OcBackLink from '../src/components/OcBackLink.vue'
import OcBadge from '../src/components/OcBadge.vue'
import OcButton from '../src/components/OcButton.vue'
import OcRadio from '../src/components/OcRadio.vue'
import OcRadioGroup from '../src/components/OcRadioGroup.vue'
import OcFormSection from '../src/components/OcFormSection.vue'
import OcLauncherCard from '../src/components/OcLauncherCard.vue'
import { registerWebicons } from '../src/index'

registerWebicons({
  prefix: 'mdi',
  width: 24,
  height: 24,
  icons: { check: { body: '<path d="M9 16l-4-4l1.4-1.4L9 13.2l7.6-7.6L18 7z"/>' }, plus: { body: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>' } },
})

function history(length: number, referrer = '') {
  Object.defineProperty(window.history, 'length', { configurable: true, get: () => length })
  Object.defineProperty(document, 'referrer', { configurable: true, get: () => referrer })
}
// jsdom cannot navigate: stop every link click that reaches the document (after the component had its turn).
const noNavigation = (e: Event) => e.preventDefault()
beforeEach(() => document.addEventListener('click', noNavigation))
afterEach(() => {
  document.removeEventListener('click', noNavigation)
  delete (window.history as unknown as Record<string, unknown>).length
  delete (document as unknown as Record<string, unknown>).referrer
  vi.restoreAllMocks()
})

describe('0.17.0 back link with a fallback', () => {
  it('without fallbackHref it stays a plain link', async () => {
    history(3, `${location.origin}/products`)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const w = mount(OcBackLink, { props: { href: '/products' }, slots: { default: 'Back to Products' }, attachTo: document.body })
    expect(w.html()).toBe('<a class="oc-back-link" href="/products">Back to Products</a>')
    await w.trigger('click')
    expect(back).not.toHaveBeenCalled()
    w.unmount()
  })

  it('goes back in the history when the visitor came from this site', async () => {
    history(1, `${location.origin}/products?page=2`)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const w = mount(OcBackLink, { props: { fallbackHref: '/products', fallbackLabel: 'Back to Products' }, slots: { default: 'Back' }, attachTo: document.body })
    await nextTick()
    expect(w.attributes('href')).toBe('/products')
    expect(w.text()).toBe('Back')
    await w.trigger('click')
    expect(back).toHaveBeenCalledTimes(1)
    await w.trigger('click', { ctrlKey: true })
    expect(back).toHaveBeenCalledTimes(1)
    w.unmount()
  })

  it('follows the fallback with its label when there is nothing to go back to', async () => {
    history(1, 'https://elsewhere.example/page')
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const w = mount(OcBackLink, { props: { fallbackHref: '/products', fallbackLabel: 'Back to Products' }, slots: { default: 'Back' }, attachTo: document.body })
    await nextTick()
    expect(w.text()).toBe('Back to Products')
    await w.trigger('click')
    expect(back).not.toHaveBeenCalled()
    w.unmount()
  })
})

describe('0.17.0 badge icon and title', () => {
  it('draws a webicon before the text with the title as tooltip', () => {
    const w = mount(OcBadge, { props: { variant: 'success', icon: 'mdi:check', title: 'Paid on 1 March' }, slots: { default: 'Paid' } })
    expect(w.classes()).toEqual(['oc-badge', 'oc-badge--success'])
    expect(w.attributes('title')).toBe('Paid on 1 March')
    expect(w.attributes('role')).toBeUndefined()
    expect(w.find('svg').attributes('data-webicon')).toBe('mdi:check')
    expect(w.text()).toBe('Paid')
  })

  it('an icon-only badge gets its name from the title', () => {
    const w = mount(OcBadge, { props: { icon: 'mdi:check', title: 'Verified' } })
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Verified')
  })

  it('without icon and title it is the plain badge', () => {
    const w = mount(OcBadge, { slots: { default: 'New' } })
    expect(w.attributes()).toEqual({ class: 'oc-badge' })
    expect(w.text()).toBe('New')
  })
})

describe('0.17.0 button icons and as', () => {
  it('boolean icon still makes the square icon button', () => {
    const w = mount(OcButton, { props: { icon: true }, attrs: { 'aria-label': 'Add' }, slots: { default: '+' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.classes()).toEqual(['oc-btn', 'oc-btn--icon'])
    expect(w.attributes('type')).toBe('button')
  })

  it('iconStart and iconEnd put webicons around the label', () => {
    const w = mount(OcButton, { props: { iconStart: 'mdi:plus', iconEnd: 'mdi:check' }, slots: { default: 'New customer' } })
    const icons = w.findAll('svg').map((s) => s.attributes('data-webicon'))
    expect(icons).toEqual(['mdi:plus', 'mdi:check'])
    expect(w.element.firstElementChild?.getAttribute('data-webicon')).toBe('mdi:plus')
    expect(w.element.lastElementChild?.getAttribute('data-webicon')).toBe('mdi:check')
    expect(w.text()).toBe('New customer')
  })

  it('as renders another tag with the button classes', () => {
    const w = mount(OcButton, { props: { as: 'span', variant: 'secondary', disabled: true }, slots: { default: 'Label' } })
    expect(w.element.tagName).toBe('SPAN')
    expect(w.classes()).toEqual(['oc-btn', 'oc-btn--secondary'])
    expect(w.attributes('type')).toBeUndefined()
    expect(w.attributes('disabled')).toBeUndefined()
    expect(w.attributes('aria-disabled')).toBe('true')
  })

  it('is works as an alias, and a component gets the other attributes', () => {
    const RouterLink = markRaw(defineComponent({ props: { to: String }, setup: (p, { slots }) => () => h('a', { href: p.to, 'data-router': '' }, slots.default?.()) }))
    const w = mount(OcButton, { props: { is: RouterLink }, attrs: { to: '/orders' }, slots: { default: 'Orders' } })
    expect(w.find('a[data-router]').attributes('href')).toBe('/orders')
    expect(w.find('a').classes()).toContain('oc-btn')
  })

  it('href still renders a plain link', () => {
    const w = mount(OcButton, { props: { href: '/x', iconEnd: 'mdi:check' }, slots: { default: 'Next' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('/x')
    expect(w.attributes('aria-disabled')).toBeUndefined()
  })
})

describe('0.17.0 radio group error', () => {
  it('shows the message and links every radio to it', () => {
    const w = mount(OcRadioGroup, {
      props: { name: 'plan', legend: 'Plan', error: 'Choose a plan', options: [{ value: 'a', label: 'Basic' }, { value: 'b', label: 'Team' }] },
    })
    const err = w.find('p.oc-field-error')
    expect(err.attributes('id')).toBe('plan-error')
    expect(err.attributes('role')).toBe('alert')
    expect(err.text()).toBe('Choose a plan')
    const radios = w.findAll('input.oc-radio')
    expect(radios).toHaveLength(2)
    for (const r of radios) {
      expect(r.attributes('aria-invalid')).toBe('true')
      expect(r.attributes('aria-describedby')).toBe('plan-error')
    }
  })

  it('without error nothing changes', () => {
    const w = mount(OcRadioGroup, { props: { name: 'size' }, slots: { default: () => h(OcRadio, { value: 's' }, () => 'S') } })
    expect(w.find('.oc-field-error').exists()).toBe(false)
    expect(w.find('input').attributes('aria-invalid')).toBeUndefined()
    expect(w.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})

describe('0.17.0 form section dense and defaultOpen', () => {
  it('dense adds the modifier, defaultOpen opens it', () => {
    const w = mount(OcFormSection, { props: { title: 'Address', dense: true, defaultOpen: true } })
    expect(w.classes()).toEqual(['oc-form-section', 'oc-form-section--dense'])
    expect((w.element as HTMLDetailsElement).open).toBe(true)
  })

  it('without the props it stays closed and plain', () => {
    const w = mount(OcFormSection, { props: { title: 'Address' } })
    expect(w.classes()).toEqual(['oc-form-section'])
    expect((w.element as HTMLDetailsElement).open).toBe(false)
  })
})

describe('0.17.0 launcher card disabledFooter', () => {
  it('shows the disabled footer only while disabled', async () => {
    const w = mount(OcLauncherCard, { props: { title: 'Invoices', footer: '12 open', disabledFooter: 'Ask your admin for access', disabled: true } })
    expect(w.element.tagName).toBe('SPAN')
    expect(w.find('.oc-launcher-footer').text()).toBe('Ask your admin for access')
    await w.setProps({ disabled: false, href: '/invoices' })
    expect(w.find('.oc-launcher-footer').text()).toBe('12 open')
  })

  it('the disabled-footer slot works too', () => {
    const w = mount(OcLauncherCard, { props: { title: 'Invoices', disabled: true }, slots: { 'disabled-footer': 'Not in your plan' } })
    expect(w.find('.oc-launcher-footer').text()).toBe('Not in your plan')
  })
})
