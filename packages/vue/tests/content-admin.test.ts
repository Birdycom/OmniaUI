// File: packages/vue/tests/content-admin.test.ts
// Map: dialog shim -> doc viewer -> cookie consent -> busy overlay -> dark sidebar
// Content and admin Vue wrappers: same markup as the snippets (classes, invoker commands, ids), plus their emits.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcDocViewer from '../src/components/OcDocViewer.vue'
import OcCookieConsent from '../src/components/OcCookieConsent.vue'
import OcBusyOverlay from '../src/components/OcBusyOverlay.vue'
import OcSidebar from '../src/components/OcSidebar.vue'

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

describe('OcDocViewer', () => {
  it('renders the demo cards with dialogs wired by command / commandfor', () => {
    const w = mount(OcDocViewer, { props: { idPrefix: 'dv' }, attrs: { class: 'mt-2' } })
    expect(w.find('.oc-doc-viewer-grid').classes()).toContain('mt-2')
    const expand = w.find('.oc-doc-viewer__expand')
    expect(expand.attributes('command')).toBe('show-modal')
    expect(expand.attributes('commandfor')).toBe('dv-1')
    expect(w.find('.oc-doc-viewer--video .oc-doc-viewer__open').attributes('commandfor')).toBe('dv-2')
    const dialog = w.find('dialog#dv-1')
    expect(dialog.classes()).toContain('oc-doc-viewer-dialog')
    expect(dialog.attributes('closedby')).toBe('any')
    expect(dialog.find('a[download]').attributes('href')).toBe('#brochure.pdf')
    expect(w.find('dialog#dv-2').classes()).toContain('oc-doc-viewer-dialog--video')
  })

  it('renders real files and plain cards without a dialog', () => {
    const w = mount(OcDocViewer, { props: { items: [{ label: 'Plan', src: '/p.pdf' }, { label: 'Photo', src: '/a.jpg', type: 'image', fullscreen: false }] } })
    expect(w.find('iframe').attributes('src')).toBe('/p.pdf#toolbar=0&view=FitH')
    expect(w.find('.oc-doc-viewer--image img').attributes('alt')).toBe('Photo')
    expect(w.findAll('dialog')).toHaveLength(1)
  })
})

describe('OcCookieConsent', () => {
  afterEach(() => localStorage.clear())

  it('renders the popover with categories and emits the stored choice', async () => {
    const w = mount(OcCookieConsent, { props: { bar: true }, attachTo: document.body })
    const box = w.find('aside')
    expect(box.classes()).toEqual(['oc-cookie-consent', 'oc-cookie-consent--bar'])
    expect(box.attributes('popover')).toBe('manual')
    expect(w.find('[data-oc-consent-open]').text()).toBe('Cookie settings')
    expect((w.find('input[name="necessary"]').element as HTMLInputElement).disabled).toBe(true)
    await w.find('[data-oc-consent="all"]').trigger('click')
    expect(w.emitted('consent')?.[0][0]).toMatchObject({ necessary: true, statistics: true, marketing: true })
    expect(JSON.parse(localStorage.getItem('oc-consent')!).marketing).toBe(true)
    w.unmount()
  })

  it('emits a stored choice on mount and marks manual mode', () => {
    localStorage.setItem('oc-consent', JSON.stringify({ necessary: true, statistics: false, date: 'x' }))
    const w = mount(OcCookieConsent, { props: { manual: true, openLabel: '' } })
    expect(w.emitted('consent')?.[0][0]).toMatchObject({ statistics: false })
    expect(w.find('aside').attributes('data-oc-consent-manual')).toBe('')
    expect(w.find('[data-oc-consent-open]').exists()).toBe(false)
    w.unmount()
  })
})

describe('OcBusyOverlay', () => {
  it('renders a modal dialog that Esc cannot close, with spinner or progress', async () => {
    const w = mount(OcBusyOverlay, { props: { id: 'busy', open: true, title: 'Uploading' }, attachTo: document.body })
    const dialog = w.find('dialog')
    expect(dialog.classes()).toContain('oc-busy-overlay')
    expect(dialog.attributes('closedby')).toBe('none')
    expect(dialog.attributes('aria-labelledby')).toBe('busy-title')
    expect(dialog.attributes('open')).toBeDefined()
    expect(w.find('.oc-spinner').attributes('role')).toBe('status')
    await w.setProps({ progress: 40 })
    expect((w.find('.oc-progress-bar').element as HTMLElement).style.width).toBe('40%')
    w.unmount()
  })
})

describe('OcSidebar', () => {
  it('adds the dark modifier', () => {
    expect(mount(OcSidebar, { props: { dark: true } }).classes()).toEqual(['oc-sidebar', 'oc-sidebar--dark'])
  })
})
