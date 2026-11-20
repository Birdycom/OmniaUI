// File: packages/vue/tests/v0170-r3b.test.ts
// Map: 0.17.0 round 3 B: docs sidebar -> section block / header + version badge -> icon list extras -> table free slot
//      -> shot lightbox -> browser frame body -> checklist check variant

import { beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import OcSidebar from '../src/components/OcSidebar.vue'
import OcSidebarGroup from '../src/components/OcSidebarGroup.vue'
import OcSidebarMenu from '../src/components/OcSidebarMenu.vue'
import OcSidebarMenuButton from '../src/components/OcSidebarMenuButton.vue'
import OcSectionBlock from '../src/components/OcSectionBlock.vue'
import OcSectionHeader from '../src/components/OcSectionHeader.vue'
import OcVersionBadge from '../src/components/OcVersionBadge.vue'
import OcIconList from '../src/components/OcIconList.vue'
import OcTable from '../src/components/OcTable.vue'
import OcShotGrid from '../src/components/OcShotGrid.vue'
import OcBrowserFrame from '../src/components/OcBrowserFrame.vue'
import OcChecklist from '../src/components/OcChecklist.vue'

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

describe('OcSidebar docs variant', () => {
  it('renders nav.oc-sidebar--docs with title, plain group labels, text links and a sub list', () => {
    const w = mount(OcSidebar, {
      props: { variant: 'docs', title: 'Docs', label: 'Docs' },
      slots: {
        default: () =>
          h(OcSidebarGroup, { label: 'Layout' }, () =>
            h(OcSidebarMenu, null, () =>
              h('li', null, [
                h(OcSidebarMenuButton, { href: '/flexbox', active: true }, () => 'Flexbox'),
                h(OcSidebarMenu, { sub: true }, () => h('li', null, h(OcSidebarMenuButton, { href: '/gap', current: true }, () => 'Gap'))),
              ]),
            ),
          ),
      },
    })
    const nav = w.element as HTMLElement
    expect(nav.tagName).toBe('NAV')
    expect(nav.className).toBe('oc-sidebar oc-sidebar--docs')
    expect(nav.getAttribute('aria-label')).toBe('Docs')
    expect(nav.querySelector('h2.oc-sidebar-title')?.textContent).toBe('Docs')
    expect(nav.querySelector('.oc-sidebar-content, .oc-sidebar-group')).toBeNull()
    expect(nav.querySelector('p.oc-sidebar-group-label')?.textContent).toBe('Layout')
    const parent = nav.querySelector('a[href="/flexbox"]')!
    expect(parent.className).toBe('oc-sidebar-menu-button is-active')
    expect(parent.querySelector('.oc-sidebar-menu-label')).toBeNull()
    expect(parent.hasAttribute('data-tooltip')).toBe(false)
    expect(nav.querySelector('ul.oc-sidebar-menu-sub a')?.getAttribute('aria-current')).toBe('page')
  })

  it('keeps the app sidebar as before', () => {
    const w = mount(OcSidebar, { slots: { default: () => h(OcSidebarGroup, { label: 'Platform' }, () => h(OcSidebarMenu, null, () => h('li', null, h(OcSidebarMenuButton, { href: '/' }, () => 'Home')))) } })
    expect(w.find('aside.oc-sidebar > .oc-sidebar-content > .oc-sidebar-group > div.oc-sidebar-group-label').exists()).toBe(true)
    expect(w.find('a .oc-sidebar-menu-label').text()).toBe('Home')
  })
})

describe('OcSectionBlock, OcSectionHeader and OcVersionBadge', () => {
  it('renders the section block parts', () => {
    const w = mount(OcSectionBlock, {
      props: { title: 'Notifications', source: 'Settings', version: 'v1.2', description: 'Choose.', footerTitle: 'More?', footerDescription: 'Per project.' },
      slots: { default: () => h('p', 'Body') },
    })
    expect(w.find('section.oc-section > .oc-section-header > h2.oc-section-header__title').text()).toBe('Notifications')
    expect(w.find('span.oc-badge-source.oc-section-header__badge-source').text()).toBe('Settings')
    expect(w.find('span.oc-badge-version.oc-section-header__badge-version').text()).toBe('v1.2')
    expect(w.find('.oc-section-content > p').text()).toBe('Body')
    expect(w.find('.oc-section-footer > h3.oc-section-footer__title').text()).toBe('More?')
    expect(w.find('.oc-section-footer > p.oc-section-footer__desc').text()).toBe('Per project.')
  })

  it('leaves out empty parts and supports the docs look', () => {
    const w = mount(OcSectionBlock, { props: { docs: true, title: 'Title only' } })
    expect(w.html().replace(/\s*<!--[^>]*-->\s*/g, '').replace(/>\s+</g, '><')).toBe('<section class="oc-docs-section"><div class="oc-section-header"><h2 class="oc-section-header__title">Title only</h2></div></section>')
  })

  it('renders all header badges in order', () => {
    const w = mount(OcSectionHeader, { props: { title: 'Justify', as: 'h3', source: 'CSS class', scss: '_a.scss', file: 'a.html', version: 'v0.2.0' } })
    expect([...w.element.children].map((c) => c.className)).toEqual([
      'oc-section-header__title',
      'oc-badge-source oc-section-header__badge-source',
      'oc-badge-source-scss oc-section-header__badge-scss',
      'oc-badge-source-file oc-section-header__badge-file',
      'oc-badge-version oc-section-header__badge-version',
    ])
    expect(w.find('h3').exists()).toBe(true)
  })

  it('version badge kinds', () => {
    expect(mount(OcVersionBadge, { slots: { default: () => 'v0.17.0' } }).html()).toBe('<span class="oc-badge-version">v0.17.0</span>')
    expect(mount(OcVersionBadge, { props: { kind: 'mdi' }, slots: { default: () => 'MDI 7.4' } }).html()).toBe('<span class="oc-badge-version-mdi">MDI 7.4</span>')
  })
})

describe('OcIconList extras', () => {
  it('renders pills, tagline and note around the list; attributes go to the ul', () => {
    const w = mount({ render: () => h(OcIconList, { variant: 'accent', class: 'x', pills: ['Web app', 'Since 2020'], tagline: 'Plan', note: 'Resets.', items: [{ text: 'A' }] }) })
    expect(w.find('.oc-badge-row').findAll('span.oc-pill').map((p) => p.text())).toEqual(['Web app', 'Since 2020'])
    expect(w.find('p.oc-tagline--accent').text()).toBe('Plan')
    expect(w.find('ul.oc-list--accent.x').exists()).toBe(true)
    expect(w.find('p.oc-note').text()).toBe('Resets.')
  })
})

describe('OcTable free slot', () => {
  it('renders own rows inside the table wrapper without columns', () => {
    const w = mount(OcTable, { props: { compact: true }, slots: { default: () => h('tbody', null, h('tr', { class: 'own' }, h('td', 'A'))) } })
    expect(w.find('.oc-table-wrap > table.oc-table.oc-table--compact > tbody > tr.own').exists()).toBe(true)
    expect(w.find('thead').exists()).toBe(false)
  })

  it('keeps the data table with columns', () => {
    const w = mount(OcTable, { props: { columns: [{ key: 'n', label: 'Name' }], rows: [{ id: 1, n: 'A' }] } })
    expect(w.find('thead th').text()).toBe('Name')
    expect(w.find('tbody td').text()).toBe('A')
  })
})

describe('OcShotGrid lightbox', () => {
  it('turns every shot into a button that opens a single-image lightbox outside the figure', async () => {
    const w = mount(OcShotGrid, { props: { lightbox: true, items: [{ src: '/a.jpg', alt: 'Dashboard', caption: 'Dashboard of the day' }] }, attrs: { style: 'inline-size:100%' }, attachTo: document.body })
    const button = w.find('.oc-shot-grid figure.oc-shot > button')
    expect(button.attributes('aria-label')).toBe('Open the screenshot: Dashboard')
    expect(w.find('.oc-shot-grid').attributes('style')).toContain('inline-size: 100%')
    const dialog = document.querySelector('dialog.oc-lightbox.oc-lightbox--single') as HTMLDialogElement
    expect(dialog.getAttribute('aria-label')).toBe('Dashboard')
    expect(dialog.closest('figure')).toBeNull()
    await button.trigger('click')
    expect(dialog.hasAttribute('open')).toBe(true)
    w.unmount()
  })
})

describe('OcBrowserFrame body', () => {
  it('renders div.oc-browser-frame with a __body', () => {
    const w = mount(OcBrowserFrame, { props: { body: true, bodyStyle: { background: 'red' } }, attrs: { class: 'oc-accent--blue' } })
    expect(w.element.tagName).toBe('DIV')
    expect(w.classes()).toEqual(['oc-browser-frame', 'oc-accent--blue'])
    expect(w.find('.oc-browser-frame__body').attributes('style')).toBe('background: red;')
    expect(w.find('figure').exists()).toBe(false)
  })
})

describe('OcChecklist check variant', () => {
  it('renders ul.oc-check-list from strings', () => {
    const w = mount(OcChecklist, { props: { variant: 'check', items: ['No JavaScript needed', 'Light and dark mode'] } })
    expect(w.html().replace(/>\s+</g, '><')).toBe('<ul class="oc-check-list"><li>No JavaScript needed</li><li>Light and dark mode</li></ul>')
  })
})
