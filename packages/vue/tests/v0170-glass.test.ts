// File: packages/vue/tests/v0170-glass.test.ts
// Map: OcGlassBar { sep: true } -> divider between two groups; select keeps the index of the entry -> lens prop (Chromium:
//      filter per size; :lens="false": data-oc-glass-lens="off"; flat: no lens; elsewhere html.oc-no-lens) -> draggable

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OcGlass from '../src/components/OcGlass.vue'
import OcGlassBar from '../src/components/OcGlassBar.vue'

function chromium(on: boolean) {
  Object.defineProperty(navigator, 'userAgentData', { configurable: true, value: on ? { brands: [{ brand: 'Chromium', version: '142' }] } : undefined })
}
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 240 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 120 })
})
afterEach(() => {
  chromium(false)
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
  document.documentElement.classList.remove('oc-no-lens')
})

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

  it('OcGlass gets the lens in Chromium and drops it on unmount', async () => {
    chromium(true)
    const w = mount(OcGlass, { attachTo: document.body, slots: { default: 'Body' } })
    await nextTick()
    const el = w.element as HTMLElement
    expect(el.getAttribute('data-oc-lens')).toBe('240x120')
    expect(el.style.getPropertyValue('--oc-glass-lens')).toBe('url(#oc-lens-240x120)')
    expect(document.getElementById('oc-lens-240x120')?.querySelector('feImage')?.getAttribute('height')).toBe('120')
    w.unmount()
    expect(document.getElementById('oc-lens-240x120')).toBeNull()
  })

  it(':lens="false" and flat give no lens; the bar takes the lens too', async () => {
    chromium(true)
    const off = mount(OcGlass, { props: { lens: false }, attachTo: document.body })
    const flat = mount(OcGlass, { props: { flat: true }, attachTo: document.body })
    const bar = mount(OcGlassBar, { props: { items: [{ label: 'Home', current: true }] }, attachTo: document.body })
    await nextTick()
    expect(off.element.getAttribute('data-oc-glass-lens')).toBe('off')
    expect(off.element.hasAttribute('data-oc-lens')).toBe(false)
    expect(flat.element.hasAttribute('data-oc-lens')).toBe(false)
    expect(bar.element.getAttribute('data-oc-lens')).toBe('240x120')
    for (const w of [off, flat, bar]) w.unmount()
  })

  it('draggable: data-oc-glass-drag (not the native attribute), focusable, arrow keys move it, removed when off', async () => {
    const w = mount(OcGlass, { props: { draggable: true, lens: false }, attachTo: document.body, slots: { default: 'Body' } })
    await nextTick()
    const el = w.element as HTMLElement
    expect(el.getAttribute('data-oc-glass-drag')).toBe('')
    expect(el.hasAttribute('draggable')).toBe(false)
    expect(el.getAttribute('tabindex')).toBe('0')
    expect(el.getAttribute('aria-roledescription')).toBe('draggable')
    expect(el.getAttribute('aria-label')).toBe('Drag to move')
    // jsdom has no layout: every box is 0 x 0 at 0,0 inside a 240 x 120 parent, so 16px to the right fits
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(el.style.translate).toMatch(/^16px/)
    await w.setProps({ draggable: false })
    await nextTick()
    expect(el.hasAttribute('data-oc-glass-drag')).toBe(false)
    expect(el.hasAttribute('tabindex')).toBe(false)
    expect(el.style.translate).toBe('')
    w.unmount()
  })

  it('outside Chromium: frosted glass (html.oc-no-lens)', async () => {
    const w = mount(OcGlass, { attachTo: document.body })
    await nextTick()
    expect(w.element.hasAttribute('data-oc-lens')).toBe(false)
    expect(document.documentElement.classList.contains('oc-no-lens')).toBe(true)
    w.unmount()
  })
})
