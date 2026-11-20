// File: packages/vue/tests/v0170-glass.test.ts
// Map: OcGlassBar { sep: true } -> divider between two groups; select keeps the index of the entry

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcGlassBar from '../src/components/OcGlassBar.vue'

describe('glass 0.17.0', () => {
  it('OcGlassBar draws a divider for { sep: true }', async () => {
    const w = mount(OcGlassBar, { props: { icons: true, label: 'Tools', items: [{ label: 'Draw', current: true }, { label: 'Text' }, { sep: true }, { label: 'Share' }] } })
    const children = w.find('nav').element.children
    expect(children).toHaveLength(4)
    expect(children[2].className).toBe('oc-glass-bar__sep')
    expect(children[2].getAttribute('aria-hidden')).toBe('true')
    expect(w.findAll('.oc-glass-bar__item')).toHaveLength(3)
    await w.findAll('button')[2].trigger('click')
    expect(w.emitted('select')?.[0]).toEqual([3])
  })
})
