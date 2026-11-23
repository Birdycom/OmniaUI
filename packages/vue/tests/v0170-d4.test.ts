// File: packages/vue/tests/v0170-d4.test.ts
// Map: OcSidebarProvider (persist, v-model:collapsed, trigger, rail, mobile overlay via a matchMedia mock, shortcut,
//      useSidebar) -> inset / menu action / badge / sub -> OcDataTable server mode (no local slice, v-model:sort, page,
//      trashed, debounced search, query, skeleton rows, empty slot, column chooser, selection over pages)

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import OcSidebar from '../src/components/OcSidebar.vue'
import OcSidebarProvider from '../src/components/OcSidebarProvider.vue'
import OcSidebarTrigger from '../src/components/OcSidebarTrigger.vue'
import OcSidebarRail from '../src/components/OcSidebarRail.vue'
import OcSidebarInset from '../src/components/OcSidebarInset.vue'
import OcSidebarMenuAction from '../src/components/OcSidebarMenuAction.vue'
import OcSidebarMenuBadge from '../src/components/OcSidebarMenuBadge.vue'
import OcSidebarMenuSub from '../src/components/OcSidebarMenuSub.vue'
import OcDataTable from '../src/components/OcDataTable.vue'
import { useSidebar } from '../src/composables/useSidebar'

let narrow = false
const mediaListeners = new Set<() => void>()
beforeEach(() => {
  narrow = false
  mediaListeners.clear()
  window.localStorage.clear()
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() { return narrow },
    addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn),
  })) as unknown as typeof window.matchMedia
})
afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

const Shell = (props: Record<string, unknown> = {}) =>
  defineComponent({
    setup: () => () =>
      h(OcSidebarProvider, props, () => [
        h(OcSidebar, { label: 'Main' }, () => h('ul', { class: 'oc-sidebar-menu' }, h('li', [h('a', { class: 'oc-sidebar-menu-button', href: '/' }, 'Home'), h(OcSidebarMenuAction, { label: 'More', showOnHover: true })]))),
        h(OcSidebarRail),
        h(OcSidebarInset, () => [h(OcSidebarTrigger), h('p', { class: 'page' }, 'Page')]),
      ]),
  })

describe('0.17.0 OcSidebarProvider', () => {
  it('renders the parts and toggles with the trigger and the rail; persist remembers it', async () => {
    const w = mount(Shell({ persist: 'app' }), { attachTo: document.body })
    const provider = w.find('.oc-sidebar-provider')
    expect(provider.attributes('data-state')).toBe('expanded')
    expect(w.find('main.oc-sidebar-inset').exists()).toBe(true)
    const trigger = w.find('button.oc-sidebar-trigger')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.find('svg[data-webicon="mdi:menu"]').exists()).toBe(true)
    expect(w.find('button.oc-sidebar-menu-action').classes()).toContain('oc-sidebar-menu-action--hover')
    await trigger.trigger('click')
    expect(w.find('aside').classes()).toContain('oc-sidebar--collapsed')
    expect(provider.attributes('data-state')).toBe('collapsed')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(window.localStorage.getItem('oc-sidebar:app')).toBe('1')
    await w.find('button.oc-sidebar-rail').trigger('click')
    expect(w.find('aside').classes()).not.toContain('oc-sidebar--collapsed')
    expect(window.localStorage.getItem('oc-sidebar:app')).toBe('0')
    w.unmount()
  })

  it('reads the remembered state; v-model:collapsed', async () => {
    window.localStorage.setItem('oc-sidebar:app', '1')
    const w = mount(Shell({ persist: 'app' }))
    await nextTick()
    expect(w.find('aside').classes()).toContain('oc-sidebar--collapsed')
    w.unmount()
    const updates: boolean[] = []
    const c = mount(Shell({ collapsed: false, 'onUpdate:collapsed': (v: boolean) => updates.push(v) }))
    await c.find('button.oc-sidebar-trigger').trigger('click')
    expect(updates).toEqual([true])
    expect(c.find('aside').classes()).not.toContain('oc-sidebar--collapsed')
    c.unmount()
  })

  it('mobile: overlay, closed at first, Escape and a click outside close it', async () => {
    narrow = true
    const w = mount(Shell({ persist: 'm' }), { attachTo: document.body })
    await nextTick()
    const aside = () => w.find('aside').classes()
    expect(aside()).toContain('oc-sidebar--overlay')
    expect(aside()).toContain('oc-sidebar--collapsed')
    await w.find('button.oc-sidebar-trigger').trigger('pointerdown')
    await w.find('button.oc-sidebar-trigger').trigger('click')
    expect(aside()).not.toContain('oc-sidebar--collapsed')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(aside()).toContain('oc-sidebar--collapsed')
    await w.find('button.oc-sidebar-trigger').trigger('click')
    w.find('p.page').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(aside()).toContain('oc-sidebar--collapsed')
    expect(window.localStorage.getItem('oc-sidebar:m')).toBeNull()
    narrow = false
    mediaListeners.forEach((fn) => fn())
    await nextTick()
    expect(aside()).not.toContain('oc-sidebar--overlay')
    w.unmount()
  })

  it('Ctrl/Cmd+B toggles; shortcut false does not', async () => {
    const w = mount(Shell())
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))
    await nextTick()
    expect(w.find('aside').classes()).toContain('oc-sidebar--collapsed')
    w.unmount()
    const off = mount(Shell({ shortcut: false }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))
    await nextTick()
    expect(off.find('aside').classes()).not.toContain('oc-sidebar--collapsed')
    off.unmount()
  })

  it('useSidebar gives the state; badge and sub list', async () => {
    const Probe = defineComponent({
      setup() {
        const s = useSidebar()
        return () => h('button', { class: 'probe', onClick: s.toggle }, s.collapsed.value ? 'closed' : 'open')
      },
    })
    const w = mount(defineComponent({ setup: () => () => h(OcSidebarProvider, () => h(Probe)) }))
    expect(w.find('.probe').text()).toBe('open')
    await w.find('.probe').trigger('click')
    expect(w.find('.probe').text()).toBe('closed')
    const b = mount(OcSidebarMenuSub, { slots: { default: () => h('li', h(OcSidebarMenuBadge, () => '3')) } })
    expect(b.find('ul.oc-sidebar-menu-sub span.oc-sidebar-menu-badge').text()).toBe('3')
  })

  it('without a provider OcSidebar behaves as before', () => {
    const w = mount(OcSidebar, { props: { collapsed: true } })
    expect(w.classes()).toEqual(['oc-sidebar', 'oc-sidebar--collapsed'])
    const open = mount(OcSidebar)
    expect(open.classes()).toEqual(['oc-sidebar'])
  })
})

const columns = [
  { key: 'name', header: 'Name', hideable: false },
  { key: 'sku', header: 'Article ID' },
  { key: 'price', header: 'Price', numeric: true },
]
const ALL = Array.from({ length: 23 }, (_, i) => ({ key: `a${i + 1}`, cells: { name: `Article ${i + 1}`, sku: `SKU-${i + 1}`, price: String(i + 1) } }))
const visibleNames = (el: Element) => [...el.querySelectorAll<HTMLTableRowElement>('tbody tr[data-oc-row]')].filter((r) => !r.hidden).map((r) => r.cells[1].textContent)

describe('0.17.0 OcDataTable server mode', () => {
  it('shows the given rows with summary and pager from total; page clicks emit update:page', async () => {
    const w = mount(OcDataTable, { props: { tableId: 'v1', server: true, total: 23, page: 2, pageSize: 10, columns, rows: ALL.slice(10, 20) }, attachTo: document.body })
    await nextTick()
    const root = w.element as HTMLElement
    expect(root.getAttribute('data-oc-server')).toBe('true')
    expect(root.getAttribute('data-oc-current-page')).toBe('2')
    expect(visibleNames(root)).toHaveLength(10)
    expect(root.querySelector('.oc-data-table-summary')!.textContent).toBe('Showing 11–20 of 23')
    ;(root.querySelector('[data-oc-pager] [data-oc-page="3"]') as HTMLButtonElement).click()
    expect(w.emitted('update:page')!.at(-1)).toEqual([3])
    expect((w.emitted('query')!.at(-1)![0] as { reason: string }).reason).toBe('page')
    w.unmount()
  })

  it('v-model:sort and v-model:trashed; aria follows the props', async () => {
    const w = mount(OcDataTable, { props: { tableId: 'v2', server: true, total: 23, sort: null, trashed: 'active', columns, rows: ALL.slice(0, 10) }, attachTo: document.body })
    await nextTick()
    ;(w.element.querySelector('th[data-oc-col="price"] .oc-table-sort') as HTMLButtonElement).click()
    expect(w.emitted('update:sort')!.at(-1)).toEqual([{ key: 'price', dir: 'asc' }])
    expect(visibleNames(w.element)[0]).toBe('Article 1')
    await w.setProps({ sort: { key: 'price', dir: 'desc' }, trashed: 'deleted' })
    expect(w.element.querySelector('th[data-oc-col="price"]')!.getAttribute('aria-sort')).toBe('descending')
    expect(w.element.querySelector('[data-oc-filter="deleted"]')!.getAttribute('aria-current')).toBe('true')
    ;(w.element.querySelector('[data-oc-filter="all"]') as HTMLButtonElement).click()
    expect(w.emitted('update:trashed')!.at(-1)).toEqual(['all'])
    w.unmount()
  })

  it('search waits for search-delay and emits update:search', async () => {
    vi.useFakeTimers()
    const w = mount(OcDataTable, { props: { tableId: 'v3', title: 'Articles', server: true, total: 23, search: 'art', searchDelay: 100, columns, rows: ALL.slice(0, 10) }, attachTo: document.body })
    const field = w.element.querySelector('.oc-data-table-search') as HTMLInputElement
    expect(field.value).toBe('art')
    field.value = 'artic'
    field.dispatchEvent(new Event('input', { bubbles: true }))
    expect(w.emitted('update:search')).toBeUndefined()
    vi.advanceTimersByTime(120)
    expect(w.emitted('update:search')!.at(-1)).toEqual(['artic'])
    w.unmount()
  })

  it('loading shows skeleton rows; the empty slot replaces the text', async () => {
    const w = mount(OcDataTable, { props: { tableId: 'v4', server: true, loading: true, pageSize: 4, total: 0, columns, rows: [] } })
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.findAll('tr.oc-data-table-skeleton')).toHaveLength(4)
    expect(w.findAll('tr.oc-data-table-skeleton')[0].findAll('.oc-data-table-skeleton-bar')).toHaveLength(3)
    const e = mount(OcDataTable, { props: { tableId: 'v5', server: true, total: 0, columns, rows: [] }, slots: { empty: () => h('span', 'Nothing for Company 1') }, attachTo: document.body })
    await nextTick()
    const empty = e.element.querySelector('.oc-data-table-empty') as HTMLElement
    expect(empty.tagName).toBe('DIV')
    expect(empty.hidden).toBe(false)
    expect(empty.textContent).toContain('Nothing for Company 1')
    e.unmount()
  })

  it('column chooser: v-model:visible-columns renders only the checked columns', async () => {
    const visible = ref(['name', 'price'])
    const w = mount(defineComponent({
      setup: () => () => h(OcDataTable, { tableId: 'v6', columns, rows: ALL.slice(0, 2), visibleColumns: visible.value, 'onUpdate:visibleColumns': (k: string[]) => { visible.value = k } }),
    }), { attachTo: document.body })
    await nextTick()
    expect(w.find('th[data-oc-col="sku"]').exists()).toBe(false)
    expect(w.find('.oc-data-table-colpick').attributes('id')).toBe('v6-colpick')
    expect((w.find('[data-oc-visible-col="name"]').element as HTMLInputElement).disabled).toBe(true)
    await w.find('[data-oc-visible-col="sku"]').setValue(true)
    expect(visible.value).toEqual(['name', 'sku', 'price'])
    expect(w.find('th[data-oc-col="sku"]').exists()).toBe(true)
    expect(w.find('tbody td[data-oc-col="sku"]').text()).toBe('SKU-1')
    w.unmount()
  })

  it('selection is kept over pages (v-model:selected-keys)', async () => {
    const page = ref(1)
    const selected = ref<string[]>([])
    const w = mount(defineComponent({
      setup: () => () => h(OcDataTable, {
        tableId: 'v7', server: true, total: 23, page: page.value, pageSize: 10, columns, rows: ALL.slice((page.value - 1) * 10, page.value * 10),
        selectedKeys: selected.value, 'onUpdate:selectedKeys': (k: string[]) => { selected.value = k }, 'onUpdate:page': (p: number) => { page.value = p },
      }),
    }), { attachTo: document.body })
    await nextTick()
    const box = (key: string) => w.element.querySelector(`[data-oc-key="${key}"] [data-oc-select]`) as HTMLInputElement
    box('a2').click()
    expect(selected.value).toEqual(['a2'])
    ;(w.element.querySelector('[data-oc-pager] [data-oc-page="2"]') as HTMLButtonElement).click()
    await nextTick()
    await nextTick()
    expect(visibleNames(w.element)[0]).toBe('Article 11')
    box('a12').click()
    expect(selected.value).toEqual(['a2', 'a12'])
    expect(w.element.querySelector('[data-oc-selected-count]')!.textContent).toBe('2 selected')
    w.unmount()
  })

  it('without server the client table is unchanged', async () => {
    const w = mount(OcDataTable, { props: { tableId: 'v8', pageSize: 10, columns, rows: ALL } })
    await nextTick()
    expect(w.attributes('data-oc-server')).toBeUndefined()
    expect(w.attributes('aria-busy')).toBeUndefined()
    expect(visibleNames(w.element)).toHaveLength(10)
    expect(w.find('[data-oc-filter="active"]').attributes('aria-current')).toBe('true')
  })
})
