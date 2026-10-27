import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, resolveComponent } from 'vue'
import {
  OmniaVue,
  OcAlert,
  OcBadge,
  OcBlockStats,
  OcButton,
  OcCommand,
  OcFormField,
  OcModal,
  OcNavmenu,
  OcPasswordInput,
  OcSegmented,
  OcTable,
  OcTagInput,
  OcToastContainer,
  useToast,
} from '../src'

// jsdom has no <dialog> behaviour yet.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

describe('OcButton', () => {
  it('renders the default button without modifiers', () => {
    const w = mount(OcButton, { slots: { default: 'Save' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.classes()).toEqual(['oc-btn'])
    expect(w.attributes('type')).toBe('button')
    expect(w.text()).toBe('Save')
  })

  it.each(['secondary', 'outline', 'ghost', 'link', 'destructive', 'success'] as const)('maps variant %s', (variant) => {
    const w = mount(OcButton, { props: { variant } })
    expect(w.classes()).toContain(`oc-btn--${variant}`)
  })

  it('maps size and flags, and renders a link with href', () => {
    const w = mount(OcButton, { props: { size: 'lg', icon: true, href: '/x' } })
    expect(w.element.tagName).toBe('A')
    expect(w.classes()).toEqual(['oc-btn', 'oc-btn--lg', 'oc-btn--icon'])
    expect(w.attributes('href')).toBe('/x')
  })
})

describe('simple components', () => {
  it('OcBadge and OcAlert use the snippet markup', () => {
    expect(mount(OcBadge, { props: { variant: 'destructive' } }).classes()).toEqual(['oc-badge', 'oc-badge--destructive'])
    const alert = mount(OcAlert, { props: { variant: 'success', title: 'Done' }, slots: { default: 'Saved' } })
    expect(alert.attributes('role')).toBe('status')
    expect(alert.find('.oc-alert-title').text()).toBe('Done')
    expect(alert.find('.oc-alert-description').text()).toBe('Saved')
  })

  it('OcFormField wires label, description and error', () => {
    const w = mount(OcFormField, {
      props: { label: 'Email', description: 'Never shared', error: 'Invalid', for: 'email' },
      slots: { default: '<input id="email" class="oc-input">' },
    })
    expect(w.find('label.oc-field-label').attributes('for')).toBe('email')
    expect(w.find('.oc-field-description').attributes('id')).toBe('email-help')
    expect(w.find('.oc-field-error').attributes('role')).toBe('alert')
  })

  it('OcSegmented updates its v-model', async () => {
    const w = mount(OcSegmented, {
      props: {
        modelValue: 'month',
        options: [
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ],
        'onUpdate:modelValue': (v: string | undefined) => w.setProps({ modelValue: v }),
      },
    })
    await w.findAll('input')[1].setValue(true)
    expect(w.props('modelValue')).toBe('year')
    expect(w.attributes('role')).toBe('radiogroup')
  })

  it('OcPasswordInput reveals the password', async () => {
    const w = mount(OcPasswordInput, { props: { modelValue: 'secret' }, attrs: { id: 'pw' } })
    expect(w.find('input').attributes('type')).toBe('password')
    expect(w.find('input').attributes('id')).toBe('pw')
    await w.find('button').trigger('click')
    expect(w.find('input').attributes('type')).toBe('text')
    expect(w.find('button').attributes('aria-pressed')).toBe('true')
    expect(w.find('button').text()).toBe('Hide')
  })

  it('OcTagInput adds and removes tags', async () => {
    const w = mount(OcTagInput, {
      props: { modelValue: ['design'], suggestions: ['design', 'partner'], 'onUpdate:modelValue': (v: string[]) => w.setProps({ modelValue: v }) },
    })
    expect(w.findAll('.oc-tag')).toHaveLength(1)
    expect(w.findAll('.oc-tag-suggestions button').map((b) => b.text())).toEqual(['partner'])
    await w.find('input').setValue('internal')
    await w.find('input').trigger('keydown', { key: 'Enter' })
    expect(w.props('modelValue')).toEqual(['design', 'internal'])
    await w.find('.oc-tag-remove').trigger('click')
    expect(w.props('modelValue')).toEqual(['internal'])
  })

  it('OcTable renders sortable columns, selection and row actions', async () => {
    const w = mount(OcTable, {
      props: {
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'balance', label: 'Balance', numeric: true },
        ],
        rows: [
          { id: 1, name: 'Ada', balance: '10.00' },
          { id: 2, name: 'Alan', balance: '0.00' },
        ],
        striped: true,
        selectable: true,
        selected: [1],
        sort: { key: 'name', direction: 'ascending' },
      },
      slots: { actions: '<a class="oc-table-row-action" href="#">Edit</a>' },
    })
    expect(w.find('table').classes()).toContain('oc-table--striped')
    expect(w.find('th[aria-sort="ascending"] a.oc-table-sort').exists()).toBe(true)
    expect(w.findAll('tbody tr')[0].attributes('aria-selected')).toBe('true')
    expect(w.findAll('td.oc-table-actions')).toHaveLength(2)
    expect(w.find('[data-numeric]').exists()).toBe(true)
  })

  it('OcCommand filters and marks the selected option', async () => {
    const w = mount(OcCommand, {
      props: {
        items: [
          { label: 'New invoice', group: 'Suggestions', shortcut: 'Ctrl N' },
          { label: 'Open contacts', group: 'Suggestions' },
          { label: 'Billing', group: 'Settings', disabled: true },
        ],
      },
    })
    expect(w.findAll('[role=option]')).toHaveLength(3)
    expect(w.findAll('[role=option]')[0].attributes('aria-selected')).toBe('true')
    expect(w.findAll('[role=option]')[2].attributes('aria-disabled')).toBe('true')
    await w.find('input').setValue('contacts')
    expect(w.findAll('[role=option]')).toHaveLength(1)
    await w.find('input').setValue('zzz')
    expect(w.find('.oc-command-empty').attributes('hidden')).toBeUndefined()
    await w.find('input').setValue('')
    await w.find('input').trigger('keydown', { key: 'Enter' })
    expect(w.emitted('select')?.[0][0]).toMatchObject({ label: 'New invoice' })
  })

  it('OcBlockStats renders the figures', () => {
    const w = mount(OcBlockStats, { props: { items: [{ value: '14', label: 'Components' }] } })
    expect(w.find('.oc-block-stat-value').text()).toBe('14')
    expect(w.classes()).toEqual(['oc-block-stats'])
  })
})

describe('OcModal', () => {
  it('opens the native dialog with showModal and follows v-model:open', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    const w = mount(OcModal, {
      props: { open: false, title: 'Are you sure?', description: 'Cannot be undone', 'onUpdate:open': (v: boolean | undefined) => w.setProps({ open: v }) },
      slots: { footer: '<button class="oc-btn">Delete</button>' },
      attachTo: document.body,
    })
    const dialog = w.find('dialog.oc-modal')
    expect(dialog.attributes('open')).toBeUndefined()
    expect(dialog.attributes('aria-labelledby')).toBe(w.find('.oc-modal-title').attributes('id'))
    await w.setProps({ open: true })
    await nextTick()
    expect(showModal).toHaveBeenCalled()
    expect(dialog.attributes('open')).toBeDefined()
    // native close (Esc / backdrop) writes back to the model
    ;(dialog.element as HTMLDialogElement).close()
    await nextTick()
    expect(w.props('open')).toBe(false)
    w.unmount()
  })
})

describe('toasts', () => {
  afterEach(() => {
    useToast().clear()
    vi.useRealTimers()
  })

  it('queues, renders and dismisses toasts', async () => {
    const toast = useToast()
    const w = mount(OcToastContainer)
    toast.success('Saved', 'Your changes are stored.')
    toast.error('Failed')
    await nextTick()
    const items = w.findAll('.oc-toast')
    expect(items).toHaveLength(2)
    expect(items[0].classes()).toContain('oc-toast--success')
    expect(items[0].attributes('role')).toBe('status')
    expect(items[1].attributes('role')).toBe('alert')
    await items[0].find('.oc-toast-close').trigger('click')
    expect(w.findAll('.oc-toast')).toHaveLength(1)
  })

  it('auto-dismisses after the duration', async () => {
    vi.useFakeTimers()
    const toast = useToast()
    const w = mount(OcToastContainer)
    toast.info('Heads up', undefined, { duration: 1000 })
    await nextTick()
    expect(w.findAll('.oc-toast')).toHaveLength(1)
    vi.advanceTimersByTime(1001)
    await nextTick()
    expect(w.findAll('.oc-toast')).toHaveLength(0)
  })
})

describe('OmniaVue plugin', () => {
  it('registers every component globally', () => {
    const App = { render: () => h(resolveComponent('OcButton') as any, { variant: 'outline' }, () => 'Hi') }
    const w = mount(App, { global: { plugins: [OmniaVue] } })
    expect(w.find('button').classes()).toContain('oc-btn--outline')
  })
})

describe('navigation', () => {
  it('OcNavmenu renders items (slot fallback) with aria-current and dropdown children', () => {
    const w = mount(OcNavmenu, {
      props: {
        label: 'Module navigation',
        items: [
          { label: 'Overview', href: '#', current: true },
          { label: 'Sales', children: [{ label: 'Quotes', href: '#q' }], heading: 'Documents' },
        ],
      },
    })
    expect(w.find('nav').attributes('aria-label')).toBe('Module navigation')
    expect(w.find('a.oc-navmenu-link').attributes('aria-current')).toBe('page')
    const trigger = w.find('button.oc-navmenu-link--caret')
    expect(w.find('.oc-dropdown-menu').attributes('id')).toBe(trigger.attributes('popovertarget'))
    expect(w.find('.oc-dropdown-item').text()).toBe('Quotes')
  })
})
