// File: packages/vue/tests/data-table.test.ts
// Map: OcDataTable -> search hides rows and the trash filter reveals deleted rows

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcDataTable from '../src/components/OcDataTable.vue'

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
  it('searches and filters trash like the Korrekt list', async () => {
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
})
