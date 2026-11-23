// File: packages/vue/tests/v0171-desk.test.ts
// Map: OcBadge status set + readonly -> OcBreadcrumb maxItems + compound parts -> OcDecimalInput currency / percent ->
//      OcBarcode fallback -> OcOtpInput active cell + complete from the v-model

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, markRaw, nextTick, ref } from 'vue'
import OcBadge from '../src/components/OcBadge.vue'
import OcBreadcrumb from '../src/components/OcBreadcrumb.vue'
import OcBreadcrumbList from '../src/components/OcBreadcrumbList.vue'
import OcBreadcrumbItem from '../src/components/OcBreadcrumbItem.vue'
import OcBreadcrumbLink from '../src/components/OcBreadcrumbLink.vue'
import OcBreadcrumbPage from '../src/components/OcBreadcrumbPage.vue'
import OcBreadcrumbSeparator from '../src/components/OcBreadcrumbSeparator.vue'
import OcBreadcrumbEllipsis from '../src/components/OcBreadcrumbEllipsis.vue'
import OcDecimalInput from '../src/components/OcDecimalInput.vue'
import OcBarcode from '../src/components/OcBarcode.vue'
import OcOtpInput from '../src/components/OcOtpInput.vue'
import OcBlockAppHeader from '../src/blocks/OcBlockAppHeader.vue'
import { badgeStatuses } from '../src/badgeStatus'

describe('0.17.1 status badges', () => {
  it('status sets the class, data-status, its icon and its label', () => {
    const w = mount(OcBadge, { props: { status: 'paid' } })
    expect(w.classes()).toEqual(['oc-badge', 'oc-badge--status'])
    expect(w.attributes('data-status')).toBe('paid')
    expect(w.text()).toBe('Paid')
    expect(w.find('svg, iconify-icon').exists()).toBe(true)
  })

  it('the slot translates the label, icon false hides the icon, an unknown status only sets data-status', () => {
    expect(mount(OcBadge, { props: { status: 'overdue' }, slots: { default: 'Vervallen' } }).text()).toBe('Vervallen')
    const plain = mount(OcBadge, { props: { status: 'draft', icon: false } })
    expect(plain.find('svg, iconify-icon').exists()).toBe(false)
    expect(plain.text()).toBe('Draft')
    const own = mount(OcBadge, { props: { status: 'on-hold' }, slots: { default: 'On hold' } })
    expect(own.attributes('data-status')).toBe('on-hold')
    expect(own.find('svg, iconify-icon').exists()).toBe(false)
    expect(Object.keys(badgeStatuses)).toContain('read-only')
  })

  it('variant readonly wraps the text', () => {
    const w = mount(OcBadge, { props: { variant: 'readonly', icon: 'mdi:account-outline' }, slots: { default: 'Customer 1' } })
    expect(w.classes()).toContain('oc-badge--readonly')
    expect(w.find(':scope > span').text()).toBe('Customer 1')
  })
})

describe('0.17.1 breadcrumb', () => {
  const trail = [
    { label: 'Dashboard', href: '/' },
    { label: 'Relations', href: '/relations' },
    { label: 'Customers', href: '/customers' },
    { label: 'Company 1', href: '/customers/1' },
    { label: 'Projects', href: '/customers/1/projects' },
    { label: 'Kitchen' },
  ]

  it('maxItems folds the middle into a … button with a menu', () => {
    const w = mount(OcBreadcrumb, { props: { items: trail, maxItems: 4 } })
    const items = w.findAll('nav > .oc-breadcrumb-item')
    expect(items).toHaveLength(4)
    const button = w.find('button.oc-breadcrumb-ellipsis')
    expect(button.attributes('aria-label')).toBe('Show 3 more levels')
    const menu = w.find(`[id="${button.attributes('popovertarget')}"]`)
    expect(menu.findAll('a.oc-dropdown-item').map((a) => a.text())).toEqual(['Relations', 'Customers', 'Company 1'])
    expect(items[3].attributes('aria-current')).toBe('page')
  })

  it('compound parts render an ordered list with li items', () => {
    const w = mount(OcBreadcrumb, {
      props: { separator: 'chevron' },
      slots: {
        default: () =>
          h(OcBreadcrumbList, null, () => [
            h(OcBreadcrumbItem, null, () => h(OcBreadcrumbLink, { href: '/', icon: 'mdi:home-outline' }, () => 'Dashboard')),
            h(OcBreadcrumbSeparator),
            h(OcBreadcrumbItem, null, () => h(OcBreadcrumbEllipsis, { items: [{ label: 'Customers', href: '/customers' }] })),
            h(OcBreadcrumbItem, null, () => h(OcBreadcrumbPage, null, () => 'Kitchen')),
          ]),
      },
    })
    const lis = w.findAll('ol > li')
    expect(lis).toHaveLength(4)
    expect(lis[0].classes()).toContain('oc-breadcrumb-item')
    expect(lis[0].find('a').attributes('href')).toBe('/')
    expect(lis[1].classes()).toContain('oc-breadcrumb-separator')
    expect(lis[1].find('svg, iconify-icon').exists()).toBe(true)
    expect(w.find('button').attributes('aria-label')).toBe('Show 1 more levels')
    expect(w.find('[aria-current="page"]').text()).toBe('Kitchen')
  })

  it('a link renders your router component with as', () => {
    const RouterLink = { props: ['to'], template: '<a :href="to"><slot /></a>' }
    const w = mount(OcBreadcrumbLink, { props: { as: markRaw(RouterLink) }, attrs: { to: '/projects' }, slots: { default: 'Projects' } })
    expect(w.find('a').attributes('href')).toBe('/projects')
  })
})

describe('0.17.1 decimal input presets', () => {
  it('currency EUR: € before the value, nl-BE notation', () => {
    const w = mount(OcDecimalInput, { props: { currency: 'EUR', modelValue: 1234.5 } })
    expect(w.classes()).toContain('oc-input-group--affix')
    expect(w.attributes('data-currency')).toBe('EUR')
    expect(w.element.firstElementChild!.textContent).toBe('€')
    expect((w.find('input').element as HTMLInputElement).value).toBe('1.234,50')
  })

  it('percent: % after the value', async () => {
    const w = mount(OcDecimalInput, { props: { percent: true, modelValue: 21, 'onUpdate:modelValue': (v: number | null) => w.setProps({ modelValue: v }) } })
    expect(w.element.lastElementChild!.textContent).toBe('%')
    await w.find('input').setValue('6,5')
    expect(w.props('modelValue')).toBe(6.5)
  })
})

describe('0.17.1 barcode fallback', () => {
  it('draws a wrong check digit as Code 128', () => {
    const w = mount(OcBarcode, { props: { value: '4006381333932', fallback: 'code128' } })
    expect(w.attributes('data-fallback-used')).toBe('')
    expect(w.find('svg').exists()).toBe(true)
    expect(mount(OcBarcode, { props: { value: '4006381333932' } }).attributes('data-error')).toBe('')
  })
})

describe('0.17.1 otp input', () => {
  it('complete fires when the v-model arrives complete from outside, once per code', async () => {
    const code = ref('')
    const w = mount(OcOtpInput, { props: { modelValue: code.value } })
    await w.setProps({ modelValue: '123456' })
    await nextTick()
    expect(w.emitted('complete')).toEqual([['123456']])
    await w.setProps({ modelValue: '123456' })
    expect(w.emitted('complete')).toHaveLength(1)
    await w.setProps({ modelValue: '' })
    await w.setProps({ modelValue: '123456' })
    expect(w.emitted('complete')).toHaveLength(2)
  })

  it('a complete value on mount counts', async () => {
    const w = mount(OcOtpInput, { props: { modelValue: '654321' } })
    await nextTick()
    expect(w.emitted('complete')).toEqual([['654321']])
  })

  it('marks the active cell while it has focus', async () => {
    const w = mount(OcOtpInput, { props: { modelValue: '12' }, attachTo: document.body })
    const input = w.find('input').element as HTMLInputElement
    input.focus()
    input.setSelectionRange(2, 2)
    input.dispatchEvent(new Event('keyup'))
    expect(input.getAttribute('data-otp-active')).toBe('2')
    input.blur()
    expect(input.hasAttribute('data-otp-active')).toBe(false)
    w.unmount()
  })
})

describe('0.17.1 app header search collapse', () => {
  it('searchCollapse adds the modifier to the search slot', () => {
    const w = mount(OcBlockAppHeader, { props: { searchCollapse: true }, slots: { search: '<input class="oc-input" type="search" aria-label="Search">' } })
    expect(w.find('.oc-block-appbar-search').classes()).toEqual(['oc-block-appbar-search', 'oc-block-appbar-search--collapse'])
  })
})
