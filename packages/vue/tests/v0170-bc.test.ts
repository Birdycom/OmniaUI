// File: packages/vue/tests/v0170-bc.test.ts
// Map: 0.17.0 BC: OcHeroMedia (video / image, scrim, align, reduced-motion source) -> OcAspectRatio flush -> OcDefinitionList numbered

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcHeroMedia from '../src/components/OcHeroMedia.vue'
import OcAspectRatio from '../src/components/OcAspectRatio.vue'
import OcDefinitionList from '../src/components/OcDefinitionList.vue'

describe('0.17.0 OcHeroMedia', () => {
  it('video: poster, muted loop, aria-hidden, source only without reduced motion, scrim start by default', () => {
    const w = mount(OcHeroMedia, { props: { src: '/media/loop.webm', poster: '/media/loop.webp' }, slots: { default: '<h1>Title</h1>' } })
    expect(w.element.tagName).toBe('SECTION')
    expect(w.classes()).toEqual(['oc-hero-media', 'oc-hero-media--scrim-start'])
    const video = w.find('video.oc-hero-media__media')
    expect(video.attributes('poster')).toBe('/media/loop.webp')
    expect(video.attributes('aria-hidden')).toBe('true')
    expect((video.element as HTMLVideoElement).muted).toBe(true)
    expect(video.attributes()).toHaveProperty('loop')
    expect(video.attributes()).toHaveProperty('playsinline')
    const source = w.find('source')
    expect(source.attributes('type')).toBe('video/webm')
    expect(source.attributes('media')).toBe('(prefers-reduced-motion: no-preference)')
    expect(w.find('.oc-hero-media__content h1').text()).toBe('Title')
  })

  it('image: alt, scrim full / end / none and align', () => {
    const img = mount(OcHeroMedia, { props: { src: '/img/hero.webp', alt: 'Office of Company 1', scrim: 'full', align: 'center' } })
    expect(img.classes()).toEqual(['oc-hero-media', 'oc-hero-media--scrim', 'oc-hero-media--center'])
    expect(img.find('video').exists()).toBe(false)
    expect(img.find('img.oc-hero-media__media').attributes('alt')).toBe('Office of Company 1')
    const end = mount(OcHeroMedia, { props: { src: '/img/hero.jpg', scrim: 'end', align: 'end' } })
    expect(end.classes()).toEqual(['oc-hero-media', 'oc-hero-media--scrim-end', 'oc-hero-media--end'])
    expect(end.find('img').attributes('alt')).toBe('')
    expect(mount(OcHeroMedia, { props: { src: '/img/hero.jpg', scrim: 'none' } }).classes()).toEqual(['oc-hero-media'])
  })

  it('type and mediaType win over the extension', () => {
    const v = mount(OcHeroMedia, { props: { src: '/stream?id=1', type: 'video', mediaType: 'video/mp4' } })
    expect(v.find('source').attributes('type')).toBe('video/mp4')
    expect(mount(OcHeroMedia, { props: { src: '/media/loop.mp4', type: 'image' } }).find('video').exists()).toBe(false)
  })
})

describe('0.17.0 OcAspectRatio flush and OcDefinitionList numbered', () => {
  it('OcAspectRatio flush', () => {
    expect(mount(OcAspectRatio, { props: { ratio: 'wide', flush: true } }).classes()).toEqual(['oc-aspect', 'oc-aspect--wide', 'oc-aspect--flush'])
    expect(mount(OcAspectRatio).classes()).toEqual(['oc-aspect'])
  })

  it('OcDefinitionList numbered (with glossary)', () => {
    const rows = [{ term: 'Plan', detail: 'We listen first.' }, { term: 'Build', detail: 'Short iterations.' }]
    expect(mount(OcDefinitionList, { props: { rows, numbered: true, glossary: true } }).find('dl').classes()).toEqual(['oc-dl', 'oc-dl--glossary', 'oc-dl--numbered'])
    expect(mount(OcDefinitionList, { props: { rows } }).find('dl').classes()).toEqual(['oc-dl'])
  })
})
