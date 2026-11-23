// File: packages/vue/tests/v0171-button.test.ts | Map: OcButton inherit (0.17.1)
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcButton from '../src/components/OcButton.vue'

describe('OcButton inherit (0.17.1)', () => {
  it('adds .oc-btn--inherit next to the variant', () => {
    const w = mount(OcButton, { props: { variant: 'outline', inherit: true }, slots: { default: 'Contact' } })
    expect(w.find('button').classes()).toEqual(['oc-btn', 'oc-btn--outline', 'oc-btn--inherit'])
  })
  it('works on a link and adds nothing without the prop', () => {
    const a = mount(OcButton, { props: { variant: 'ghost', inherit: true, href: '/x' }, slots: { default: 'More' } })
    expect(a.find('a').classes()).toContain('oc-btn--inherit')
    const b = mount(OcButton, { props: { variant: 'outline' }, slots: { default: 'Cancel' } })
    expect(b.find('button').classes()).not.toContain('oc-btn--inherit')
  })
})
