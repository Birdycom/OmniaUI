// File: packages/vue/tests/v0170.test.ts
// Map: language menu flags="auto" + languageFlag -> dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcLanguageMenu from '../src/components/OcLanguageMenu.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcSidebarMeta from '../src/components/OcSidebarMeta.vue'
import OcFormSection from '../src/components/OcFormSection.vue'
import OcOtpInput from '../src/components/OcOtpInput.vue'
import { languageFlag } from '../src/index'

describe('0.17.0 language menu', () => {
  it('languageFlag: region wins, else the usual country', () => {
    expect(languageFlag('en')).toBe('flag:gb-4x3')
    expect(languageFlag('pt-BR')).toBe('flag:br-4x3')
    expect(languageFlag('fil')).toBeUndefined()
  })

  it('flags="auto" draws a flag from the code; own flag and flagFor win', () => {
    const options = [{ value: 'en', label: 'English' }, { value: 'nl-BE', label: 'Vlaams' }, { value: 'fr', label: 'Français', flag: 'flag:be-4x3' }, { value: 'de', label: 'Deutsch' }]
    const w = mount(OcLanguageMenu, { props: { options, modelValue: 'en', flags: 'auto', flagFor: (v: string) => (v === 'de' ? 'flag:it-4x3' : undefined) } })
    const names = w.findAll('.oc-language-flag svg').map((f) => f.attributes('data-webicon'))
    expect(names).toEqual(['flag:gb-4x3', 'flag:gb-4x3', 'flag:be-4x3', 'flag:be-4x3', 'flag:it-4x3'])
  })
})

describe('0.17.0 dropdown item', () => {
  it('description makes a two-line item; icon-tone a tinted icon square', () => {
    const w = mount(OcDropdownItem, { props: { icon: 'mdi:check', iconTone: 'warning', description: 'Second line' }, slots: { default: 'Label' } })
    expect(w.find('.oc-dropdown-icon').classes()).toEqual(['oc-dropdown-icon', 'oc-dropdown-icon--warning'])
    expect(w.find('.oc-dropdown-text > span').text()).toBe('Label')
    expect(w.find('.oc-dropdown-desc').text()).toBe('Second line')
    expect(mount(OcDropdownItem, { slots: { default: 'Edit' } }).find('.oc-dropdown-text').exists()).toBe(false)
  })
})

describe('0.17.0 sidebar meta', () => {
  it('wrap and collapsed add their modifiers', () => {
    expect(mount(OcSidebarMeta, { props: { wrap: true, version: '1' } }).classes()).toContain('oc-sidebar-meta--wrap')
    expect(mount(OcSidebarMeta, { props: { collapsed: true, version: '1' } }).classes()).toContain('oc-sidebar-meta--collapsed')
  })
})

describe('0.17.0 form section', () => {
  it('invalid sets data-issue, issues shows a labelled count', () => {
    const w = mount(OcFormSection, { props: { title: 'Location', invalid: 'warning', issues: 3 } })
    expect(w.attributes('data-issue')).toBe('warning')
    expect(w.find('.oc-form-section__count').attributes('aria-label')).toBe('3 warnings')
  })
})

describe('0.17.0 otp input', () => {
  it('fit and group add their classes and the group size', () => {
    const w = mount(OcOtpInput, { props: { length: 8, fit: true, group: 4 } })
    expect(w.classes()).toEqual(['oc-otp', 'oc-otp--fit', 'oc-otp--group'])
    expect(w.attributes('style')).toContain('--oc-otp-group: 4')
  })
})
