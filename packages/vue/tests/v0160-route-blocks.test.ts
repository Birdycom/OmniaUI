// File: packages/vue/tests/v0160-route-blocks.test.ts
// Map: type picker -> content blocks -> route steps -> route progress -> step view

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcBlockTypePicker from '../src/blocks/OcBlockTypePicker.vue'
import OcBlockContentBlocks from '../src/blocks/OcBlockContentBlocks.vue'
import OcBlockRouteSteps from '../src/blocks/OcBlockRouteSteps.vue'
import OcBlockRouteProgress from '../src/blocks/OcBlockRouteProgress.vue'
import OcBlockStepView from '../src/blocks/OcBlockStepView.vue'

describe('v0.16.0 type picker', () => {
  const options = [
    { value: 'text', label: 'Text', category: 'content' },
    { value: 'image', label: 'Image', category: 'media' },
    { value: 'question', label: 'Question', category: 'question', disabled: true },
  ]
  it('radio cards with a preview slot, v-model and the category filter', async () => {
    const w = mount(OcBlockTypePicker, { props: { options, categories: [{ value: 'media', label: 'Media' }], modelValue: 'text' }, slots: { preview: '<b>mini</b>' } })
    expect(w.findAll('.oc-block-type-picker-input')).toHaveLength(3)
    expect((w.findAll('.oc-block-type-picker-input')[0].element as HTMLInputElement).checked).toBe(true)
    expect(w.find('.oc-block-type-picker-preview').attributes('aria-hidden')).toBe('true')
    await w.findAll('.oc-block-type-picker-input')[1].setValue(true)
    expect(w.emitted('update:modelValue')![0]).toEqual(['image'])
    await w.find('.oc-block-type-picker-cats input[value="media"]').setValue(true)
    expect(w.findAll('.oc-block-type-picker-item')).toHaveLength(1)
  })
})

describe('v0.16.0 content blocks', () => {
  const items = [
    { id: 'a', type: 'Text', icon: 'mdi:text', open: true },
    { id: 'b', type: 'Image', peek: 'photo.jpg' },
  ]
  it('cards, tools and move / remove events', async () => {
    const w = mount(OcBlockContentBlocks, { props: { title: 'Step 1', items }, slots: { block: '<textarea></textarea>' } })
    expect(w.findAll('.oc-block-content-blocks-item')).toHaveLength(2)
    expect(w.find('.oc-block-content-blocks-peek').text()).toBe('photo.jpg')
    expect(w.find('[aria-label="Move Text up"]').attributes('disabled')).toBeDefined()
    await w.find('[aria-label="Move Text down"]').trigger('click')
    expect(w.emitted('move')![0]).toEqual(['a', 1])
    const grip = w.find('[aria-label="Move Image"]')
    await grip.trigger('click')
    expect(grip.attributes('aria-pressed')).toBe('true')
    await grip.trigger('keydown', { key: 'ArrowUp' })
    expect(w.emitted('move')![1]).toEqual(['b', 0])
    await w.find('[aria-label="Remove Image"]').trigger('click')
    expect(w.emitted('remove')![0]).toEqual(['b'])
  })
})

describe('v0.16.0 route steps', () => {
  const steps = [
    { id: 's1', name: 'Welcome', numbered: false, icon: 'mdi:play-circle-outline', kind: 'intro' },
    { id: 's2', name: 'Old gate', kind: 'step', status: 'Ready', statusTone: 'success' as const },
  ]
  it('numbers, filter with hidden rows, select and menu', async () => {
    const w = mount(OcBlockRouteSteps, { props: { title: 'Steps', steps, selected: 's2', kinds: [{ value: 'intro', label: 'Intro' }] } })
    expect(w.findAll('.oc-block-route-steps-thumb--num')).toHaveLength(1)
    expect(w.find('[aria-current="true"]').text()).toContain('Old gate')
    await w.find('.oc-block-route-steps-kinds input[value="intro"]').setValue(true)
    expect(w.findAll('.oc-block-route-steps-item').map((r) => r.classes().includes('is-filtered'))).toEqual([false, true])
    await w.findAll('.oc-block-route-steps-main')[0].trigger('click')
    expect(w.emitted('select')![0]).toEqual(['s1'])
    await w.findAll('.oc-block-route-steps-item')[0].findAll('.oc-dropdown-item')[1].trigger('click')
    expect(w.emitted('move')![0]).toEqual(['s1', 1])
  })
})

describe('v0.16.0 route progress', () => {
  it('bar, next and states', async () => {
    const w = mount(OcBlockRouteProgress, {
      props: { title: 'Route 1', done: 3, total: 6, next: { title: 'Walk', tone: 'over' }, steps: [{ name: 'A', state: 'done' }, { name: 'B', state: 'current' }, { name: 'F', state: 'locked', marker: 'mdi:flag-checkered' }] },
    })
    expect(w.find('.oc-progress-bar').attributes('style')).toContain('50%')
    expect(w.find('.oc-block-route-progress-next--over').exists()).toBe(true)
    expect(w.findAll('.oc-block-route-progress-item')[1].find('button').attributes('aria-current')).toBe('step')
    expect(w.find('.oc-block-route-progress-item--locked svg[data-webicon="mdi:flag-checkered"]').exists()).toBe(true)
    await w.find('.oc-block-route-progress-next').trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
  })
})

describe('v0.16.0 step view', () => {
  it('empty picture with number, question v-model and send', async () => {
    const w = mount(OcBlockStepView, { props: { title: 'Town hall', number: 3, question: { text: 'Which year?', options: ['1890', '1910'] } }, slots: { default: '<p>Text</p>' } })
    expect(w.find('.oc-block-step-view-picture--empty').attributes('data-number')).toBe('3')
    await w.findAll('.oc-radio')[1].setValue(true)
    expect(w.emitted('update:answer')![0]).toEqual([1])
    await w.find('.oc-block-step-view-send').trigger('click')
    expect(w.emitted('send')).toHaveLength(1)
  })
})
