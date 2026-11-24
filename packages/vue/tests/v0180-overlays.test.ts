// File: packages/vue/tests/v0180-overlays.test.ts
// Map: OcCombobox portal in the top layer (OcModal / OcSheet / OcDrawer, fallback teleport) -> OcPopoverContent lazy +
//      match-trigger-width + flip/shift fallback -> OcTooltip as-child -> OcDropdown side/align, trigger-as-child,
//      OcDropdownItem as-child

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcCombobox from '../src/components/OcCombobox.vue'
import OcModal from '../src/components/OcModal.vue'
import OcSheet from '../src/components/OcSheet.vue'
import OcDrawer from '../src/components/OcDrawer.vue'
import OcPopover from '../src/components/OcPopover.vue'
import OcPopoverTrigger from '../src/components/OcPopoverTrigger.vue'
import OcPopoverContent from '../src/components/OcPopoverContent.vue'
import OcTooltip from '../src/components/OcTooltip.vue'
import OcDropdown from '../src/components/OcDropdown.vue'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'

const options = [
  { value: '1', label: 'Customer 1' },
  { value: '2', label: 'Customer 2' },
]

// jsdom has no <dialog> modal API and no popover API: small stand-ins, removed again after each test.
const realMatches = Element.prototype.matches
function installPopover() {
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
}
function removePopover() {
  const el = HTMLElement.prototype as unknown as Record<string, unknown>
  delete el.showPopover
  delete el.hidePopover
  Element.prototype.matches = realMatches
}
beforeEach(installPopover)
afterEach(() => {
  removePopover()
  document.body.innerHTML = ''
})

describe('OcCombobox portal in the top layer (0.18.0)', () => {
  for (const [name, Shell] of [['OcModal', OcModal], ['OcSheet', OcSheet], ['OcDrawer', OcDrawer]] as const) {
    it(`stays inside an open ${name} as popover="manual" and still chooses`, async () => {
      const host = document.body.appendChild(document.createElement('div'))
      const value = ref('')
      const Demo = defineComponent({
        setup: () => () => h(Shell as never, { open: true, title: 'Edit' }, {
          default: () => h(OcCombobox, { options, portal: true, label: 'Customer', module: 'green', modelValue: value.value, 'onUpdate:modelValue': (v: string) => { value.value = v } }),
        }),
      })
      const w = mount(Demo, { attachTo: host })
      await nextTick()
      await nextTick()
      const dialog = document.querySelector('dialog')!
      const root = dialog.querySelector('.oc-combobox')!
      expect(root).not.toBeNull()
      const list = root.querySelector('.oc-combobox-list--portal') as HTMLElement
      expect(list).not.toBeNull()
      expect(list.getAttribute('popover')).toBe('manual')
      expect(document.body.querySelector(':scope > .oc-combobox-list--portal')).toBeNull()
      const input = root.querySelector('input')!
      input.dispatchEvent(new FocusEvent('focus'))
      // 0.18.0: focus alone (a dialog that focuses the field) keeps it closed; the click of the user opens it
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      await nextTick()
      expect(list.dataset.testOpen).toBe('1')
      expect(list.getAttribute('data-open')).toBe('')
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      list.querySelector('[data-value="2"]')!.dispatchEvent(down)
      expect(down.defaultPrevented).toBe(true)
      ;(list.querySelector('[data-value="2"]') as HTMLElement).click()
      await nextTick()
      await nextTick()
      expect(value.value).toBe('2')
      expect(list.dataset.testOpen).toBeUndefined()
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      await nextTick()
      await nextTick()
      expect(list.dataset.testOpen).toBe('1')
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      await nextTick()
      await nextTick()
      expect(list.dataset.testOpen).toBeUndefined()
      w.unmount()
    })
  }

  it('falls back to a teleport to body without popover support', async () => {
    removePopover()
    const host = document.body.appendChild(document.createElement('div'))
    const w = mount(OcCombobox, { props: { options, portal: true }, attachTo: host })
    await nextTick()
    const list = document.body.querySelector(':scope > .oc-combobox-list--portal') as HTMLElement
    expect(list).not.toBeNull()
    expect(list.hasAttribute('popover')).toBe(false)
    w.unmount()
  })

  it('without portal the list is never a popover', async () => {
    const w = mount(OcCombobox, { props: { options } })
    await nextTick()
    expect(w.find('.oc-combobox-list').attributes('popover')).toBeUndefined()
  })
})

describe('OcPopoverContent lazy, match-trigger-width and fallback flip (0.18.0)', () => {
  const Demo = (contentProps: Record<string, unknown>, open: ReturnType<typeof ref<boolean>>) =>
    defineComponent({
      setup: () => () => h(OcPopover, { open: open.value, 'onUpdate:open': (v: boolean | undefined) => { open.value = !!v } }, {
        default: () => [
          h(OcPopoverTrigger, null, { default: () => 'Open' }),
          h(OcPopoverContent, { title: 'Customer 1', ...contentProps }, { default: () => h('p', { 'data-t': 'heavy' }, 'Details') }),
        ],
      }),
    })

  it('lazy renders the slot from the first open on; unmount-on-close removes it again', async () => {
    for (const unmountOnClose of [false, true]) {
      const open = ref(false)
      const w = mount(Demo({ lazy: true, unmountOnClose }, open), { attachTo: document.body })
      await nextTick()
      expect(w.find('.oc-popover-title').text()).toBe('Customer 1')
      expect(w.find('[data-t="heavy"]').exists()).toBe(false)
      open.value = true
      await nextTick()
      await nextTick()
      expect(w.find('[data-t="heavy"]').exists()).toBe(true)
      open.value = false
      await nextTick()
      await nextTick()
      expect(w.find('[data-t="heavy"]').exists()).toBe(!unmountOnClose)
      w.unmount()
    }
  })

  it('without lazy the slot renders while closed (unchanged)', async () => {
    const w = mount(Demo({}, ref(false)))
    await nextTick()
    expect(w.find('[data-t="heavy"]').exists()).toBe(true)
  })

  it('match-trigger-width sets data-match-width and the trigger width in px; the fallback flips and shifts', async () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return { top: 700, left: 1000, width: 240, height: 36, bottom: 736, right: 1240, x: 1000, y: 700, toJSON: () => ({}) } as DOMRect
    })
    const ow = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) { return parseFloat(this.style.width) || 288 })
    const oh = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120)
    const open = ref(false)
    const w = mount(Demo({ matchTriggerWidth: true }, open), { attachTo: document.body })
    await nextTick()
    open.value = true
    await nextTick()
    await nextTick()
    const panel = w.find('.oc-popover').element as HTMLElement
    expect(panel.hasAttribute('data-match-width')).toBe(true)
    expect(panel.style.width).toBe('240px')
    // jsdom viewport 1024x768: the bottom (736 + 120) has no room -> top; the left is shifted to 1024 - 240 - 8.
    expect(panel.style.top).toBe(`${700 - 120 - 4}px`)
    expect(panel.style.left).toBe(`${1024 - 240 - 8}px`)
    rect.mockRestore()
    ow.mockRestore()
    oh.mockRestore()
    w.unmount()
  })
})

describe('OcTooltip as-child (0.18.0)', () => {
  it('puts the tooltip on the slot element without a wrapping span', async () => {
    const onClick = vi.fn()
    const w = mount(OcTooltip, { props: { text: 'Save', side: 'bottom', asChild: true }, slots: { default: () => h('button', { type: 'button', class: 'oc-btn', onClick }, 'S') } })
    expect(w.find('span.oc-tooltip').exists()).toBe(false)
    const btn = w.find('button')
    expect(w.element).toBe(btn.element)
    expect(btn.classes()).toEqual(expect.arrayContaining(['oc-tooltip', 'oc-tooltip--bottom', 'oc-btn']))
    expect(btn.attributes('data-tooltip')).toBe('Save')
    await btn.trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  it('appends rich content inside the element and links it', () => {
    const w = mount(OcTooltip, {
      props: { heading: 'customer', asChild: true },
      slots: { default: () => h('a', { href: '#c' }, 'Open'), content: () => h('b', 'Customer 1') },
    })
    const a = w.find('a')
    expect(a.classes()).toContain('oc-tooltip')
    const content = a.find('.oc-tooltip__content')
    expect(content.attributes('role')).toBe('tooltip')
    expect(a.attributes('aria-describedby')).toBe(content.attributes('id'))
    expect(a.text()).toBe('OpencustomerCustomer 1')
  })

  it('appends rich content into the default slot of a component child', () => {
    const Link = defineComponent({ props: { to: String }, setup: (p, { slots }) => () => h('a', { href: p.to, 'data-router': '' }, slots.default?.()) })
    const w = mount(OcTooltip, {
      props: { asChild: true },
      slots: { default: () => h(Link, { to: '#c' }, { default: () => 'Open' }), content: () => 'Customer 1' },
    })
    const a = w.find('a[data-router]')
    expect(a.classes()).toContain('oc-tooltip')
    expect(a.find('.oc-tooltip__content').text()).toBe('Customer 1')
  })
})

describe('OcDropdown side/align, trigger-as-child, OcDropdownItem as-child (0.18.0)', () => {
  it('side and align land on the menu (bottom start by default once set)', () => {
    const a = mount(OcDropdown, { props: { label: 'Actions', side: 'top', align: 'end' } })
    expect(a.find('.oc-dropdown-menu').attributes('data-side')).toBe('top')
    expect(a.find('.oc-dropdown-menu').attributes('data-align')).toBe('end')
    const b = mount(OcDropdown, { props: { label: 'Actions', align: 'center' } })
    expect(b.find('.oc-dropdown-menu').attributes('data-side')).toBe('bottom')
    const c = mount(OcDropdown, { props: { label: 'Actions' } })
    expect(c.find('.oc-dropdown-menu').attributes('data-side')).toBeUndefined()
    const d = mount(OcDropdown, { props: { label: 'Actions', mode: 'toggle', side: 'right' } })
    expect(d.find('.oc-dropdown-menu').attributes('data-side')).toBe('right')
  })

  it('trigger-as-child merges popovertarget into the trigger slot element', () => {
    const w = mount(OcDropdown, {
      attrs: { id: 'm1' },
      props: { triggerAsChild: true },
      slots: { trigger: () => h('button', { type: 'button', class: 'oc-btn oc-btn--ghost', 'aria-label': 'More' }, '...') },
    })
    const btn = w.find('button.oc-btn--ghost')
    expect(btn.attributes('popovertarget')).toBe('m1')
    expect(w.findAll('button').length).toBe(1)
  })

  it('trigger-as-child in toggle mode merges the toggle click', async () => {
    const w = mount(OcDropdown, { props: { mode: 'toggle', triggerAsChild: true }, slots: { trigger: () => h('button', { type: 'button', class: 'oc-avatar-btn' }, 'C1') } })
    await w.find('button.oc-avatar-btn').trigger('click')
    expect(w.find('.oc-dropdown').classes()).toContain('is-open')
    expect(w.find('button.oc-avatar-btn').attributes('aria-expanded')).toBe('true')
  })

  it('OcDropdownItem as-child renders a router link as the item and closes the menu on a click', async () => {
    const Link = defineComponent({ props: { to: String }, setup: (p, { slots, attrs }) => () => h('a', { ...attrs, href: p.to, 'data-router': '' }, slots.default?.()) })
    const w = mount(OcDropdown, {
      props: { label: 'Account' },
      attachTo: document.body,
      slots: { default: () => h(OcDropdownItem, { asChild: true, hint: 'Ctrl P', description: 'Your details' }, { default: () => h(Link, { to: '#profile' }, { default: () => 'Profile' }) }) },
    })
    const menu = w.find('.oc-dropdown-menu').element as HTMLElement
    menu.showPopover()
    const a = w.find('a[data-router]')
    expect(a.attributes('href')).toBe('#profile')
    expect(a.classes()).toContain('oc-dropdown-item')
    expect(a.find('.oc-dropdown-text .oc-dropdown-desc').text()).toBe('Your details')
    expect(a.find('.oc-dropdown-hint').text()).toBe('Ctrl P')
    expect(a.text()).toContain('Profile')
    expect(w.findAll('.oc-dropdown-item').length).toBe(1)
    await a.trigger('click')
    expect(menu.dataset.testOpen).toBeUndefined()
    w.unmount()
  })
})
