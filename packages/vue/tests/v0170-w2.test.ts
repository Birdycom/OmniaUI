// File: packages/vue/tests/v0170-w2.test.ts
// Map: paper -> footerbar -> tag list -> toc -> expandable table + show more -> demo panel -> product card -> badge source
//      -> icon list -> shot grid + browser frame mark -> tree icon/actions -> meter row value slot -> timeline compact
//      -> table compact footer span -> color select title -> alert dialog discard -> phone input dial

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcPaper from '../src/components/OcPaper.vue'
import OcPaperLift from '../src/components/OcPaperLift.vue'
import OcFooterbar from '../src/components/OcFooterbar.vue'
import OcTagList from '../src/components/OcTagList.vue'
import OcToc from '../src/components/OcToc.vue'
import OcExpandableTable from '../src/components/OcExpandableTable.vue'
import OcShowMore from '../src/components/OcShowMore.vue'
import OcDemoPanel from '../src/components/OcDemoPanel.vue'
import OcProductCard from '../src/components/OcProductCard.vue'
import OcBadgeSource from '../src/components/OcBadgeSource.vue'
import OcIconList from '../src/components/OcIconList.vue'
import OcShotGrid from '../src/components/OcShotGrid.vue'
import OcBrowserFrame from '../src/components/OcBrowserFrame.vue'
import OcTree from '../src/components/OcTree.vue'
import OcMeterRow from '../src/components/OcMeterRow.vue'
import OcTimeline from '../src/components/OcTimeline.vue'
import OcTableCompact from '../src/components/OcTableCompact.vue'
import OcColorSelect from '../src/components/OcColorSelect.vue'
import OcAlertDialog from '../src/components/OcAlertDialog.vue'
import OcPhoneInput from '../src/components/OcPhoneInput.vue'

describe('0.17.0 W2 paper', () => {
  it('classes follow the snippet order; lift and theme', () => {
    expect(mount(OcPaper, { props: { sheet: true, lined: true, margin: true } }).classes()).toEqual(['oc-paper', 'oc-paper--sheet', 'oc-paper--lined', 'oc-paper--margin'])
    const s = mount(OcPaper, { props: { as: 'section', theme: true, tone: 'gray', squares: true, edge: 'zigzag' } })
    expect(s.element.tagName).toBe('SECTION')
    expect(s.classes()).toEqual(['oc-paper-theme', 'oc-paper', 'oc-paper--gray', 'oc-paper--grid', 'oc-paper--zigzag'])
    expect(mount(OcPaperLift, { slots: { default: 'x' } }).classes()).toEqual(['oc-paper-lift'])
  })
})

describe('0.17.0 W2 footerbar', () => {
  it('plain and split with links', () => {
    expect(mount(OcFooterbar, { slots: { default: 'Version 1' } }).html()).toBe('<footer class="oc-footerbar">Version 1</footer>')
    const w = mount(OcFooterbar, { props: { dark: true, split: true, tall: true, links: [{ href: '/privacy', label: 'Privacy' }] }, slots: { default: '© 2026 Company 1' } })
    expect(w.classes()).toEqual(['oc-footerbar', 'oc-footerbar--dark', 'oc-footerbar--split', 'oc-footerbar--tall'])
    expect(w.find(':scope > span').text()).toBe('© 2026 Company 1')
    expect(w.find('ul.oc-footerbar-links a').attributes('href')).toBe('/privacy')
  })
})

describe('0.17.0 W2 tag list', () => {
  it('items, neutral, lg', () => {
    const w = mount(OcTagList, { props: { items: ['Brand 1', 'Brand 2'], neutral: true, size: 'lg' } })
    expect(w.classes()).toEqual(['oc-tag-list', 'oc-tag-list--neutral', 'oc-tag-list--lg'])
    expect(w.findAll('li')).toHaveLength(2)
  })
})

describe('0.17.0 W2 toc', () => {
  it('title, sub item, current and groups', () => {
    const w = mount(OcToc, { props: { spy: false, title: 'On this page', items: [{ href: '#a', label: 'A' }, { href: '#b', label: 'B', sub: true, current: true }] } })
    expect(w.attributes('aria-label')).toBe('On this page')
    expect(w.find('li.oc-toc-item--sub a.oc-toc-link').attributes('aria-current')).toBe('true')
    const g = mount(OcToc, { props: { groups: [{ label: 'Articles', items: [{ href: '#x', label: '1' }] }, { label: 'Annexes', items: [{ href: '#y', label: '2' }] }] } })
    expect(g.findAll('.oc-toc-group-label').map((p) => p.text())).toEqual(['Articles', 'Annexes'])
    g.unmount()
  })
})

describe('0.17.0 W2 expandable table', () => {
  it('dimmed and hidden rows, toggle label', () => {
    const rows = [1, 2, 3, 4].map((n) => ({ name: `Row ${n}` }))
    const w = mount(OcExpandableTable, { props: { visible: 2, columns: [{ key: 'name', label: 'Name' }], rows } })
    expect(w.findAll('tbody tr').map((tr) => tr.attributes('class') ?? '')).toEqual(['', 'oc-expandable-table__row-dimmed', 'oc-expandable-table__row-more', 'oc-expandable-table__row-more'])
    expect(w.find('label').classes()).toEqual(['oc-btn', 'oc-btn--secondary', 'oc-expandable-table__trigger'])
    expect(w.find('input.oc-expandable-table__toggle').exists()).toBe(true)
  })
  it('show more', () => {
    const w = mount(OcShowMore, { slots: { default: '<p>Short</p>', extra: 'Extra' } })
    expect(w.find('.oc-showmore__extra').text()).toBe('Extra')
    expect(w.find('label').classes()).toEqual(['oc-btn', 'oc-btn--outline', 'oc-btn--toggle'])
  })
})

describe('0.17.0 W2 demo panel', () => {
  it('tabs and code', () => {
    const w = mount(OcDemoPanel, { props: { name: 'v1', code: '<button>Save</button>' }, slots: { default: '<button>Save</button>' } })
    expect(w.classes()).toEqual(['oc-demo', 'oc-demo--tabs'])
    const radios = w.findAll('.oc-demo__tab input[type=radio]')
    expect(radios.map((r) => r.attributes('name'))).toEqual(['v1', 'v1'])
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    expect(w.find('.oc-demo__code pre.oc-code-window__body code').text()).toBe('<button>Save</button>')
    const stacked = mount(OcDemoPanel, { props: { tabs: false, center: true } })
    expect(stacked.classes()).toEqual(['oc-demo'])
    expect(stacked.find('.oc-demo__preview').classes()).toEqual(['oc-demo__preview', 'oc-demo__preview--center'])
  })
})

describe('0.17.0 W2 product card', () => {
  it('link with badge and fly-in', () => {
    const w = mount(OcProductCard, { props: { href: '#p2', name: 'Product 2', badge: 'New', tagline: 'Quotes', more: 'Read more', accent: 'green', fly: true, flyX: '-40px' }, slots: { default: 'Summary' } })
    expect(w.element.tagName).toBe('A')
    expect(w.classes()).toContain('oc-reveal--fly')
    expect(w.classes()).toContain('oc-accent--green')
    expect((w.element as HTMLElement).style.getPropertyValue('--oc-fly-x')).toBe('-40px')
    expect(w.find('.oc-product-card__name .oc-product-card__badge.oc-pill.oc-pill--accent').text()).toBe('New')
    expect(w.classes()).toContain('is-visible')
    expect(mount(OcProductCard, { props: { name: 'P' } }).element.tagName).toBe('ARTICLE')
  })
})

describe('0.17.0 W2 badge source', () => {
  it('three kinds', () => {
    expect(mount(OcBadgeSource).classes()).toEqual(['oc-badge-source'])
    expect(mount(OcBadgeSource, { props: { kind: 'file' } }).classes()).toEqual(['oc-badge-source-file'])
    expect(mount(OcBadgeSource, { props: { kind: 'scss' } }).classes()).toEqual(['oc-badge-source-scss'])
  })
})

describe('0.17.0 W2 icon list', () => {
  it('rows, points and accent list', () => {
    expect(mount(OcIconList, { props: { items: [{ text: 'Reports' }] } }).classes()).toEqual(['oc-icon-list'])
    const p = mount(OcIconList, { props: { variant: 'points', accent: 'violet', items: [{ title: 'Own server', text: 'Data stays.' }] } })
    expect(p.classes()).toEqual(['oc-icon-list', 'oc-icon-list--points'])
    expect(p.find('.oc-icon-tile').classes()).toEqual(['oc-icon-tile', 'oc-icon-tile--sm', 'oc-accent--violet'])
    expect(p.find('.oc-icon-list__title').text()).toBe('Own server')
    expect(mount(OcIconList, { props: { variant: 'accent', items: [{ text: 'A' }] } }).classes()).toEqual(['oc-list--accent'])
  })
})

describe('0.17.0 W2 shot grid', () => {
  it('figures, links, captions; frame glow and mark', () => {
    const w = mount(OcShotGrid, { props: { min: '14rem', items: [{ src: '/a.jpg', alt: 'A', caption: 'Dashboard' }, { src: '/b.jpg', alt: 'B', href: false }] } })
    expect((w.element as HTMLElement).style.getPropertyValue('--oc-shot-min')).toBe('14rem')
    const figs = w.findAll('figure.oc-shot')
    expect(figs[0].find('a').attributes('href')).toBe('/a.jpg')
    expect(figs[0].find('figcaption').text()).toBe('Dashboard')
    expect(figs[1].find('a').exists()).toBe(false)
    const f = mount(OcBrowserFrame, { props: { glow: true, src: '/a.jpg' }, slots: { mark: 'M' } })
    expect(f.classes()).toEqual(['oc-browser-frame', 'oc-browser-frame--glow'])
    expect(f.find(':scope > .oc-browser-frame__mark').text()).toBe('M')
  })
})

describe('0.17.0 W2 tree', () => {
  it('item actions emit `action`, also from a child list', async () => {
    const items = [{ label: 'Kitchen', children: [{ label: 'Quote v2.pdf', actions: [{ label: 'Rename Quote v2.pdf', text: 'Rename', name: 'rename' }] }] }]
    const w = mount(OcTree, { props: { items } })
    const btn = w.find('.oc-tree-actions button.oc-table-actions-icon')
    expect(btn.attributes('aria-label')).toBe('Rename Quote v2.pdf')
    await btn.trigger('click')
    const [action, item] = w.emitted('action')![0] as [{ name: string }, { label: string }]
    expect(action.name).toBe('rename')
    expect(item.label).toBe('Quote v2.pdf')
  })
})

describe('0.17.0 W2 meter row', () => {
  it('value slot', () => {
    const w = mount(OcMeterRow, { props: { label: 'Tokens', percent: 40 }, slots: { value: '<a href="/usage">31k / 50k</a>' } })
    expect(w.find('.oc-meter-row__value a').text()).toBe('31k / 50k')
  })
})

describe('0.17.0 W2 timeline compact', () => {
  it('strong + span rows', () => {
    const w = mount(OcTimeline, { props: { compact: true, items: [{ date: '2012', text: 'Company founded' }] } })
    expect(w.find('li').html()).toBe('<li><strong>2012</strong><span>Company founded</span></li>')
    expect(w.findAll('li')).toHaveLength(1)
  })
})

describe('0.17.0 W2 table compact footer span', () => {
  it('first footer cell spans two columns', () => {
    const columns = [{ key: 'item', label: 'Item' }, { key: 'qty', label: 'Qty', numeric: true }, { key: 'price', label: 'Price', numeric: true }]
    const w = mount(OcTableCompact, { props: { columns, rows: [], footer: { item: 'Total', price: '€ 1,325.00' }, footerSpan: 2 } })
    const tds = w.findAll('tfoot td')
    expect(tds).toHaveLength(2)
    expect(tds[0].attributes('colspan')).toBe('2')
    expect(tds[1].attributes('data-numeric')).toBe('')
  })
})

describe('0.17.0 W2 color select', () => {
  it('disabled option with a title', () => {
    const w = mount(OcColorSelect, { props: { options: [{ value: 'p', label: 'Purple', color: 'var(--color-purple-50)', disabled: true, title: 'Purple, in use' }] } })
    expect(w.find('label').attributes('title')).toBe('Purple, in use')
    expect(w.find('input').attributes('disabled')).toBeDefined()
  })
})

describe('0.17.0 W2 alert dialog discard', () => {
  it('third button first in the footer, emits discard', async () => {
    const w = mount(OcAlertDialog, { props: { title: 'Save?', discardLabel: "Don't save" } })
    const first = w.find('.oc-modal-footer > :first-child')
    expect(first.classes()).toEqual(['oc-btn', 'oc-btn--ghost', 'oc-alert-dialog-discard'])
    await first.trigger('click')
    expect(w.emitted('discard')).toHaveLength(1)
  })
})

describe('0.17.0 W2 phone input dial', () => {
  it('v-model:dial and a form name', async () => {
    const w = mount(OcPhoneInput, { props: { dial: '+31', dialName: 'phone_dial' } })
    const select = w.find('select')
    expect((select.element as HTMLSelectElement).value).toBe('+31')
    expect(select.attributes('name')).toBe('phone_dial')
    await select.setValue('+49')
    expect(w.emitted('update:dial')![0]).toEqual(['+49'])
  })
})
