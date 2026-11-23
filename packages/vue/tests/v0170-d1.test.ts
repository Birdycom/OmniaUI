// File: packages/vue/tests/v0170-d1.test.ts
// Map: module prop -> data-module (OcBadge, OcButton, OcLauncherCard, OcFormSection, OcBlockModuleHeader) -> OcBadge variant
//      module -> OcButton float (particles, data-float-icon, mask of a registered webicon) -> OcBlockModuleHeader eyebrow + fixedHeight

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcBadge from '../src/components/OcBadge.vue'
import OcButton from '../src/components/OcButton.vue'
import OcFormSection from '../src/components/OcFormSection.vue'
import OcLauncherCard from '../src/components/OcLauncherCard.vue'
import OcBlockModuleHeader from '../src/blocks/OcBlockModuleHeader.vue'
import { registerWebicons } from '../src/webicons'

registerWebicons({
  prefix: 'mdi',
  width: 24,
  height: 24,
  icons: { 'thumb-up': { body: '<path d="M1 21h4V9H1zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57z"/>' } },
})

describe('0.17.0 module prop', () => {
  it('sets data-module on the root', () => {
    expect(mount(OcBadge, { props: { module: 'green' }, slots: { default: 'Paid' } }).attributes('data-module')).toBe('green')
    expect(mount(OcButton, { props: { module: 'blue' }, slots: { default: 'Save' } }).attributes('data-module')).toBe('blue')
    expect(mount(OcButton, { props: { module: 'red', href: '/x' }, slots: { default: 'Open' } }).attributes('data-module')).toBe('red')
    expect(mount(OcLauncherCard, { props: { module: 'purple', href: '/c', title: 'Contacts' } }).attributes('data-module')).toBe('purple')
    expect(mount(OcFormSection, { props: { module: 'teal', title: 'Address' } }).attributes('data-module')).toBe('teal')
    expect(mount(OcBlockModuleHeader, { props: { module: 'orange', title: 'Contacts' } }).attributes('data-module')).toBe('orange')
  })

  it('adds nothing without the prop', () => {
    const btn = mount(OcButton, { slots: { default: 'Save' } })
    expect(btn.attributes('data-module')).toBeUndefined()
    expect(btn.find('.oc-btn-float').exists()).toBe(false)
    expect(btn.classes()).toEqual(['oc-btn'])
    expect(mount(OcBadge, { slots: { default: 'New' } }).attributes('data-module')).toBeUndefined()
    expect(mount(OcBlockModuleHeader, { props: { title: 'C' } }).attributes('data-module')).toBeUndefined()
  })

  it('OcBadge variant module', () => {
    expect(mount(OcBadge, { props: { variant: 'module' }, slots: { default: 'Sales' } }).classes()).toEqual(['oc-badge', 'oc-badge--module'])
  })
})

describe('0.17.0 floating button', () => {
  it('hearts: class, data-float-icon and five hidden particles', () => {
    const w = mount(OcButton, { props: { float: 'hearts' }, slots: { default: 'Donate' } })
    expect(w.classes()).toContain('oc-btn--float')
    expect(w.attributes('data-float-icon')).toBe('mdi:heart')
    const layer = w.find('.oc-btn-float')
    expect(layer.attributes('aria-hidden')).toBe('true')
    expect(layer.findAll('i')).toHaveLength(5)
    expect(w.text()).toBe('Donate')
    expect(w.attributes('style')).toBeUndefined()
  })

  it('a registered webicon becomes a data-URI mask; mdi:star stays built in', () => {
    const like = mount(OcButton, { props: { float: 'mdi:thumb-up' }, slots: { default: 'Like' } })
    const mask = (like.element as HTMLElement).style.getPropertyValue('--oc-btn-float-icon')
    expect(mask.startsWith('url("data:image/svg+xml,%3Csvg')).toBe(true)
    const star = mount(OcButton, { props: { float: 'mdi:star', module: 'gold' }, slots: { default: 'Star' } })
    expect(star.attributes('data-float-icon')).toBe('mdi:star')
    expect(star.attributes('data-module')).toBe('gold')
    expect((star.element as HTMLElement).style.getPropertyValue('--oc-btn-float-icon')).toBe('')
  })
})

describe('0.17.0 module header', () => {
  it('eyebrow (prop or slot) above the title and fixed height', () => {
    const w = mount(OcBlockModuleHeader, { props: { title: 'Invoices', eyebrow: 'Sales', fixedHeight: true } })
    expect(w.classes()).toEqual(['oc-block-modulehead', 'oc-block-modulehead--fixed'])
    const eyebrow = w.find('p.oc-block-modulehead-eyebrow')
    expect(eyebrow.text()).toBe('Sales')
    expect(eyebrow.element.nextElementSibling?.className).toBe('oc-block-modulehead-title')
    const slot = mount(OcBlockModuleHeader, { props: { title: 'Invoices' }, slots: { eyebrow: 'Finance' } })
    expect(slot.find('.oc-block-modulehead-eyebrow').text()).toBe('Finance')
    expect(mount(OcBlockModuleHeader, { props: { title: 'X' } }).find('.oc-block-modulehead-eyebrow').exists()).toBe(false)
  })
})
