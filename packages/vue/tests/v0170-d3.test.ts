// File: packages/vue/tests/v0170-d3.test.ts
// Map: compound OcTabs (v-model, keyboard, module) -> OcDialog parts (open/close, as-child, aria) -> compound OcPopover
//      (v-model:open, toggle event, side/align, anchor) -> OcTooltip (content slot, v-model:open) + OcTooltipProvider ->
//      OcBlockAppHeader (More overflow with a ResizeObserver mock, search slot) -> old APIs unchanged

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcTabs from '../src/components/OcTabs.vue'
import OcTabsList from '../src/components/OcTabsList.vue'
import OcTabsTrigger from '../src/components/OcTabsTrigger.vue'
import OcTabsContent from '../src/components/OcTabsContent.vue'
import OcDialog from '../src/components/OcDialog.vue'
import OcDialogTrigger from '../src/components/OcDialogTrigger.vue'
import OcDialogContent from '../src/components/OcDialogContent.vue'
import OcDialogHeader from '../src/components/OcDialogHeader.vue'
import OcDialogTitle from '../src/components/OcDialogTitle.vue'
import OcDialogDescription from '../src/components/OcDialogDescription.vue'
import OcDialogBody from '../src/components/OcDialogBody.vue'
import OcDialogFooter from '../src/components/OcDialogFooter.vue'
import OcDialogClose from '../src/components/OcDialogClose.vue'
import OcPopover from '../src/components/OcPopover.vue'
import OcPopoverTrigger from '../src/components/OcPopoverTrigger.vue'
import OcPopoverContent from '../src/components/OcPopoverContent.vue'
import OcPopoverAnchor from '../src/components/OcPopoverAnchor.vue'
import OcTooltip from '../src/components/OcTooltip.vue'
import OcTooltipProvider from '../src/components/OcTooltipProvider.vue'
import OcBlockAppHeader from '../src/blocks/OcBlockAppHeader.vue'
import { fitNavItems } from '../src/composables/useNavOverflow'

const realMatches = Element.prototype.matches
beforeEach(() => {
  const dlg = HTMLDialogElement.prototype as unknown as Record<string, unknown>
  dlg.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  dlg.close = function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
  const el = HTMLElement.prototype as unknown as Record<string, unknown>
  el.showPopover = function (this: HTMLElement) { this.dataset.testOpen = '1' }
  el.hidePopover = function (this: HTMLElement) { delete this.dataset.testOpen }
  Element.prototype.matches = function (this: Element, sel: string) {
    if (sel === ':popover-open') return (this as HTMLElement).dataset?.testOpen === '1'
    return realMatches.call(this, sel)
  }
})
afterEach(() => { Element.prototype.matches = realMatches })

describe('compound OcTabs', () => {
  const Host = defineComponent({
    props: { initial: { type: String, default: 'a' } },
    setup(props) {
      const tab = ref(props.initial)
      return () => h('div', [
        h('span', { class: 'state' }, tab.value),
        h(OcTabs, { modelValue: tab.value, 'onUpdate:modelValue': (v: string | undefined) => (tab.value = v ?? ''), name: 't1', module: 'green' }, () => [
          h(OcTabsList, null, () => [
            h(OcTabsTrigger, { value: 'a' }, () => 'Alpha'),
            h(OcTabsTrigger, { value: 'b', disabled: true }, () => 'Beta'),
            h(OcTabsTrigger, { value: 'c', count: 2 }, () => 'Gamma'),
          ]),
          h(OcTabsContent, { value: 'a' }, () => 'Panel A'),
          h(OcTabsContent, { value: 'c' }, () => 'Panel C'),
        ]),
      ])
    },
  })

  it('links ids, marks the active tab and panel, v-model updates on click', async () => {
    const w = mount(Host, { attachTo: document.body })
    const tabs = w.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('id')).toBe('t1-tab-a')
    expect(tabs[0].attributes('aria-controls')).toBe('t1-a')
    expect(w.find('#t1-a').classes()).toContain('is-active')
    expect(w.find('.oc-tabs').attributes('data-module')).toBe('green')
    await tabs[2].trigger('click')
    expect(w.find('.state').text()).toBe('c')
    expect(w.find('#t1-c').classes()).toContain('is-active')
    expect(tabs[2].find('.oc-data-table-tab-count').text()).toBe('2')
    w.unmount()
  })

  it('arrow keys skip the disabled tab and wrap', async () => {
    const w = mount(Host, { attachTo: document.body })
    const tabs = w.findAll('[role="tab"]')
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(w.find('.state').text()).toBe('c')
    await tabs[2].trigger('keydown', { key: 'ArrowRight' })
    expect(w.find('.state').text()).toBe('a')
    await tabs[0].trigger('keydown', { key: 'End' })
    expect(w.find('.state').text()).toBe('c')
    w.unmount()
  })

  it('the tabs prop still renders the radio tabset', () => {
    const w = mount(OcTabs, { props: { tabs: [{ label: 'One' }, { label: 'Two' }] } })
    expect(w.find('.oc-tabset input[type="radio"]').exists()).toBe(true)
    expect(w.find('.oc-tabs').exists()).toBe(false)
  })
})

describe('OcDialog parts', () => {
  const Host = defineComponent({
    setup() {
      const open = ref(false)
      return () => h('div', [
        h('span', { class: 'state' }, String(open.value)),
        h(OcDialog, { open: open.value, 'onUpdate:open': (v: boolean | undefined) => (open.value = !!v) }, () => [
          h(OcDialogTrigger, null, () => 'Edit'),
          h(OcDialogContent, { scroll: true, size: 'lg' }, () => [
            h(OcDialogHeader, null, () => [h(OcDialogTitle, null, () => 'Edit customer'), h(OcDialogDescription, null, () => 'Customer 1')]),
            h(OcDialogBody, null, () => 'Body'),
            h(OcDialogFooter, null, () => [h(OcDialogClose, null, () => 'Cancel')]),
          ]),
        ]),
      ])
    },
  })

  it('trigger opens, close button closes, aria ids line up', async () => {
    const w = mount(Host, { attachTo: document.body })
    const dialog = w.find('dialog.oc-modal')
    expect(dialog.attributes('open')).toBeUndefined()
    const trigger = w.find('button.oc-btn')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    await trigger.trigger('click')
    await nextTick()
    expect(w.find('.state').text()).toBe('true')
    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.attributes('aria-labelledby')).toBe(w.find('.oc-modal-title').attributes('id'))
    expect(dialog.attributes('aria-describedby')).toBe(w.find('.oc-modal-description').attributes('id'))
    expect(w.find('.oc-modal-content--scroll.oc-modal-content--lg').exists()).toBe(true)
    const cancel = w.findAll('button').find((b) => b.text() === 'Cancel')!
    await cancel.trigger('click')
    await nextTick()
    expect(w.find('.state').text()).toBe('false')
    expect(dialog.attributes('open')).toBeUndefined()
    w.unmount()
  })

  it('as-child merges the trigger into the slot element', async () => {
    const w = mount(defineComponent({
      setup: () => () => h(OcDialog, null, () => [
        h(OcDialogTrigger, { asChild: true }, () => h('a', { href: '#x', class: 'my-link' }, 'Open link')),
        h(OcDialogContent, null, () => h(OcDialogTitle, null, () => 'T')),
      ]),
    }), { attachTo: document.body })
    const link = w.find('a.my-link')
    expect(link.attributes('aria-haspopup')).toBe('dialog')
    await link.trigger('click')
    await nextTick()
    expect(w.find('dialog').attributes('open')).toBeDefined()
    w.unmount()
  })
})

describe('compound OcPopover', () => {
  it('v-model:open shows the panel; a native toggle reports back; side/align/offset', async () => {
    const open = ref(false)
    const w = mount(defineComponent({
      setup: () => () => h(OcPopover, { id: 'pp1', open: open.value, 'onUpdate:open': (v: boolean | undefined) => (open.value = !!v) }, () => [
        h(OcPopoverTrigger, null, () => 'Filter'),
        h(OcPopoverContent, { side: 'top', align: 'center', sideOffset: 8, title: 'Filters' }, () => 'Body'),
      ]),
    }), { attachTo: document.body })
    const panel = w.find('.oc-popover').element as HTMLElement
    expect(panel.id).toBe('pp1')
    expect(w.find('button').attributes('popovertarget')).toBe('pp1')
    expect(panel.getAttribute('data-side')).toBe('top')
    expect(panel.getAttribute('data-align')).toBe('center')
    expect(panel.style.getPropertyValue('--oc-popover-offset')).toBe('8px')
    open.value = true
    await nextTick()
    await nextTick()
    expect(panel.dataset.testOpen).toBe('1')
    delete panel.dataset.testOpen
    const e = new Event('toggle') as Event & { newState?: string }
    e.newState = 'closed'
    panel.dispatchEvent(e)
    await nextTick()
    expect(open.value).toBe(false)
    w.unmount()
  })

  it('OcPopoverAnchor names the anchor; the old API still renders its own button', async () => {
    const w = mount(defineComponent({
      setup: () => () => h(OcPopover, { id: 'pp2' }, () => [
        h(OcPopoverAnchor, null, () => h('span', 'Row 1')),
        h(OcPopoverTrigger, null, () => 'More'),
        h(OcPopoverContent, null, () => 'Body'),
      ]),
    }), { attachTo: document.body })
    await nextTick()
    const anchor = w.find('[data-oc-popover-anchor]').element as HTMLElement
    expect(anchor.style.getPropertyValue('anchor-name') || (anchor.style as unknown as Record<string, string>).anchorName).toBe('--pp2')
    w.unmount()
    const old = mount(OcPopover, { props: { label: 'Old', title: 'T' }, slots: { default: 'Old body' } })
    expect(old.find('button.oc-btn--outline').text()).toBe('Old')
    expect(old.find('.oc-popover .oc-popover-title').text()).toBe('T')
  })
})

describe('OcTooltip', () => {
  it('content slot renders rich content with aria-describedby', () => {
    const w = mount(OcTooltip, { slots: { default: '<button>Info</button>', content: '<strong>Due today</strong>' } })
    const bubble = w.find('.oc-tooltip__content')
    expect(bubble.attributes('role')).toBe('tooltip')
    expect(w.attributes('aria-describedby')).toBe(bubble.attributes('id'))
    expect(w.attributes('data-tooltip')).toBeUndefined()
    expect(bubble.find('strong').exists()).toBe(true)
  })

  it('text stays data-tooltip; v-model:open sets is-open / is-closed and follows hover', async () => {
    const plain = mount(OcTooltip, { props: { text: 'Plain' }, slots: { default: 'X' } })
    expect(plain.attributes('data-tooltip')).toBe('Plain')
    expect(plain.classes()).toEqual(['oc-tooltip'])
    const open = ref<boolean | undefined>(false)
    const w = mount(defineComponent({
      setup: () => () => h(OcTooltip, { text: 'Hi', open: open.value, 'onUpdate:open': (v: boolean | undefined) => (open.value = v) }, () => 'Y'),
    }))
    const tip = w.find('.oc-tooltip')
    expect(tip.classes()).toContain('is-closed')
    await tip.trigger('mouseenter')
    await nextTick()
    expect(open.value).toBe(true)
    expect(w.find('.oc-tooltip').classes()).toContain('is-open')
  })

  it('OcTooltipProvider sets --oc-tooltip-delay', () => {
    const w = mount(OcTooltipProvider, { props: { delayDuration: 250 }, slots: { default: 'x' } })
    expect((w.element as HTMLElement).style.getPropertyValue('--oc-tooltip-delay')).toBe('250ms')
  })
})

describe('OcBlockAppHeader overflow + search', () => {
  let observers: Array<() => void> = []
  beforeEach(() => {
    observers = []
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      cb: () => void
      constructor(cb: () => void) { this.cb = cb; observers.push(cb) }
      observe() {}
      disconnect() {}
    }
  })

  it('fitNavItems matches the React / vanilla rule', () => {
    expect(fitNavItems([50, 50, 50], 200, 40, 10)).toBe(3)
    expect(fitNavItems([50, 50, 50], 140, 40, 10)).toBe(1)
  })

  it('moves what does not fit into More; More is current when the current page is hidden', async () => {
    const ow = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.hasAttribute('data-oc-nav-more') ? 60 : this.tagName === 'LI' ? 80 : 0
    })
    let navWidth = 240
    const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('oc-block-appbar-nav') ? navWidth : 0
    })
    const w = mount(OcBlockAppHeader, {
      attachTo: document.body,
      props: {
        overflow: true,
        module: 'blue',
        navItems: [
          { label: 'Contacts', href: '/c' },
          { label: 'Companies', href: '/co' },
          { label: 'Segments', href: '/s' },
          { label: 'Reports', href: '/r', current: true },
        ],
      },
      slots: { search: '<input class="oc-input" type="search" aria-label="Search">', actions: '<button>U1</button>' },
    })
    await nextTick()
    expect(w.findAll('.oc-block-appbar-nav li[data-oc-hidden]:not([data-oc-nav-more])').length).toBe(2)
    expect(w.findAll('.oc-dropdown-menu a').map((a) => a.text())).toEqual(['Segments', 'Reports'])
    expect(w.find('.oc-block-appbar-more').attributes('aria-current')).toBe('page')
    expect(w.attributes('data-module')).toBe('blue')
    expect(w.find('.oc-block-appbar-search + .oc-block-appbar-actions').exists()).toBe(true)
    navWidth = 1000
    observers.forEach((cb) => cb())
    await nextTick()
    expect(w.findAll('.oc-block-appbar-nav li[data-oc-hidden]:not([data-oc-nav-more])').length).toBe(0)
    expect(w.find('[data-oc-nav-more]').attributes('data-oc-hidden')).toBe('')
    ow.mockRestore()
    cw.mockRestore()
    w.unmount()
  })

  it('without overflow: the plain nav, no More item', () => {
    const w = mount(OcBlockAppHeader, { props: { navItems: [{ label: 'A', href: '/a' }] } })
    expect(w.find('[data-oc-nav-more]').exists()).toBe(false)
    expect(w.find('.oc-block-appbar-search').exists()).toBe(false)
  })
})
