// File: packages/vue/tests/v0150.test.ts
// Map: OcThemeSwitch with icons only (--icons, hidden text, tooltip) -> icon + text -> default without icons

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcThemeSwitch from '../src/components/OcThemeSwitch.vue'

describe('v0.15.0 theme switch with icons', () => {
  it('icons only: --icons, a webicon per mode, the text for screen readers and as tooltip', () => {
    const w = mount(OcThemeSwitch, { props: { icons: true } })
    expect(w.classes()).toContain('oc-theme-switch--icons')
    expect(w.findAll('iconify-icon').map((i) => i.attributes('icon'))).toEqual(['mdi:monitor', 'mdi:white-balance-sunny', 'mdi:weather-night'])
    expect(w.findAll('.oc-theme-switch__text').map((s) => s.text())).toEqual(['System', 'Light', 'Dark'])
    expect(w.find('label').attributes('title')).toBe('System')
  })

  it('icon + text without the modifier; no icons by default', () => {
    const t = mount(OcThemeSwitch, { props: { icons: 'text' } })
    expect(t.classes()).not.toContain('oc-theme-switch--icons')
    expect(t.findAll('iconify-icon')).toHaveLength(3)
    expect(t.find('label').text()).toContain('System')
    expect(mount(OcThemeSwitch).find('iconify-icon').exists()).toBe(false)
  })
})
