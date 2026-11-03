// File: packages/vue/tests/v0140.test.ts
// Map: OcMeterRow (sub-line) -> OcReading -> OcCallout -> OcMenuStatic + OcDropdownItem (check, hint) -> OcLanguageSelect (code)
//      -> OcGroup -> OcButton (neon) -> OcParticleField

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import OcButton from '../src/components/OcButton.vue'
import OcCallout from '../src/components/OcCallout.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'
import OcGroup from '../src/components/OcGroup.vue'
import OcLanguageSelect from '../src/components/OcLanguageSelect.vue'
import OcMenuStatic from '../src/components/OcMenuStatic.vue'
import OcMeterRow from '../src/components/OcMeterRow.vue'
import OcParticleField from '../src/components/OcParticleField.vue'
import OcReading from '../src/components/OcReading.vue'

// jsdom has no canvas: the particle field then simply draws nothing.
beforeAll(() => { vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null) })

describe('v0.14.0 components', () => {
  it('meter row draws a sub-line with its own thin bar', () => {
    const w = mount(OcMeterRow, { props: { label: 'GPU', percent: 40, sub: 'VRAM 2.7 / 8.0 GB', subPercent: 34, subLevel: 'warn' } })
    expect(w.find('.oc-meter-row__sub').text()).toBe('VRAM 2.7 / 8.0 GB')
    const bar = w.find('.oc-meter-row__subbar')
    expect(bar.attributes('style')).toContain('--oc-meter: 34%')
    expect(bar.attributes('data-level')).toBe('warn')
  })

  it('reading takes its level as a modifier', () => {
    expect(mount(OcReading, { slots: { default: '41 °C' } }).classes()).toEqual(['oc-reading'])
    expect(mount(OcReading, { props: { level: 'hot' }, slots: { default: '88 °C' } }).classes()).toEqual(['oc-reading', 'oc-reading--hot'])
  })

  it('callout puts the text and the action side by side', () => {
    const w = mount(OcCallout, { slots: { default: 'Like the app?', action: '<button class="oc-btn">Support</button>' } })
    expect(w.find('.oc-callout__text').text()).toBe('Like the app?')
    expect(w.find('.oc-callout__action .oc-btn').exists()).toBe(true)
  })

  it('static menu items get a check column and a hint', () => {
    const w = mount(OcMenuStatic, {
      props: { flat: true },
      slots: { default: () => [h(OcDropdownItem, { checked: true, hint: 'Ctrl+T' }, () => 'Always on top'), h(OcDropdownItem, null, () => 'Quit')] },
    })
    expect(w.classes()).toEqual(['oc-dropdown-menu', 'oc-dropdown-menu--static', 'oc-dropdown-menu--flat'])
    const [on, quit] = w.findAll('.oc-dropdown-item')
    expect(on.attributes('role')).toBe('menuitemcheckbox')
    expect(on.attributes('aria-checked')).toBe('true')
    expect(on.find('.oc-dropdown-hint').text()).toBe('Ctrl+T')
    expect(quit.attributes('role')).toBeUndefined()
    expect(quit.find('.oc-dropdown-check').exists()).toBe(false)
  })

  it('language select shows only the code', () => {
    const w = mount(OcLanguageSelect, { props: { code: true, modelValue: 'en', options: [{ value: 'nl', label: 'Nederlands' }, { value: 'en', label: 'English' }] } })
    expect(w.find('label').attributes('data-code')).toBe('EN')
    expect(w.find('label').classes()).toContain('oc-language-select--code')
  })

  it('group renders title, status and meta', () => {
    const w = mount(OcGroup, { props: { title: 'Service 1', aside: '2 busy', asideTone: 'busy', meta: 'Last run 2 min ago' } })
    expect(w.find('h2.oc-group__title').text()).toBe('Service 1')
    expect(w.find('.oc-group__aside').attributes('data-tone')).toBe('busy')
    expect(w.find('.oc-group__meta').text()).toBe('Last run 2 min ago')
  })

  it('neon is a button variant', () => {
    expect(mount(OcButton, { props: { variant: 'neon' } }).classes()).toContain('oc-btn--neon')
  })

  it('particle field renders a hidden canvas', () => {
    const w = mount(OcParticleField, { props: { local: true } })
    expect(w.classes()).toEqual(['oc-particles', 'oc-particles--local'])
    expect(w.attributes('aria-hidden')).toBe('true')
  })
})
