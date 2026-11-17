// File: packages/vue/tests/v0160-components.test.ts
// Map: combobox with icons -> dropdown item icon -> language menu -> sheet options -> plain collapsible -> live frame
//      (inert, device, frame-load, exposed frame) -> logo -> mode badge -> code plate -> card accent + band -> sidebar meta

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import OcCombobox from '../src/components/OcCombobox.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcLanguageMenu from '../src/components/OcLanguageMenu.vue'
import OcSheet from '../src/components/OcSheet.vue'
import OcCollapsible from '../src/components/OcCollapsible.vue'
import OcLiveFrame from '../src/components/OcLiveFrame.vue'
import OcLogo from '../src/components/OcLogo.vue'
import OcModeBadge from '../src/components/OcModeBadge.vue'
import OcCodePlate from '../src/components/OcCodePlate.vue'
import OcCard from '../src/components/OcCard.vue'
import OcCardBand from '../src/components/OcCardBand.vue'
import OcSidebarMeta from '../src/components/OcSidebarMeta.vue'

const methods = [
  { value: 'transfer', label: 'Bank transfer', icon: 'mdi:bank-outline' },
  { value: 'card', label: 'Credit card', icon: 'mdi:credit-card-outline' },
  { value: 'voucher', label: 'Voucher', icon: 'mdi:ticket-percent-outline', disabled: true },
  { value: 'other', label: 'Other' },
]

describe('v0.16.0 combobox with icons', () => {
  it('icons per option and the chosen icon in the field', () => {
    const w = mount(OcCombobox, { props: { options: methods, modelValue: 'card', label: 'Payment method' } })
    expect(w.findAll('.oc-combobox-option-icon')).toHaveLength(3)
    expect(w.find('.oc-combobox-icon iconify-icon').attributes('icon')).toBe('mdi:credit-card-outline')
    expect((w.find('.oc-combobox-input').element as HTMLInputElement).value).toBe('Credit card')
    expect(w.find('[aria-selected="true"]').text()).toBe('Credit card')
  })

  it('filters, moves over disabled options and chooses with Enter', async () => {
    const w = mount(OcCombobox, { props: { options: methods, name: 'payment', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    const input = w.find('.oc-combobox-input')
    await input.trigger('focus')
    await input.setValue('card')
    expect(w.findAll('.oc-combobox-option').map((o) => o.text())).toEqual(['Credit card'])
    await input.setValue('')
    expect(w.find('[data-active]').text()).toBe('Bank transfer')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(w.find('[data-active]').text()).toBe('Other')
    expect(input.attributes('aria-activedescendant')).toBe(w.find('[data-active]').attributes('id'))
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['other'])
    expect((w.find('input[type="hidden"]').element as HTMLInputElement).value).toBe('other')
    expect(w.find('.oc-combobox').attributes('data-open')).toBe('false')
  })
})

describe('v0.16.0 dropdown item icon', () => {
  it('a webicon before the label', () => {
    const w = mount(OcDropdownItem, { props: { icon: 'mdi:pencil-outline' }, slots: { default: 'Edit' } })
    expect(w.find('.oc-dropdown-icon iconify-icon').attributes('icon')).toBe('mdi:pencil-outline')
    expect(mount(OcDropdownItem, { slots: { default: 'Paid' } }).find('.oc-dropdown-icon').exists()).toBe(false)
  })
})

describe('v0.16.0 language menu', () => {
  const langs = [
    { value: 'en', label: 'English', flag: 'flag:gb-4x3', href: '/en/' },
    { value: 'nl', label: 'Nederlands', flag: 'flag:nl-4x3' },
  ]
  it('trigger with flag and code; menu with lang, hreflang, codes and the current one', () => {
    const w = mount(OcLanguageMenu, { props: { options: langs, modelValue: 'nl', ghost: true } })
    const btn = w.find('button.oc-language-select')
    const menu = w.find('.oc-dropdown-menu.oc-language-menu')
    expect(btn.classes()).toContain('oc-language-select--ghost')
    expect(btn.attributes('popovertarget')).toBe(menu.attributes('id'))
    expect(btn.attributes('aria-label')).toBe('Language: Nederlands')
    expect(btn.find('.oc-language-select-code').text()).toBe('NL')
    expect(menu.attributes('popover')).toBeDefined()
    const items = menu.findAll('.oc-dropdown-item')
    expect(items[0].element.tagName).toBe('A')
    expect(items[0].attributes('hreflang')).toBe('en')
    expect(items[1].element.tagName).toBe('BUTTON')
    expect(items[1].attributes('aria-current')).toBe('true')
    expect(items.map((i) => i.find('.oc-language-menu-code').text())).toEqual(['EN', 'NL'])
  })
  it('compact with tooltip; a click sets v-model', async () => {
    const w = mount(OcLanguageMenu, { props: { options: langs.map(({ href, ...l }) => l), modelValue: 'en', compact: true, label: 'Taal' } })
    const btn = w.find('button.oc-language-select')
    expect(btn.classes()).toEqual(expect.arrayContaining(['oc-language-select--icon', 'oc-tooltip', 'oc-tooltip--bottom']))
    expect(btn.attributes('data-tooltip')).toBe('Taal: English')
    await w.find('[lang="nl"]').trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['nl'])
  })
})

describe('v0.16.0 sheet, collapsible, live frame', () => {
  it('sheet glass, inset, footer panel', () => {
    const w = mount(OcSheet, { props: { glass: true, inset: true, footerPanel: true }, slots: { default: 'Body', footer: 'App 1' } })
    expect(w.find('dialog').classes()).toEqual(['oc-sheet', 'oc-sheet--glass', 'oc-sheet--inset'])
    expect(w.find('.oc-sheet-footer').classes()).toEqual(['oc-sheet-footer', 'oc-sheet-footer--panel'])
  })
  it('plain collapsible', () => {
    expect(mount(OcCollapsible, { props: { title: 'Help', plain: true } }).find('details').classes()).toEqual(['oc-collapsible', 'oc-collapsible--plain'])
  })
  it('live frame: inert, phone size, frame-load, exposed frame', async () => {
    const w = mount(OcLiveFrame, { props: { src: '/preview', device: 'phone', inert: true } })
    const box = w.find('.oc-live-frame')
    expect(box.classes()).toContain('oc-live-frame--phone')
    expect((box.element as HTMLElement).style.getPropertyValue('--oc-live-w')).toBe('390')
    const frame = w.find('iframe')
    expect(frame.attributes('inert')).toBeDefined()
    expect(frame.attributes('aria-hidden')).toBe('true')
    expect(frame.attributes('tabindex')).toBe('-1')
    await frame.trigger('load')
    expect(w.emitted('frame-load')).toHaveLength(1)
    expect((w.vm as unknown as { frame: HTMLIFrameElement }).frame).toBe(frame.element)
    expect(mount(OcLiveFrame, { props: { src: '/x' } }).find('iframe').attributes('inert')).toBeUndefined()
  })
})

describe('v0.16.0 logo, mode badge, code plate, card accent, sidebar meta', () => {
  it('logo with a set plate and the box fit', () => {
    const w = mount(OcLogo, { props: { src: '/logo.svg', alt: 'Company 1', plate: 'dark', fit: 'box', height: '2rem' } })
    expect(w.classes()).toEqual(['oc-logo', 'oc-logo--box'])
    expect(w.attributes('data-plate')).toBe('dark')
    expect((w.element as HTMLElement).style.getPropertyValue('--oc-logo-h')).toBe('2rem')
    expect(w.find('img').attributes('alt')).toBe('Company 1')
  })
  it('mode badge', () => {
    const b = mount(OcModeBadge, { props: { mode: 'both', size: 'sm' } })
    expect(b.classes()).toEqual(['oc-mode-badge', 'oc-mode-badge--sm'])
    expect(b.findAll('span > span').map((s) => s.text())).toEqual(['Test', 'Live'])
    expect(mount(OcModeBadge, { props: { mode: 'live' } }).text()).toBe('Live')
  })
  it('code plate', () => {
    const w = mount(OcCodePlate, { props: { mode: 'test', caption: 'Test' }, slots: { default: () => h('img', { alt: 'QR', src: '/qr.svg' }) } })
    expect(w.attributes('data-mode')).toBe('test')
    expect(w.element.firstElementChild!.tagName).toBe('IMG')
    expect(w.find('figcaption.oc-code-plate__caption').text()).toBe('Test')
  })
  it('card accent with band; not inactive by default', () => {
    const w = mount(OcCard, { props: { accent: 'live' }, slots: { band: () => h(OcCardBand, { title: 'Live round', description: 'On the day' }), default: 'Body' } })
    expect(w.classes()).toEqual(['oc-card', 'oc-card--accent'])
    expect(w.attributes('data-tone')).toBe('live')
    expect(w.attributes('data-active')).toBeUndefined()
    expect(w.element.firstElementChild!.className).toBe('oc-card-band')
    expect(w.find('.oc-card-band__title small').text()).toBe('On the day')
    expect(mount(OcCard, { props: { accent: 'test', inactive: true } }).attributes('data-active')).toBe('false')
  })
  it('sidebar meta', () => {
    const w = mount(OcSidebarMeta, { props: { brand: 'App 1', version: '2.4.0', copyright: '© 2026 Company 1' } })
    expect(w.attributes('data-tooltip')).toBe('App 1 2.4.0 · © 2026 Company 1')
    expect(w.findAll('span').map((s) => s.classes()[0])).toEqual(['oc-sidebar-meta__brand', 'oc-sidebar-meta__version', 'oc-sidebar-meta__copy'])
  })
})
