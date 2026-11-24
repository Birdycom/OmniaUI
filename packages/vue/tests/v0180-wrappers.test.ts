// File: packages/vue/tests/v0180-wrappers.test.ts
// Map: OcMeterList (variants + live) -> OcStatCardGrid -> OcFormGroup (legacy) - wrappers for markup that was a plain div before
//      -> OcCommand slot row content: mixed text in one span, a leading icon stays its own flex item
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTextVNode, h } from 'vue'
import OcMeterList from '../src/components/OcMeterList.vue'
import OcMeterRow from '../src/components/OcMeterRow.vue'
import OcStatCardGrid from '../src/components/OcStatCardGrid.vue'
import OcStatCard from '../src/components/OcStatCard.vue'
import OcFormGroup from '../src/components/OcFormGroup.vue'
import OcCommand from '../src/components/OcCommand.vue'
import OcCommandItem from '../src/components/OcCommandItem.vue'
import OcWebicon from '../src/components/OcWebicon.vue'
import * as api from '../src'
import { addWebicons } from '../src/index'

describe('OcMeterList (0.18.0)', () => {
  it('renders .oc-meter-list with its rows and passes attributes on', () => {
    const w = mount(OcMeterList, {
      attrs: { class: 'mt-2', 'data-x': '1' },
      slots: { default: () => [h(OcMeterRow, { label: 'Session', percent: 40 }), h(OcMeterRow, { label: 'Week', percent: 80 })] },
    })
    expect(w.classes()).toEqual(['oc-meter-list', 'mt-2'])
    expect(w.attributes('data-x')).toBe('1')
    expect(w.findAll('.oc-meter-row')).toHaveLength(2)
  })

  it.each(['compact', 'dense', 'live'] as const)('variant %s adds its modifier', (variant) => {
    const w = mount(OcMeterList, { props: { variant } })
    expect(w.classes()).toEqual(['oc-meter-list', `oc-meter-list--${variant}`])
  })

  it('live combines with another variant and is not doubled', () => {
    expect(mount(OcMeterList, { props: { variant: 'dense', live: true } }).classes()).toEqual(['oc-meter-list', 'oc-meter-list--dense', 'oc-meter-list--live'])
    expect(mount(OcMeterList, { props: { variant: 'live', live: true } }).classes()).toEqual(['oc-meter-list', 'oc-meter-list--live'])
    expect(mount(OcMeterList, { props: { live: true } }).classes()).toEqual(['oc-meter-list', 'oc-meter-list--live'])
  })
})

describe('OcStatCardGrid (0.18.0)', () => {
  it('renders .oc-stat-card-grid with cards', () => {
    const w = mount(OcStatCardGrid, {
      attrs: { class: 'mb-4' },
      slots: { default: () => [h(OcStatCard, { value: '12', label: 'Open invoices' }), h(OcStatCard, { value: '3', label: 'Overdue' })] },
    })
    expect(w.classes()).toEqual(['oc-stat-card-grid', 'mb-4'])
    expect(w.findAll('.oc-stat-card')).toHaveLength(2)
  })
})

describe('OcFormGroup (0.18.0, legacy)', () => {
  it('renders .oc-form-group with its children', () => {
    const w = mount(OcFormGroup, {
      attrs: { id: 'g1' },
      slots: { default: () => [h('label', { class: 'oc-label', for: 'name' }, 'Name'), h('input', { id: 'name', class: 'oc-input' })] },
    })
    expect(w.classes()).toEqual(['oc-form-group'])
    expect(w.attributes('id')).toBe('g1')
    expect(w.find('input.oc-input').exists()).toBe(true)
  })
})

describe('exports', () => {
  it('OcMeterList, OcStatCardGrid and OcFormGroup come from the package index', () => {
    expect(api.OcMeterList).toBe(OcMeterList)
    expect(api.OcStatCardGrid).toBe(OcStatCardGrid)
    expect(api.OcFormGroup).toBe(OcFormGroup)
  })
})

describe('OcCommand row content (0.18.0 QA)', () => {
  addWebicons({ 'mdi:file-document-outline': 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2' })
  const row = (content: () => unknown[], props: Record<string, unknown> = {}) =>
    mount(OcCommand, { slots: { default: () => [h(OcCommandItem, props, { default: content })] } }).find('li.oc-command-item').element as HTMLElement

  it('puts mixed text (<strong>New</strong> invoice) in one span so the row gap does not split it', () => {
    const li = row(() => [h('strong', 'New'), createTextVNode(' invoice')], { value: 'new', shortcut: 'Ctrl N' })
    expect(li.firstElementChild!.tagName).toBe('SPAN')
    expect(li.firstElementChild!.innerHTML).toBe('<strong>New</strong> invoice')
    expect(li.querySelector('.oc-command-shortcut')!.textContent).toBe('Ctrl N')
  })

  it('keeps a leading icon outside the text span', () => {
    const li = row(() => [h(OcWebicon, { name: 'mdi:file-document-outline' }), createTextVNode(' '), h('strong', 'New'), createTextVNode(' invoice')])
    expect(li.firstElementChild!.tagName.toLowerCase()).toBe('svg')
    expect(li.children[1].tagName).toBe('SPAN')
    expect(li.children[1].textContent).toBe(' New invoice')
  })

  it('leaves an icon with one text node and plain text as they were', () => {
    const li = row(() => [h('svg', { class: 'icon', 'aria-hidden': 'true' }), createTextVNode(' New invoice')])
    expect(li.children[0].tagName.toLowerCase()).toBe('svg')
    expect(li.querySelectorAll('span')).toHaveLength(0)
    const plain = row(() => [createTextVNode('All invoices')])
    expect(plain.querySelectorAll('span')).toHaveLength(0)
    expect(plain.textContent).toBe('All invoices')
  })
})
