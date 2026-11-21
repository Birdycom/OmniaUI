// File: packages/vue/tests/v0170-r4.test.ts
// Map: 0.17.0 round 4: OcDataTable column hideBelow -> data-hide-below on the th, the tds and the skeleton tds

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcDataTable from '../src/components/OcDataTable.vue'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'E-mail', hideBelow: 'lg' as const },
  { key: 'status', header: 'Status', hideBelow: 'sm' as const },
]
const rows = [
  { key: 'c1', cells: { name: 'Contact 1', email: 'info@contact1.example', status: 'Active' } },
  { key: 'c2', cells: { name: 'Contact 2', email: 'info@contact2.example', status: 'Pending' } },
]

describe('OcDataTable hideBelow', () => {
  it('puts data-hide-below on the header and every cell of that column', () => {
    const w = mount(OcDataTable, { props: { tableId: 'dt-hide', columns, rows } })
    expect(w.find('th[data-oc-col="email"]').attributes('data-hide-below')).toBe('lg')
    expect(w.find('th[data-oc-col="status"]').attributes('data-hide-below')).toBe('sm')
    expect(w.find('th[data-oc-col="name"]').attributes('data-hide-below')).toBeUndefined()
    expect(w.findAll('td[data-oc-col="email"][data-hide-below="lg"]')).toHaveLength(2)
    expect(w.findAll('td[data-oc-col="status"][data-hide-below="sm"]')).toHaveLength(2)
    expect(w.findAll('td[data-oc-col="name"][data-hide-below]')).toHaveLength(0)
  })

  it('keeps the switch on the skeleton cells while loading', () => {
    const w = mount(OcDataTable, { props: { tableId: 'dt-hide-load', columns, rows: [], loading: true, skeletonRows: 2 } })
    expect(w.findAll('.oc-data-table-skeleton td[data-hide-below="lg"]')).toHaveLength(2)
    expect(w.findAll('.oc-data-table-skeleton td[data-hide-below="sm"]')).toHaveLength(2)
  })
})
