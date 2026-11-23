// File: packages/vue/tests/v0170-scrim.test.ts
// Map: 0.17.0 OcScrim: default (bottom, aria-hidden) -> side / dark modifiers -> tokens as inline custom properties

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcScrim from '../src/components/OcScrim.vue'

describe('OcScrim', () => {
  it('renders an aria-hidden span.oc-scrim with the bottom side by default', () => {
    const w = mount(OcScrim)
    expect(w.element.tagName).toBe('SPAN')
    expect(w.attributes('class')).toBe('oc-scrim')
    expect(w.attributes('aria-hidden')).toBe('true')
  })

  it('adds the side and dark modifiers and writes the tokens', () => {
    const w = mount(OcScrim, { props: { side: 'top', dark: true, strength: 0.6, size: '50%' } })
    expect(w.classes()).toEqual(expect.arrayContaining(['oc-scrim--top', 'oc-scrim--dark']))
    const el = w.element as HTMLElement
    expect(el.style.getPropertyValue('--oc-scrim-strength')).toBe('0.6')
    expect(el.style.getPropertyValue('--oc-scrim-size')).toBe('50%')
  })
})
