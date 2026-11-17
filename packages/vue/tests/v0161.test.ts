// File: packages/vue/tests/v0161.test.ts
// Map: OcWebicon (registered set, size, label, unknown, ratio, aliases + flip, late registration, iconify fallback) ->
//      components without the Iconify runtime (language menu flags) -> dialog close options -> live frame laptop -> card fill

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OcWebicon from '../src/components/OcWebicon.vue'
import OcLanguageMenu from '../src/components/OcLanguageMenu.vue'
import OcSheet from '../src/components/OcSheet.vue'
import OcModal from '../src/components/OcModal.vue'
import OcConfirmDialog from '../src/components/OcConfirmDialog.vue'
import OcAlertDialog from '../src/components/OcAlertDialog.vue'
import OcLiveFrame from '../src/components/OcLiveFrame.vue'
import OcCard from '../src/components/OcCard.vue'
import { addWebicons, hasWebicon, registerWebicons } from '../src/index'

const HOME = 'M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'
registerWebicons({
  prefix: 'mdi',
  width: 24,
  height: 24,
  icons: {
    home: { body: `<path fill="currentColor" d="${HOME}"/>` },
    'arrow-left': { body: '<path fill="currentColor" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"/>' },
  },
  aliases: { 'arrow-right-flipped': { parent: 'arrow-left', hFlip: true } },
})

describe('v0.16.1 OcWebicon', () => {
  it('draws a registered icon as inline SVG in currentColor, decorative by default', () => {
    const svg = mount(OcWebicon, { props: { name: 'mdi:home' } }).find('svg')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.attributes('fill')).toBe('currentColor')
    expect(svg.attributes('class')).toBe('oc-icon')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('data-webicon')).toBe('mdi:home')
    expect(svg.find('path').attributes('d')).toBe(HOME)
  })

  it('size class and own class', () => {
    const svg = mount(OcWebicon, { props: { name: 'mdi:home', size: 'xl' }, attrs: { class: 'text-primary' } }).find('svg')
    expect(svg.attributes('class')).toBe('oc-icon oc-icon--xl text-primary')
  })

  it('a label makes it role img with a title', () => {
    const svg = mount(OcWebicon, { props: { name: 'mdi:home', label: 'Home' } }).find('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('Home')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
    expect(svg.find('title').text()).toBe('Home')
  })

  it('an unknown icon draws nothing and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const a = mount(OcWebicon, { props: { name: 'mdi:no-such-icon' } })
    mount(OcWebicon, { props: { name: 'mdi:no-such-icon' } })
    expect(a.find('svg').exists()).toBe(false)
    expect(a.html()).not.toContain('<svg')
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('a 4:3 flag keeps its ratio (built in); flips of an alias', () => {
    const flag = mount(OcWebicon, { props: { name: 'flag:de-4x3' } }).find('svg')
    expect(flag.attributes('viewBox')).toBe('0 0 640 480')
    expect(flag.attributes('width')).toBe('1.3333em')
    expect(flag.attributes('style')).toContain('--oc-icon-ratio: 1.3333')
    const arrow = mount(OcWebicon, { props: { name: 'mdi:arrow-right-flipped' } })
    expect(arrow.find('g').attributes('transform')).toBe('translate(24 0) scale(-1 1)')
  })

  it('icons registered after the first render show up; subsets by name', async () => {
    const w = mount(OcWebicon, { props: { name: 'material-symbols:star' } })
    expect(w.find('svg').exists()).toBe(false)
    addWebicons({ 'material-symbols:star': 'm12 17.27l6.18 3.73l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z' })
    await nextTick()
    expect(w.find('svg path').attributes('d')).toMatch(/^m12 17.27/)
    registerWebicons({ prefix: 'mdi-light', icons: { truck: { body: '<path/>' }, other: { body: '<path/>' } } }, ['truck'])
    expect(hasWebicon('mdi-light:truck')).toBe(true)
    expect(hasWebicon('mdi-light:other')).toBe(false)
  })

  it('fallback iconify draws the Iconify element for a name only that runtime knows', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const w = mount(OcWebicon, { props: { name: 'mdi:only-in-runtime', fallback: 'iconify' } })
    expect(w.find('iconify-icon').attributes('icon')).toBe('mdi:only-in-runtime')
    warn.mockRestore()
  })
})

describe('v0.16.1 components draw webicons without the Iconify runtime', () => {
  it('language menu shows its flags as inline SVG', () => {
    expect(customElements.get('iconify-icon')).toBeUndefined()
    const w = mount(OcLanguageMenu, {
      props: {
        modelValue: 'nl',
        options: [
          { value: 'en', label: 'English', flag: 'flag:gb-4x3' },
          { value: 'nl', label: 'Nederlands', flag: 'flag:nl-4x3' },
        ],
      },
    })
    expect(w.find('iconify-icon').exists()).toBe(false)
    const flags = w.findAll('.oc-language-flag svg')
    expect(flags.map((f) => f.attributes('data-webicon'))).toEqual(['flag:nl-4x3', 'flag:gb-4x3', 'flag:nl-4x3'])
    expect(flags.every((f) => f.find('path').exists())).toBe(true)
  })
})

describe('v0.16.1 close button options', () => {
  it('sheet and confirm dialog: close-round and close-class', () => {
    expect(mount(OcSheet, { props: { title: 'Filters', closeRound: true, closeClass: 'my-close' } }).find('.oc-sheet-close').classes()).toEqual(['oc-sheet-close', 'oc-close--round', 'my-close'])
    expect(mount(OcConfirmDialog, { props: { title: 'Delete?', closeRound: true } }).find('.oc-alert-dialog-close').classes()).toEqual(['oc-alert-dialog-close', 'oc-close--round'])
    expect(mount(OcSheet, { props: { title: 'Plain' } }).find('.oc-sheet-close').classes()).toEqual(['oc-sheet-close'])
  })

  it('modal and alert dialog: a close button only when asked', async () => {
    expect(mount(OcModal, { props: { title: 'Edit' } }).find('.oc-modal-close').exists()).toBe(false)
    expect(mount(OcModal, { props: { title: 'Edit', closeButton: true, closeLabel: 'Sluiten' } }).find('.oc-modal-close').attributes('aria-label')).toBe('Sluiten')
    expect(mount(OcModal, { props: { title: 'Edit', closeRound: true } }).find('.oc-modal-close').classes()).toEqual(['oc-modal-close', 'oc-close--round'])
    const a = mount(OcAlertDialog, { props: { title: 'Saved', closeClass: 'x' } })
    expect(a.find('.oc-alert-dialog-close').classes()).toEqual(['oc-alert-dialog-close', 'x'])
    await a.find('.oc-alert-dialog-close').trigger('click')
    expect(a.emitted('cancel')).toHaveLength(1)
  })
})

describe('v0.16.1 live frame laptop and card fill', () => {
  it('laptop: class and 1440 x 900 by default', () => {
    const f = mount(OcLiveFrame, { props: { device: 'laptop', src: '/p', title: 'Preview' } })
    expect(f.classes()).toEqual(['oc-live-frame', 'oc-live-frame--laptop'])
    expect(f.attributes('style')).toContain('--oc-live-w: 1440')
    expect(f.attributes('style')).toContain('--oc-live-h: 900')
  })

  it('card fill', () => {
    expect(mount(OcCard, { props: { accent: 'live', fill: true } }).classes()).toEqual(['oc-card', 'oc-card--accent', 'oc-card--fill'])
  })
})
