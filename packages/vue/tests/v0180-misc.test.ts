// File: packages/vue/tests/v0180-misc.test.ts
// Map: OcBackLink @back + as -> OcCard bare -> OcScrollArea bare -> OcStepper isStepEnabled -> OcCommand slot items
//      -> OcDecimalInput rounding / integer / allowNegative -> OcPhoneInput country grouping -> OcTimeInput slotsPopover
//      -> breadcrumb ellipsis + chevron as inline SVG
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Fragment, defineComponent, h, markRaw, nextTick, ref } from 'vue'
import OcBackLink from '../src/components/OcBackLink.vue'
import OcCard from '../src/components/OcCard.vue'
import OcScrollArea from '../src/components/OcScrollArea.vue'
import OcStepper from '../src/components/OcStepper.vue'
import OcCommand from '../src/components/OcCommand.vue'
import OcCommandGroup from '../src/components/OcCommandGroup.vue'
import OcCommandItem from '../src/components/OcCommandItem.vue'
import OcDecimalInput from '../src/components/OcDecimalInput.vue'
import OcPhoneInput from '../src/components/OcPhoneInput.vue'
import OcTimeInput from '../src/components/OcTimeInput.vue'
import OcBreadcrumb from '../src/components/OcBreadcrumb.vue'
import OcBreadcrumbList from '../src/components/OcBreadcrumbList.vue'
import OcBreadcrumbItem from '../src/components/OcBreadcrumbItem.vue'
import OcBreadcrumbEllipsis from '../src/components/OcBreadcrumbEllipsis.vue'
import OcBreadcrumbSeparator from '../src/components/OcBreadcrumbSeparator.vue'

const click = (init: MouseEventInit = {}) => new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })

describe('OcBackLink @back + as (0.18.0)', () => {
  it('with a back listener a plain click emits back instead of navigating', () => {
    const onBack = vi.fn()
    const w = mount(OcBackLink, { props: { href: '#products', onBack }, slots: { default: () => 'Back to Products' } })
    const event = click()
    w.element.dispatchEvent(event)
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('modified clicks keep the browser behaviour; without a listener it is a plain link', () => {
    const onBack = vi.fn()
    const w = mount(OcBackLink, { props: { href: '#products', onBack } })
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
      const event = click(init)
      w.element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(onBack).not.toHaveBeenCalled()
    const plain = mount(OcBackLink, { props: { href: '#x' } })
    const event = click()
    plain.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('renders another component with `as`; `to` falls through', () => {
    const Link = markRaw(defineComponent({ props: { to: String }, setup: (p, { slots }) => () => h('a', { href: p.to, 'data-router': 'yes' }, slots.default?.()) }))
    const w = mount(OcBackLink, { props: { as: Link }, attrs: { to: '/customers' }, slots: { default: () => 'Back to Customers' } })
    expect(w.element.tagName).toBe('A')
    expect(w.classes()).toContain('oc-back-link')
    expect(w.attributes('data-router')).toBe('yes')
    expect(w.attributes('href')).toBe('/customers')
  })
})

describe('OcCard / OcScrollArea bare (0.18.0)', () => {
  it('card bare: no content wrapper and oc-card--bare', () => {
    const w = mount(OcCard, { props: { bare: true, title: 'Customers' }, slots: { default: () => h('table', { class: 'oc-table' }), action: () => '3' } })
    expect(w.classes()).toEqual(['oc-card', 'oc-card--bare'])
    expect(w.find('.oc-card-content').exists()).toBe(false)
    expect(w.find('.oc-card-header > .oc-card-action').text()).toBe('3')
    expect(mount(OcCard).classes()).toEqual(['oc-card'])
  })

  it('scroll area bare', () => {
    const w = mount(OcScrollArea, { props: { bare: true, label: 'Activity' } })
    expect(w.classes()).toEqual(['oc-scroll-area', 'oc-scroll-area--bare'])
    expect(w.attributes('role')).toBe('region')
    expect(w.attributes('tabindex')).toBe('0')
  })
})

describe('OcStepper isStepEnabled (0.18.0)', () => {
  const steps = [{ label: 'Company' }, { label: 'Invoicing' }, { label: 'Banking' }, { label: 'Team' }]

  it('default stays: done and active enabled', () => {
    const w = mount(OcStepper, { props: { steps, modelValue: 1 } })
    expect(w.findAll('button').map((b) => b.attributes('disabled') !== undefined)).toEqual([false, false, true, true])
  })

  it('a later step can be enabled and opened; aria-current only on the active step', async () => {
    const w = mount(OcStepper, { props: { steps, modelValue: 1, isStepEnabled: (i: number) => i !== 2, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const buttons = w.findAll('button')
    expect(buttons.map((b) => b.attributes('disabled') !== undefined)).toEqual([false, false, true, false])
    expect(buttons.map((b) => b.attributes('aria-current') ?? null)).toEqual([null, 'step', null, null])
    await buttons[3].trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([3])
    await nextTick()
    expect(w.findAll('button').map((b) => b.attributes('aria-current') ?? null)).toEqual([null, null, null, 'step'])
  })
})

describe('OcCommand slot items (0.18.0)', () => {
  it('reads OcCommandGroup / OcCommandItem from the slot; keyboard flow and select still work', async () => {
    const onNew = vi.fn()
    const w = mount(OcCommand, {
      slots: {
        default: () => [
          h(OcCommandGroup, { label: 'Invoices' }, () => [
            h(OcCommandItem, { value: 'new', shortcut: 'Ctrl N', onSelect: onNew }, () => [h('strong', 'New'), ' invoice']),
            h(OcCommandItem, { value: 'list' }, () => 'All invoices'),
          ]),
          h(OcCommandGroup, { label: 'Customers' }, () => ['Customer 1', 'Customer 2'].map((c) => h(OcCommandItem, { key: c }, () => c))),
        ],
      },
    })
    expect(w.findAll('.oc-command-group-label').map((l) => l.text())).toEqual(['Invoices', 'Customers'])
    const items = w.findAll('.oc-command-item')
    expect(items).toHaveLength(4)
    expect(items[0].find('strong').text()).toBe('New')
    expect(items[0].find('.oc-command-shortcut').text()).toBe('Ctrl N')
    expect(items[0].attributes('aria-selected')).toBe('true')
    const input = w.find('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(w.findAll('.oc-command-item')[1].attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(onNew).toHaveBeenCalledWith({ label: 'New invoice', value: 'new', group: 'Invoices', shortcut: 'Ctrl N' })
    expect(w.emitted('select')![0]).toEqual([{ label: 'New invoice', value: 'new', group: 'Invoices', shortcut: 'Ctrl N' }])
    await input.setValue('customer 2')
    expect(w.findAll('.oc-command-item').map((i) => i.text())).toEqual(['Customer 2'])
  })

  it('finds items in v-for fragments, but not inside an own wrapper component (docs: Items in your own component)', () => {
    const customers = [{ id: 'c1', name: 'Customer 1' }, { id: 'c2', name: 'Customer 2' }]
    const CustomerItem = defineComponent({
      props: { id: { type: String, required: true }, name: { type: String, required: true } },
      setup: (props) => () => h(OcCommandItem, { value: props.id }, () => props.name),
    })
    const labels = (w: ReturnType<typeof mount>) => w.findAll('.oc-command-item').map((i) => i.text())

    const wrong = mount(OcCommand, {
      slots: {
        default: () => [
          h(OcCommandGroup, { label: 'Invoices' }, () => [h(OcCommandItem, { value: 'new' }, () => 'New invoice')]),
          h(OcCommandGroup, { label: 'Customers' }, () => customers.map((c) => h(CustomerItem, { key: c.id, id: c.id, name: c.name }))),
        ],
      },
    })
    expect(labels(wrong)).toEqual(['New invoice'])

    // v-for compiles to a Fragment of vnodes: those are walked.
    const right = mount(OcCommand, {
      slots: {
        default: () => [
          h(OcCommandGroup, { label: 'Invoices' }, () => [h(OcCommandItem, { value: 'new' }, () => 'New invoice')]),
          h(OcCommandGroup, { label: 'Customers' }, () => [h(Fragment, null, customers.map((c) => h(OcCommandItem, { key: c.id, value: c.id }, () => c.name)))]),
        ],
      },
    })
    expect(labels(right)).toEqual(['New invoice', 'Customer 1', 'Customer 2'])
  })

  it('items prop keeps working and emits the same object', async () => {
    const item = { label: 'Alpha', value: 'a' }
    const w = mount(OcCommand, { props: { items: [item] } })
    await w.find('.oc-command-item').trigger('click')
    expect(w.emitted('select')![0][0]).toStrictEqual(item)
  })
})

describe('OcDecimalInput rounding, integer, allowNegative (0.18.0)', () => {
  it('rounds half away from zero (1,005 and 2,675 in nl-BE) and reports the rounded value', async () => {
    const value = ref<number | null>(null)
    const w = mount(OcDecimalInput, { props: { locale: 'nl-BE', modelValue: value.value, 'onUpdate:modelValue': (v: number | null) => (value.value = v) } })
    const input = w.find('input')
    await input.setValue('2,675')
    expect(value.value).toBe(2.68)
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('2,68')
    await input.setValue('1,005')
    expect(value.value).toBe(1.01)
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('1,01')
    const shown = mount(OcDecimalInput, { props: { modelValue: 1.005 } })
    expect((shown.find('input').element as HTMLInputElement).value).toBe('1,01')
  })

  it('integer and allowNegative false', async () => {
    const value = ref<number | null>(null)
    const w = mount(OcDecimalInput, { props: { integer: true, allowNegative: false, 'onUpdate:modelValue': (v: number | null) => (value.value = v) } })
    const input = w.find('input')
    expect(input.attributes('inputmode')).toBe('numeric')
    await input.setValue('-12,7')
    expect((input.element as HTMLInputElement).value).toBe('127')
    expect(value.value).toBe(127)
    const neg = ref<number | null>(null)
    const d = mount(OcDecimalInput, { props: { 'onUpdate:modelValue': (v: number | null) => (neg.value = v) } })
    await d.find('input').setValue('-5,25')
    expect(neg.value).toBe(-5.25)
    expect(d.find('input').attributes('inputmode')).toBe('decimal')
  })
})

describe('OcPhoneInput country grouping (0.18.0)', () => {
  it('groups the number like the chosen country', async () => {
    const w = mount(OcPhoneInput, { props: { modelValue: '+31612345678' } })
    expect((w.find('.oc-phone-input-number').element as HTMLInputElement).value).toBe('6 12 34 56 78')
    const be = mount(OcPhoneInput, { props: { modelValue: '+32470123456' } })
    expect((be.find('.oc-phone-input-number').element as HTMLInputElement).value).toBe('470 12 34 56')
    const own = mount(OcPhoneInput, { props: { modelValue: '+4412345678', countries: [{ dial: '+44', label: 'UK +44', groups: [4, 4] }] } })
    expect((own.find('.oc-phone-input-number').element as HTMLInputElement).value).toBe('1234 5678')
  })
})

describe('OcTimeInput slotsPopover (0.18.0)', () => {
  it('slots in a native popover; a picked slot fills the field', async () => {
    const value = ref('09:00')
    const w = mount(OcTimeInput, { props: { slots: ['09:00', '09:30'], slotsPopover: true, modelValue: value.value, 'onUpdate:modelValue': (v: string) => { value.value = v; w.setProps({ modelValue: v }) } } })
    const root = w.find('.oc-time-picker')
    expect(root.exists()).toBe(true)
    expect(w.find('datalist').exists()).toBe(false)
    const panel = w.find('.oc-popover')
    expect(w.find('button').attributes('popovertarget')).toBe(panel.attributes('id'))
    expect(panel.attributes('popover')).toBe('auto')
    const radios = w.findAll('input[type="radio"]')
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    await radios[1].setValue(true)
    expect(value.value).toBe('09:30')
    await nextTick()
    expect((w.find('input.oc-time-input').element as HTMLInputElement).value).toBe('09:30')
  })

  it('without slotsPopover the datalist stays', () => {
    const w = mount(OcTimeInput, { props: { slots: ['09:00'] } })
    expect(w.find('datalist').exists()).toBe(true)
    expect(w.find('.oc-time-picker').exists()).toBe(false)
  })
})

describe('Breadcrumb icons as inline SVG (0.18.0)', () => {
  it('ellipsis and chevron separator without iconify-icon', () => {
    const w = mount(OcBreadcrumb, {
      props: { separator: 'chevron' },
      slots: {
        default: () =>
          h(OcBreadcrumbList, null, () => [
            h(OcBreadcrumbItem, null, () => h(OcBreadcrumbEllipsis, { items: [{ label: 'Customers', href: '/c' }] })),
            h(OcBreadcrumbSeparator),
            h(OcBreadcrumbItem, null, () => h(OcBreadcrumbEllipsis)),
          ]),
      },
    })
    expect(w.find('iconify-icon').exists()).toBe(false)
    expect(w.findAll('svg[data-webicon="mdi:dots-horizontal"]')).toHaveLength(2)
    expect(w.find('.oc-breadcrumb-separator svg[data-webicon="mdi:chevron-right"]').exists()).toBe(true)
  })
})
