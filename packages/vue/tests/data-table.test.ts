// File: packages/vue/tests/data-table.test.ts
// Map: OcDataTable -> search hides rows and the trash filter reveals deleted rows -> tabs, column filters, name cells

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import OcDataTable from '../src/components/OcDataTable.vue'
import OcDataTableName from '../src/components/OcDataTableName.vue'

const columns = [
  { key: 'sku', header: 'Article ID' },
  { key: 'name', header: 'Name' },
  { key: 'price', header: 'Price', numeric: true },
]
const rows = [
  { key: 'schar', status: 'active' as const, cells: { sku: 'SET-SCHAR', name: 'Scharnier 1105', price: '5,15' }, values: { price: '5.15' } },
  { key: 'greep', status: 'active' as const, cells: { sku: 'SET-GREEP', name: 'Greep 40', price: '12,40' }, values: { price: '12.40' } },
  { key: 'schroef', status: 'deleted' as const, cells: { sku: 'SCHROEF', name: 'Schroef 4x40', price: '0,08' }, values: { price: '0.08' } },
]

describe('Data table', () => {
  it('searches and filters trash like a list', async () => {
    const w = mount(OcDataTable, { props: { tableId: 'dt-vue', title: 'Articles', pageSize: 10, columns, rows } })
    const row = (name: string) => w.findAll('tbody tr').find((tr) => tr.text().includes(name))!.element as HTMLTableRowElement
    expect(row('Schroef').hidden).toBe(true)

    await w.find('input[type="search"]').setValue('greep')
    expect(row('Greep').hidden).toBe(false)
    expect(row('Scharnier').hidden).toBe(true)

    await w.find('input[type="search"]').setValue('')
    await w.find('button[data-oc-filter="deleted"]').trigger('click')
    expect(row('Schroef').hidden).toBe(false)
    expect(row('Greep').hidden).toBe(true)
  })

  it('filters a column with tabs and selects, and fills a rich name cell from a slot', async () => {
    const people = [
      { key: 'lotte', cells: { name: 'Customer 1', type: 'Private', region: 'Antwerp' }, values: { type: 'private' } },
      { key: 'noord', cells: { name: 'Company 1', type: 'Company', region: 'Antwerp' }, values: { type: 'company' } },
      { key: 'reno', cells: { name: 'Company 2', type: 'Company', region: 'East Flanders' }, values: { type: 'company' } },
    ]
    const w = mount(OcDataTable, {
      props: {
        tableId: 'dt-vue-people',
        title: 'Customers',
        pageSize: 10,
        draggable: false,
        summary: 'Showing {from}–{to} of {total} customers',
        columns: [{ key: 'name', header: 'Name' }, { key: 'type', header: 'Type' }, { key: 'region', header: 'Region' }],
        rows: people,
        tabs: { column: 'type', items: [{ value: '', label: 'All', count: 3 }, { value: 'company', label: 'Companies', count: 2 }] },
        columnFilters: [{ column: 'region', label: 'Region', options: [{ value: '', label: 'All regions' }, { value: 'Antwerp', label: 'Antwerp' }] }],
      },
      slots: { 'cell-name': ({ row }: { row: { cells: Record<string, string> } }) => h(OcDataTableName, { name: row.cells.name }) },
      attachTo: document.body,
    })
    const visible = () => w.findAll('tbody tr').filter((tr) => !(tr.element as HTMLTableRowElement).hidden).length
    expect(w.find('.oc-data-table-summary').text()).toBe('Showing 1–3 of 3 customers')
    expect(w.find('tbody .oc-avatar').text()).toBe('C1')
    await w.find('button[data-oc-value="company"]').trigger('click')
    expect(visible()).toBe(2)
    await w.find('select[data-oc-col-filter="region"]').setValue('Antwerp')
    expect(visible()).toBe(1)
    w.unmount()
  })
})
