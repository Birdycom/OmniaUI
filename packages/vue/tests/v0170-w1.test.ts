// File: packages/vue/tests/v0170-w1.test.ts
// Map: drawer -> code window -> date picker -> carousel -> resizable -> menubar -> context menu -> search
// 0.17.0 (W1): the new components that React, Vue and Blade all get.

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import OcDrawer from '../src/components/OcDrawer.vue'
import OcCodeWindow from '../src/components/OcCodeWindow.vue'
import OcDatePicker from '../src/components/OcDatePicker.vue'
import OcCarousel from '../src/components/OcCarousel.vue'
import OcCarouselItem from '../src/components/OcCarouselItem.vue'
import OcResizable from '../src/components/OcResizable.vue'
import OcResizablePanel from '../src/components/OcResizablePanel.vue'
import OcMenubar from '../src/components/OcMenubar.vue'
import OcContextMenu from '../src/components/OcContextMenu.vue'
import OcSearch from '../src/components/OcSearch.vue'

// jsdom has no <dialog> behaviour yet.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

describe('0.17.0 W1 drawer', () => {
  it('renders the drawer markup with an invoker trigger', async () => {
    const w = mount(OcDrawer, {
      attrs: { id: 'goal' },
      props: { title: 'Move goal', description: 'Set your daily activity goal.', label: 'Open drawer' },
      slots: { default: 'Body', footer: '<button class="oc-btn">Submit</button>' },
    })
    const trigger = w.get('button.oc-btn--outline')
    expect(trigger.attributes('command')).toBe('show-modal')
    expect(trigger.attributes('commandfor')).toBe('goal')
    const d = w.get('dialog')
    expect(d.classes()).toEqual(['oc-drawer'])
    expect(d.attributes('closedby')).toBe('any')
    expect(d.attributes('aria-labelledby')).toBe('goal-title')
    expect(d.get('.oc-drawer-content > .oc-drawer-handle').attributes('aria-hidden')).toBe('true')
    expect(d.get('h2.oc-drawer-title').attributes('id')).toBe('goal-title')
    expect(d.get('p.oc-drawer-description').text()).toBe('Set your daily activity goal.')
    expect(d.get('.oc-drawer-body').text()).toBe('Body')
    expect(d.find('.oc-drawer-footer .oc-btn').exists()).toBe(true)
    await trigger.trigger('click')
    expect(w.emitted('update:open')?.[0]).toEqual([true])
  })

  it('center modifier, no trigger without label', () => {
    const w = mount(OcDrawer, { props: { center: true, title: 'T' } })
    expect(w.get('dialog').classes()).toEqual(['oc-drawer', 'oc-drawer--center'])
    expect(w.find('button').exists()).toBe(false)
  })
})

describe('0.17.0 W1 code window', () => {
  it('copies the code', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const w = mount(OcCodeWindow, { props: { title: 'index.html', code: '<button class="oc-btn">Hello</button>' } })
    expect(w.classes()).toEqual(['oc-code-window'])
    expect(w.findAll('.oc-code-window__bar > i')).toHaveLength(3)
    expect(w.get('.oc-code-window__title').text()).toBe('index.html')
    expect(w.get('pre.oc-code-window__body > code').text()).toContain('oc-btn')
    await w.get('button.oc-code-copy').trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('<button class="oc-btn">Hello</button>')
    expect(w.get('button.oc-code-copy').classes()).toEqual(['oc-code-copy', 'is-copied'])
    expect(w.get('button.oc-code-copy').text()).toBe('Copied')
  })

  it('own body, dark, no copy', () => {
    const w = mount(OcCodeWindow, { props: { dark: true, copy: false }, slots: { default: '<div class="oc-code-block">x</div>' } })
    expect(w.classes()).toEqual(['oc-code-window', 'oc-code-window--dark'])
    expect(w.find('.oc-code-copy').exists()).toBe(false)
    expect(w.find('.oc-code-block').exists()).toBe(true)
  })
})

describe('0.17.0 W1 date picker', () => {
  it('shows the value, picks a day, fills the hidden input', async () => {
    const w = mount(OcDatePicker, { props: { modelValue: '2026-10-16', locale: 'en-GB', today: '2026-10-14', name: 'when' } })
    const trigger = w.get('button.oc-date-picker-trigger')
    expect(trigger.classes()).toEqual(['oc-btn', 'oc-btn--outline', 'oc-date-picker-trigger'])
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(trigger.get('span').text()).toBe('16 October 2026')
    expect(trigger.attributes('data-empty')).toBeUndefined()
    const pop = w.get('.oc-popover')
    expect(pop.classes()).toEqual(['oc-popover', 'oc-popover--calendar'])
    expect(trigger.attributes('popovertarget')).toBe(pop.attributes('id'))
    await pop.get('button[data-date="2026-10-20"]').trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['2026-10-20'])
    await w.setProps({ modelValue: '2026-10-20' })
    expect(w.get('button.oc-date-picker-trigger span').text()).toBe('20 October 2026')
    expect((w.get('input[type=hidden]').element as HTMLInputElement).value).toBe('2026-10-20')
  })

  it('placeholder while empty', () => {
    const w = mount(OcDatePicker)
    const trigger = w.get('button.oc-date-picker-trigger')
    expect(trigger.attributes('data-empty')).toBe('')
    expect(trigger.get('span').text()).toBe('Pick a date')
  })
})

describe('0.17.0 W1 carousel', () => {
  it('numbers the slides and renders the dots', () => {
    const w = mount(OcCarousel, {
      attrs: { id: 'hl' },
      props: { label: 'Highlights', per: 'halves' },
      slots: { default: () => [h(OcCarouselItem, null, () => 'Slide 1'), h(OcCarouselItem, { id: 'own' }, () => 'Slide 2'), h('span', 'Slide 3')] },
    })
    expect(w.classes()).toEqual(['oc-carousel', 'oc-carousel--halves'])
    const vp = w.get('.oc-carousel-viewport')
    expect(vp.attributes('aria-roledescription')).toBe('carousel')
    expect(vp.attributes('aria-label')).toBe('Highlights')
    const items = vp.findAll('.oc-carousel-item')
    expect(items).toHaveLength(3)
    expect(items[0].attributes('aria-label')).toBe('1 of 3')
    expect(items[1].attributes('id')).toBe('own')
    expect(items[2].attributes('aria-roledescription')).toBe('slide')
    expect(items[2].text()).toBe('Slide 3')
    expect(w.findAll('nav.oc-carousel-dots a.oc-carousel-dot').map((d) => d.attributes('href'))).toEqual(['#hl-slide-1', '#own', '#hl-slide-3'])
    expect(w.attributes('data-oc-dots')).toBe('')
  })

  it('loop buttons', () => {
    const w = mount(OcCarousel, { props: { loop: true, dots: false }, slots: { default: () => [h('div', 'A'), h('div', 'B')] } })
    expect(w.classes()).toEqual(['oc-carousel', 'oc-carousel--loop'])
    expect(w.get('.oc-carousel-prev').attributes('aria-controls')).toBe(w.get('.oc-carousel-viewport').attributes('id'))
    expect(w.find('.oc-carousel-next').exists()).toBe(true)
    expect(w.find('.oc-carousel-dots').exists()).toBe(false)
    expect(w.attributes('data-oc-loop')).toBe('')
  })
})

describe('0.17.0 W1 tier B', () => {
  it('resizable panels and box', () => {
    const w = mount(OcResizable, { props: { vertical: true }, slots: { default: () => [h(OcResizablePanel, { resizable: true }, () => 'A'), h(OcResizablePanel, null, () => 'B')] } })
    expect(w.classes()).toEqual(['oc-resizable', 'oc-resizable--vertical'])
    expect(w.findAll('.oc-resizable-panel')[0].classes()).toEqual(['oc-resizable-panel', 'oc-resizable-panel--resizable'])
    expect(mount(OcResizable, { props: { box: true } }).classes()).toEqual(['oc-resizable-box', 'oc-resizable'])
  })

  it('menubar: triggers point at popover menus', async () => {
    const onSelect = vi.fn()
    const w = mount(OcMenubar, {
      props: {
        label: 'Application',
        menus: [
          { label: 'File', items: [{ label: 'New tab', shortcut: 'Ctrl T', onSelect }, { separator: true }, { label: 'Share', items: [{ label: 'E-mail link' }] }] },
          { label: 'View', items: [{ label: 'Always show bookmarks', checked: true }, { label: 'Delete', destructive: true }] },
        ],
      },
    })
    const bar = w.get('.oc-menubar')
    expect(bar.attributes('role')).toBe('menubar')
    expect(bar.attributes('aria-label')).toBe('Application')
    const triggers = bar.findAll('button.oc-menubar-trigger')
    expect(triggers).toHaveLength(2)
    const menu = w.get(`#${triggers[0].attributes('popovertarget')}`)
    expect(menu.classes()).toEqual(['oc-dropdown-menu'])
    expect(menu.attributes('role')).toBe('menu')
    expect(menu.get('.oc-dropdown-shortcut').text()).toBe('Ctrl T')
    expect(menu.get('.oc-dropdown-separator').attributes('role')).toBe('separator')
    expect(menu.find('.oc-dropdown-sub > .oc-dropdown-submenu[role=menu]').exists()).toBe(true)
    await menu.get('button.oc-dropdown-item').trigger('click')
    expect(onSelect).toHaveBeenCalled()
    const view = w.get(`#${triggers[1].attributes('popovertarget')}`)
    expect(view.get('[role=menuitemcheckbox]').attributes('aria-checked')).toBe('true')
    expect(view.find('.oc-dropdown-item--destructive').exists()).toBe(true)
  })

  it('context menu positions at the pointer', async () => {
    const w = mount(OcContextMenu, { props: { items: [{ label: 'Reload', shortcut: 'Ctrl R' }] }, slots: { default: 'Right-click here' } })
    const area = w.get('.oc-context-area')
    expect(area.attributes('tabindex')).toBe('0')
    const menu = w.get('.oc-context-menu')
    expect(menu.classes()).toEqual(['oc-dropdown-menu', 'oc-context-menu'])
    expect(menu.attributes('aria-label')).toBe('Actions')
    await area.trigger('contextmenu', { clientX: 40, clientY: 50 })
    expect((menu.element as HTMLElement).style.getPropertyValue('--oc-context-x')).toBe('40px')
    expect((menu.element as HTMLElement).style.getPropertyValue('--oc-context-y')).toBe('50px')
  })

  it('search field with v-model', async () => {
    const w = mount(OcSearch, { props: { placeholder: 'Search the docs', hint: '/' }, attrs: { name: 'q', class: 'extra' } })
    expect(w.classes()).toEqual(['oc-search', 'extra'])
    expect(w.get('svg').classes()).toEqual(['oc-search-icon'])
    const input = w.get('input')
    expect(input.classes()).toEqual(['oc-search-input'])
    expect(input.attributes('type')).toBe('search')
    expect(input.attributes('name')).toBe('q')
    expect(input.attributes('aria-label')).toBe('Search the docs')
    expect(w.get('kbd.oc-search-hint').text()).toBe('/')
    await input.setValue('button')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['button'])
  })
})
