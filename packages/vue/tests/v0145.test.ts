// File: packages/vue/tests/v0145.test.ts
// Map: OcDropdownItem closes its popover menu after a click -> keep-open / check item keep it open

import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import OcDropdownItem from '../src/components/OcDropdownItem.vue'

function setup(props: Record<string, unknown> = {}) {
  const w = mount({ render: () => h('div', { popover: '' }, [h(OcDropdownItem, props, () => 'CSV')]) }, { attachTo: document.body })
  const hide = vi.fn()
  ;(w.element as HTMLElement).hidePopover = hide
  w.find('.oc-dropdown-item').trigger('click')
  w.unmount()
  return hide
}

describe('v0.14.5 OcDropdownItem closes the menu', () => {
  it('a click closes the menu', () => {
    expect(setup()).toHaveBeenCalledOnce()
  })
  it('keep-open and a check item keep it open', () => {
    expect(setup({ keepOpen: true })).not.toHaveBeenCalled()
    expect(setup({ checked: true })).not.toHaveBeenCalled()
  })
})
