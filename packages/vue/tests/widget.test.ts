// File: packages/vue/tests/widget.test.ts
// Map: status dot + status row -> glass -> title bar -> progress meter (levels, marker) -> alert/button inline -> prose compact
// Widget and desktop-app wrappers (0.12.3): they must render the same classes as the HTML snippets.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  OcAlert, OcButton, OcGlass, OcGlassPanel, OcProgress, OcProse, OcStatus, OcStatusDot, OcTitlebar, OcTitlebarBody, OcTitlebarButton, OcTitlebarWindow,
} from '../src'

describe('widget components', () => {
  it('OcStatusDot is decoration without a label and an image with one', () => {
    const plain = mount(OcStatusDot, { props: { tone: 'working', size: 'sm' } })
    expect(plain.classes()).toEqual(['oc-status-dot', 'oc-status-dot--working', 'oc-status-dot--sm'])
    expect(plain.attributes('aria-hidden')).toBe('true')
    const labelled = mount(OcStatusDot, { props: { tone: 'error', label: 'Failed' } })
    expect(labelled.attributes('role')).toBe('img')
    expect(labelled.attributes('aria-label')).toBe('Failed')
  })

  it('OcStatus renders dot, text and meta', () => {
    const w = mount(OcStatus, { props: { tone: 'done', meta: '12 min' }, slots: { default: 'Done' } })
    expect(w.classes()).toContain('oc-status')
    expect(w.find('.oc-status-dot--done').exists()).toBe(true)
    expect(w.find('.oc-status__text').text()).toBe('Done')
    expect(w.find('.oc-status__meta').text()).toBe('12 min')
  })

  it('OcGlass and OcGlassPanel map their flags', () => {
    const w = mount(OcGlass, { props: { as: 'section', flat: true, strong: true } })
    expect(w.element.tagName).toBe('SECTION')
    expect(w.classes()).toEqual(['oc-glass', 'oc-glass--strong', 'oc-glass--flat'])
    expect(mount(OcGlassPanel, { props: { strong: true } }).classes()).toEqual(['oc-glass-panel', 'oc-glass-panel--strong'])
  })

  it('OcTitlebar renders title, subtitle and the action slot', () => {
    const w = mount(OcTitlebar, { props: { title: 'App', subtitle: 'Usage', bordered: true, size: 'sm' }, slots: { default: '<button>x</button>' } })
    expect(w.classes()).toEqual(['oc-titlebar', 'oc-titlebar--bordered', 'oc-titlebar--sm'])
    expect(w.find('.oc-titlebar__subtitle').text()).toBe('Usage')
    expect(w.find('.oc-titlebar__actions button').exists()).toBe(true)
    const b = mount(OcTitlebarButton, { props: { label: 'Close', close: true } })
    expect(b.classes()).toEqual(['oc-titlebar__btn', 'oc-titlebar__btn--close'])
    expect(b.attributes('aria-label')).toBe('Close')
    expect(mount(OcTitlebarWindow).classes()).toEqual(['oc-titlebar-window'])
    expect(mount(OcTitlebarBody).classes()).toEqual(['oc-titlebar-body'])
  })

  it('OcProgress levels, marker, size and glow', () => {
    const w = mount(OcProgress, { props: { value: 38, max: 50, size: 'sm', glow: true, levels: true, marker: 10 } })
    expect(w.classes()).toEqual(['oc-progress', 'oc-progress--sm', 'oc-progress--glow'])
    expect(w.find('.oc-progress-bar').classes()).toContain('oc-progress-bar--warning')
    expect(w.find('.oc-progress-marker').attributes('style')).toContain('left: 20%')
    const own = mount(OcProgress, { props: { value: 60, levels: [50, 80] } })
    expect(own.find('.oc-progress-bar').classes()).toContain('oc-progress-bar--warning')
    const fixed = mount(OcProgress, { props: { value: 95, levels: true, variant: 'success' } })
    expect(fixed.find('.oc-progress-bar').classes()).toContain('oc-progress-bar--success')
  })

  it('OcAlert inline, OcButton inline and OcProse compact add their modifier', () => {
    expect(mount(OcAlert, { props: { variant: 'danger', inline: true }, slots: { default: 'Wrong' } }).classes()).toEqual(['oc-alert', 'oc-alert--danger', 'oc-alert--inline'])
    expect(mount(OcButton, { props: { variant: 'link', inline: true } }).classes()).toEqual(['oc-btn', 'oc-btn--link', 'oc-btn--inline'])
    expect(mount(OcProse, { props: { size: 'compact' }, slots: { default: '<p>x</p>' } }).classes()).toEqual(['oc-prose', 'oc-prose--compact'])
  })
})
