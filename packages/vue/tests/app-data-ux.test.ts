// File: packages/vue/tests/app-data-ux.test.ts
// Map: dialog shim -> data components (table actions, column menu, sortable row, tree, table compact, list toolbar, alpha tabs)
//      -> app UX components (top progress, confirm dialog, version banner, greeting, stat card, severity card,
//         upgrade banner, page header, accordion accent)
// Group B (data and app UX) Vue wrappers: same markup as the snippets, plus their v-model / emits.
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import OcTableActions from '../src/components/OcTableActions.vue'
import OcColumnMenu from '../src/components/OcColumnMenu.vue'
import OcSortableRow from '../src/components/OcSortableRow.vue'
import OcTree from '../src/components/OcTree.vue'
import OcTableCompact from '../src/components/OcTableCompact.vue'
import OcListToolbar from '../src/components/OcListToolbar.vue'
import OcAlphaTabs from '../src/components/OcAlphaTabs.vue'
import OcTopProgress from '../src/components/OcTopProgress.vue'
import OcConfirmDialog from '../src/components/OcConfirmDialog.vue'
import OcVersionBanner from '../src/components/OcVersionBanner.vue'
import OcGreeting from '../src/components/OcGreeting.vue'
import OcStatCard from '../src/components/OcStatCard.vue'
import OcSeverityCard from '../src/components/OcSeverityCard.vue'
import OcUpgradeBanner from '../src/components/OcUpgradeBanner.vue'
import OcPageHeader from '../src/components/OcPageHeader.vue'
import OcAccordionAccent from '../src/components/OcAccordionAccent.vue'
import OcAccordionItem from '../src/components/OcAccordionItem.vue'

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

describe('data components', () => {
  it('OcTableActions renders a menu trigger wired to its popover', () => {
    const w = mount(OcTableActions, { props: { menuLabel: 'Actions for Ada' }, slots: { default: '<a class="oc-dropdown-item">View</a>' } })
    const menu = w.find('.oc-dropdown-menu')
    expect(menu.attributes('popover')).toBeDefined()
    expect(w.find('.oc-table-actions-more').attributes('popovertarget')).toBe(menu.attributes('id'))
  })

  it('OcColumnMenu numbers the checkboxes and emits toggle', async () => {
    const w = mount(OcColumnMenu, { props: { columns: [{ label: 'Name', locked: true }, { label: 'Phone', visible: false }] } })
    const boxes = w.findAll('input[data-col]')
    expect(boxes[0].attributes('disabled')).toBeDefined()
    await boxes[1].setValue(true)
    expect(w.emitted('toggle')?.[0]).toEqual([2, true])
  })

  it('OcSortableRow shows drag states', () => {
    const w = mount({ render: () => h('table', h('tbody', h(OcSortableRow, { gripLabel: 'Move Install', dragging: true, drop: 'before' }))) })
    const row = w.find('tr')
    expect(row.classes()).toEqual(expect.arrayContaining(['oc-sortable-row', 'is-dragging', 'is-drop-before']))
    expect(w.find('.oc-sortable-row-grip').attributes('aria-label')).toBe('Move Install')
  })

  it('OcTree renders nested folders and the current leaf', () => {
    const w = mount(OcTree, { props: { items: [{ label: 'Kitchen', open: true, children: [{ label: 'Quote', href: '/q', current: true }] }] } })
    expect(w.find('details.oc-tree-node').attributes('open')).toBeDefined()
    expect(w.find('a.oc-tree-label').attributes('aria-current')).toBe('true')
  })

  it('OcTableCompact builds the table', () => {
    const w = mount(OcTableCompact, { props: { columns: [{ key: 'n', label: 'Item' }, { key: 'q', label: 'Qty', numeric: true }], rows: [{ n: 'Sink', q: 1 }], footer: { n: 'Total' } } })
    expect(w.find('tbody td[data-numeric]').text()).toBe('1')
    expect(w.find('tfoot').text()).toContain('Total')
  })

  it('OcListToolbar updates v-model:view', async () => {
    const w = mount(OcListToolbar, { props: { views: [{ value: 'cards', label: 'Cards' }, { value: 'table', label: 'Table' }], view: 'cards' } })
    await w.find('input[value="table"]').setValue(true)
    expect(w.emitted('update:view')?.[0]).toEqual(['table'])
  })

  it('OcAlphaTabs disables empty letters and updates v-model', async () => {
    const w = mount(OcAlphaTabs, { props: { letters: ['A', 'B'], available: ['A'] } })
    const buttons = w.findAll('button')
    expect(buttons[0].attributes('aria-current')).toBe('true')
    expect(buttons[2].attributes('disabled')).toBeDefined()
    await buttons[1].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['A'])
  })
})

describe('app UX components', () => {
  it('OcTopProgress fades out and hides', async () => {
    vi.useFakeTimers()
    const w = mount(OcTopProgress)
    await w.setProps({ active: false })
    expect(w.classes()).toContain('is-done')
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(w.attributes('hidden')).toBeDefined()
    vi.useRealTimers()
  })

  it('OcConfirmDialog emits confirm and closes', async () => {
    const w = mount(OcConfirmDialog, { props: { open: true, title: 'Delete?', confirmWord: 'DELETE' }, attachTo: document.body })
    expect(w.find('.oc-alert-dialog-typed input').attributes('pattern')).toBe('DELETE')
    await w.find('form').trigger('submit')
    expect(w.emitted('confirm')).toBeTruthy()
    expect(w.emitted('update:open')?.[0]).toEqual([false])
    w.unmount()
  })

  it('OcVersionBanner renders only with a version', async () => {
    const w = mount(OcVersionBanner)
    expect(w.find('.oc-version-banner').exists()).toBe(false)
    await w.setProps({ version: 'v0.6.0' })
    expect(w.find('[role="status"]').text()).toContain('v0.6.0')
  })

  it('OcGreeting picks the time of day', () => {
    const w = mount(OcGreeting, { props: { name: 'Ada', date: new Date(2026, 9, 15, 8), locale: 'en-GB' } })
    expect(w.classes()).toContain('oc-greeting--morning')
    expect(w.find('time').attributes('datetime')).toBe('2026-10-15')
  })

  it('OcStatCard becomes a link with href', () => {
    const w = mount(OcStatCard, { props: { value: 7, label: 'Open orders', href: '/orders', tone: 'accent', trend: '+2' } })
    expect(w.element.tagName).toBe('A')
    expect(w.classes()).toContain('oc-stat-card--accent')
  })

  it('OcSeverityCard shows level and tags', () => {
    const w = mount(OcSeverityCard, { props: { level: 'critical', title: 'Bank details', tags: ['iban'] } })
    expect(w.classes()).toContain('oc-severity-card--critical')
    expect(w.find('.oc-severity-card-level').text()).toBe('Critical')
  })

  it('OcUpgradeBanner shows usage and emits dismiss', async () => {
    const w = mount(OcUpgradeBanner, { props: { title: 'Free plan', usage: { label: 'Projects', value: 4, max: 5 }, dismissible: true } })
    expect(w.find('meter').attributes('value')).toBe('4')
    await w.find('.oc-upgrade-banner-dismiss').trigger('click')
    expect(w.emitted('dismiss')).toBeTruthy()
  })

  it('OcPageHeader renders the heading level', () => {
    const w = mount(OcPageHeader, { props: { title: 'Invoices', level: 2 } })
    expect(w.find('h2.oc-page-header-title').text()).toBe('Invoices')
  })

  it('OcAccordionAccent shares the group name with its items', () => {
    const w = mount(OcAccordionAccent, { props: { accent: 'violet' }, slots: { default: () => [h(OcAccordionItem, { title: 'One' }), h(OcAccordionItem, { title: 'Two' })] } })
    expect(w.classes()).toEqual(expect.arrayContaining(['oc-accordion--accent', 'oc-accent--violet']))
    const names = w.findAll('details').map((d) => d.attributes('name'))
    expect(names[0]).toBeTruthy()
    expect(names[0]).toBe(names[1])
  })
})
