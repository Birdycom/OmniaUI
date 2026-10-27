// File: packages/vue/tests/media.test.ts
// Map: dialog shim -> lightbox -> image zoom -> media thumb / card / row -> stack card -> flip card -> entity card
//      -> emoji picker -> chat composer -> terminal log -> browser frame
// Group C (media and content) Vue wrappers: same markup as the snippets, plus their v-model / emits.
import { beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcLightbox from '../src/components/OcLightbox.vue'
import OcImageZoom from '../src/components/OcImageZoom.vue'
import OcMediaThumb from '../src/components/OcMediaThumb.vue'
import OcMediaCard from '../src/components/OcMediaCard.vue'
import OcMediaRow from '../src/components/OcMediaRow.vue'
import OcStackCard from '../src/components/OcStackCard.vue'
import OcFlipCard from '../src/components/OcFlipCard.vue'
import OcEntityCard from '../src/components/OcEntityCard.vue'
import OcEmojiPicker from '../src/components/OcEmojiPicker.vue'
import OcChatComposer from '../src/components/OcChatComposer.vue'
import OcTerminalLog from '../src/components/OcTerminalLog.vue'
import OcBrowserFrame from '../src/components/OcBrowserFrame.vue'

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

describe('OcLightbox', () => {
  it('renders slides with wrap-around links and opens from a thumbnail', async () => {
    const w = mount(OcLightbox, { props: { images: [{ alt: 'A' }, { alt: 'B' }, { alt: 'C' }] }, attachTo: document.body })
    const slides = w.findAll('.oc-lightbox__slide')
    expect(slides).toHaveLength(3)
    expect(slides[0].find('.oc-lightbox__nav--prev').attributes('href')).toBe(`#${slides[2].attributes('id')}`)
    expect(slides[1].find('.oc-lightbox__counter').text()).toBe('2 / 3')
    await w.findAll('.oc-lightbox-thumb')[1].trigger('click')
    expect(w.emitted('update:open')?.[0]).toEqual([true])
    w.unmount()
  })
})

describe('OcImageZoom', () => {
  it('writes the zoom model to --oc-zoom', async () => {
    const w = mount(OcImageZoom, { props: { zoom: 2 } })
    expect((w.element as HTMLElement).style.getPropertyValue('--oc-zoom')).toBe('2')
    expect(w.findAll('.oc-image-zoom__level')).toHaveLength(4)
  })
})

describe('OcMediaThumb, OcMediaCard, OcMediaRow', () => {
  it('thumb renders a link with badge, duration and progress', () => {
    const w = mount(OcMediaThumb, { props: { href: '/v', duration: '4:51', badge: 'LIVE', live: true, progress: 30 } })
    expect(w.element.tagName).toBe('A')
    expect(w.find('.oc-media-thumb__badge--live').text()).toBe('LIVE')
    expect(w.find('progress').attributes('value')).toBe('30')
  })

  it('card wires the menu slot to a popover', () => {
    const w = mount(OcMediaCard, { props: { title: 'Cabin', href: '/v', avatar: 'NS' }, slots: { menu: '<a class="oc-dropdown-item">Share</a>' } })
    expect(w.find('.oc-media-card__menu').attributes('popovertarget')).toBe(w.find('.oc-dropdown-menu').attributes('id'))
    expect(w.find('.oc-media-card__title a').attributes('href')).toBe('/v')
  })

  it('row marks the current item', () => {
    const w = mount(OcMediaRow, { props: { title: 'Part 2', href: '#', current: true } })
    expect(w.attributes('aria-current')).toBe('true')
  })
})

describe('OcStackCard, OcEntityCard', () => {
  it('stack card shows the count', () => {
    const w = mount(OcStackCard, { props: { title: 'Course', href: '#', count: '8 lessons', panel: true } })
    expect(w.classes()).toContain('oc-stack-card--panel')
    expect(w.find('.oc-stack-card__count').text()).toBe('8 lessons')
  })

  it('entity card renders glyph and facts', () => {
    const w = mount(OcEntityCard, { props: { title: 'Ankh', glyph: '☥', facts: [['Code', 'S34']] } })
    expect(w.find('.oc-entity-card__glyph').text()).toBe('☥')
    expect(w.find('.oc-entity-card__facts dd').text()).toBe('S34')
  })
})

describe('OcFlipCard', () => {
  it('toggles the flipped model through the checkbox', async () => {
    const w = mount(OcFlipCard, { slots: { front: 'Q', back: 'A' } })
    await w.find('.oc-flip-card__toggle').setValue(true)
    expect(w.emitted('update:flipped')?.[0]).toEqual([true])
  })

  it('hover mode is focusable', () => {
    const w = mount(OcFlipCard, { props: { trigger: 'hover' } })
    expect(w.classes()).toContain('oc-flip-card--hover')
    expect(w.attributes('tabindex')).toBe('0')
  })
})

describe('OcEmojiPicker, OcChatComposer', () => {
  it('emits the picked emoji', async () => {
    const w = mount(OcEmojiPicker, { props: { groups: [{ emojis: ['👍'] }] } })
    await w.find('.oc-emoji-picker__item').trigger('click')
    expect(w.emitted('select')?.[0]).toEqual(['👍'])
  })

  it('composer emits trimmed text on submit and clears the model', async () => {
    const w = mount(OcChatComposer, { props: { modelValue: '  hi  ', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    await w.find('form').trigger('submit')
    expect(w.emitted('send')?.[0]).toEqual(['hi'])
    expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })
})

describe('OcTerminalLog, OcBrowserFrame', () => {
  it('terminal log renders levels and a prompt', () => {
    const w = mount(OcTerminalLog, { props: { lines: [{ level: 'error', message: 'Boom', time: '09:41' }], prompt: true } })
    expect(w.find('.oc-terminal-log__body').attributes('role')).toBe('log')
    expect(w.find('.oc-terminal-log__line--error .oc-terminal-log__time').text()).toBe('09:41')
    expect(w.find('.oc-terminal-log__prompt').exists()).toBe(true)
  })

  it('browser frame renders the address and slot content', () => {
    const w = mount(OcBrowserFrame, { props: { url: 'example.com', minimal: true }, slots: { default: '<p>Live</p>' } })
    expect(w.classes()).toContain('oc-browser-frame--minimal')
    expect(w.find('.oc-browser-frame__address').text()).toBe('example.com')
    expect(w.find('.oc-browser-frame__view').text()).toBe('Live')
  })
})
