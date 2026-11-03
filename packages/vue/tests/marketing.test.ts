// File: packages/vue/tests/marketing.test.ts
// Map: components (timeline, marquee, product mark, project card, link arrow, stack list, fact list, next teaser, price card)
//      -> blocks (faq, about timeline, contact grid, hero orbit, profile header, portfolio grid)
// Group D (marketing) wrappers: they must render the same classes as the HTML snippets.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  OcBlockAboutTimeline, OcBlockContactForm, OcBrandMark, OcFeatureCard, OcLinkCard, OcBlockContactGrid, OcBlockFaq, OcBlockHeroOrbit, OcBlockPortfolioGrid, OcBlockProfileHeader,
  OcFactList, OcLinkArrow, OcLinkRow, OcMarquee, OcNextTeaser, OcPanel, OcPriceCard, OcProductMark, OcProjectCard, OcResult, OcStackList, OcTimeline,
} from '../src'

describe('marketing components', () => {
  it('OcTimeline renders items, <time> and the current modifier', () => {
    const w = mount(OcTimeline, { props: { size: 'lg', items: [{ date: '2012', dateTime: '2012' }, { date: 'Today', current: true }] } })
    expect(w.classes()).toEqual(['oc-timeline', 'oc-timeline--lg'])
    expect(w.find('time.oc-timeline__date').attributes('datetime')).toBe('2012')
    expect(w.findAll('.oc-timeline__item')[1].classes()).toContain('oc-timeline__item--current')
  })

  it('OcMarquee renders every item twice, the copy aria-hidden', () => {
    const w = mount(OcMarquee, { props: { items: ['A', 'B'], speed: 'fast', plain: true } })
    expect(w.classes()).toEqual(['oc-marquee', 'oc-marquee--fast', 'oc-marquee--plain'])
    expect(w.findAll('.oc-marquee__item')).toHaveLength(4)
    expect(w.findAll('.oc-marquee__item[aria-hidden="true"]')).toHaveLength(2)
  })

  it('OcProductMark maps size and accent', () => {
    const w = mount(OcProductMark, { props: { size: 'sm', accent: 'violet', glow: true }, slots: { default: '◉' } })
    expect(w.classes()).toEqual(['oc-product-mark', 'oc-product-mark--sm', 'oc-product-mark--glow', 'oc-accent--violet'])
  })

  it('OcProjectCard renders frame and body', () => {
    const w = mount(OcProjectCard, { props: { href: '/p', name: 'One', type: 'Website' } })
    expect(w.element.tagName).toBe('A')
    expect(w.find('.oc-project-card__frame .oc-project-card__shot').exists()).toBe(true)
    expect(w.find('.oc-project-card__type').text()).toBe('Website')
  })

  it('OcLinkArrow, OcStackList, OcFactList and OcNextTeaser map their modifiers', () => {
    expect(mount(OcLinkArrow, { props: { href: '/', direction: 'external', tone: 'accent' } }).classes())
      .toEqual(['oc-link-arrow', 'oc-link-arrow--external', 'oc-link-arrow--accent'])
    const stack = mount(OcStackList, { props: { items: ['PHP', { label: 'Web', icon: '▦' }], size: 'sm' } })
    expect(stack.findAll('.oc-stack-list__item')).toHaveLength(2)
    expect(stack.classes()).toContain('oc-stack-list--sm')
    const facts = mount(OcFactList, { props: { items: [{ label: 'A', value: 'B' }], plain: true } })
    expect(facts.classes()).toEqual(['oc-fact-list', 'oc-fact-list--plain'])
    expect(facts.find('dd').text()).toBe('B')
    const next = mount(OcNextTeaser, { props: { href: '/n', name: 'Next', tagline: 'Line' } })
    expect(next.find('.oc-next-teaser__label').text()).toBe('Next product')
  })

  it('OcPriceCard shares one radio name and renders both prices', () => {
    const w = mount(OcPriceCard, {
      props: { name: 'Pro', monthly: { amount: '€12' }, yearly: { amount: '€115', was: '€144' }, features: [{ label: 'X', excluded: true }] },
    })
    const radios = w.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    expect(radios[0].attributes('name')).toBe(radios[1].attributes('name'))
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    expect(w.find('.oc-price-card__price--yearly s').text()).toBe('€144')
    expect(w.find('.oc-price-card__feature--excluded').exists()).toBe(true)
  })

  it('OcPriceCard adds a third lifetime option when given', () => {
    const w = mount(OcPriceCard, {
      props: { name: 'Pro', monthly: { amount: '€9.90' }, yearly: { amount: '€99' }, lifetime: { amount: '€249', period: 'once' }, defaultPeriod: 'lifetime' },
    })
    const radios = w.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect((radios[2].element as HTMLInputElement).checked).toBe(true)
    expect(w.find('.oc-price-card__price--lifetime').text()).toContain('€249')
  })
})

describe('marketing blocks', () => {
  it('OcBlockFaq groups the details with one name and opens the first', () => {
    const w = mount(OcBlockFaq, { props: { title: 'FAQ', items: [{ question: 'Q1', answer: 'A1' }, { question: 'Q2', answer: 'A2' }] } })
    const details = w.findAll('details.oc-accordion-item')
    expect(details[0].attributes('name')).toBeTruthy()
    expect(details[0].attributes('name')).toBe(details[1].attributes('name'))
    expect(details[0].attributes('open')).toBeDefined()
    expect(details[1].attributes('open')).toBeUndefined()
  })

  it('OcBlockAboutTimeline and OcBlockContactGrid render their parts', () => {
    const about = mount(OcBlockAboutTimeline, { props: { title: 'About', timeline: [{ date: '2012' }] } })
    expect(about.find('.oc-block-about-copy .oc-timeline').exists()).toBe(true)
    const contact = mount(OcBlockContactGrid, {
      props: { cards: [{ title: 'Office', address: true, lines: [{ text: 'Street 1' }] }, { title: 'Mail', lines: [{ text: 'a@b.c', href: 'mailto:a@b.c' }] }] },
    })
    expect(contact.find('address.oc-block-contact-card').exists()).toBe(true)
    expect(contact.find('a.oc-block-contact-line').attributes('href')).toBe('mailto:a@b.c')
  })

  it('OcFeatureCard and OcLinkCard render their parts', () => {
    const f = mount(OcFeatureCard, { props: { title: 'Apps', icon: 'mdi:apps', accent: 'green', headingLevel: 2 }, slots: { default: 'Built for you.' } })
    expect(f.find('h2.oc-feature-card__title').text()).toBe('Apps')
    expect(f.find('.oc-icon-tile').classes()).toContain('oc-accent--green')
    const l = mount(OcLinkCard, { props: { title: 'Agent 1', href: '/a', accent: 'violet', more: 'Read more' }, slots: { default: 'Reads invoices.' } })
    expect(l.classes()).toEqual(['oc-link-card', 'oc-accent--violet'])
    expect(l.find('.oc-link-card__more').text()).toBe('Read more')
  })

  it('OcBrandMark renders the word, accent and tagline', () => {
    const w = mount(OcBrandMark, { props: { name: 'Company', accent: '1', tagline: 'Software', size: 'sm' } })
    expect(w.classes()).toEqual(['oc-brand-mark', 'oc-brand-mark--sm'])
    expect(w.find('.oc-brand-mark__accent').text()).toBe('1')
    expect(w.find('.oc-brand-mark__tagline').text()).toBe('Software')
  })

  it('OcPanel and OcResult render their classes', () => {
    expect(mount(OcPanel, { props: { glow: 'both' }, slots: { default: 'x' } }).classes()).toEqual(['oc-panel', 'oc-panel--glow-both'])
    const r = mount(OcResult, { props: { title: 'Sent', icon: 'mdi:check', accent: 'green', center: true }, slots: { default: 'Thanks.', actions: '<a href="#form">Again</a>' } })
    expect(r.classes()).toContain('oc-result--center')
    expect(r.attributes('role')).toBe('status')
    expect(r.find('.oc-icon-tile').classes()).toContain('oc-accent--green')
    expect(r.find('.oc-result__text').text()).toBe('Thanks.')
    expect(r.find('.oc-result__actions a').attributes('href')).toBe('#form')
  })

  it('OcBlockContactForm shows field errors, cards and the result, and emits again', async () => {
    const w = mount(OcBlockContactForm, {
      props: { action: '/contact', subjects: [{ value: 'project', label: 'A new project' }], errors: { email: 'Fill in a valid e-mail address.' }, cards: [{ title: 'Mail us', icon: 'mdi:email-outline', lines: [{ text: 'info@company1.example', href: 'mailto:info@company1.example' }] }] },
    })
    expect(w.find('form.oc-form.oc-form--filled').attributes('action')).toBe('/contact')
    expect(w.find('input[name="email"]').attributes('aria-invalid')).toBe('true')
    expect(w.find('#err-email').text()).toBe('Fill in a valid e-mail address.')
    expect(w.find('.oc-alert--danger').text()).toBe('Please check the fields in red.')
    expect(w.find('option[value="project"]').exists()).toBe(true)
    expect(w.find('a.oc-block-contact-line').attributes('href')).toBe('mailto:info@company1.example')
    await w.setProps({ sent: true, errors: {} })
    expect(w.find('form').exists()).toBe(false)
    await w.find('.oc-result button').trigger('click')
    expect(w.emitted('again')).toHaveLength(1)
  })

  it('OcBlockHeroOrbit spreads the marks over the ring', () => {
    const w = mount(OcBlockHeroOrbit, { props: { title: 'Hero' } })
    const marks = w.findAll('.oc-block-orbit-mark')
    expect(marks).toHaveLength(6)
    expect(marks[1].attributes('style')).toContain('--oc-orbit-angle: 60deg')
  })

  it('OcBlockProfileHeader and OcBlockPortfolioGrid render their parts', () => {
    const profile = mount(OcBlockProfileHeader, { props: { name: 'Acme', tabs: [{ label: 'Home', href: '#h', current: true }] } })
    expect(profile.find('.oc-block-profile-tab').attributes('aria-current')).toBe('page')
    const panels = mount(OcBlockProfileHeader, { props: { name: 'Company 1', tabs: [{ label: 'Home' }, { label: 'About' }] }, slots: { 'panel-0': 'Home panel', 'panel-1': 'About panel' } })
    expect(panels.findAll('input[type=radio]')).toHaveLength(2)
    expect((panels.find('input[type=radio]').element as HTMLInputElement).checked).toBe(true)
    expect(panels.findAll('.oc-block-profile-panel').map((p) => p.text())).toEqual(['Home panel', 'About panel'])
    const grid = mount(OcBlockPortfolioGrid, { props: { title: 'Work', projects: [{ href: '#1', name: 'One', accent: 'violet' }] } })
    expect(grid.find('.oc-project-card').classes()).toContain('oc-accent--violet')
  })
})

describe('OcLinkRow', () => {
  it('renders the links with rel=noopener on external ones, or the slot', () => {
    const w = mount(OcLinkRow, { props: { tone: 'accent', links: [{ href: '/docs', label: 'Docs' }, { href: 'https://example.com', label: 'Site' }] } })
    expect(w.classes()).toEqual(expect.arrayContaining(['oc-link-row', 'oc-link-row--accent']))
    const a = w.findAll('a')
    expect(a[0].attributes('rel')).toBeUndefined()
    expect(a[1].attributes('rel')).toBe('noopener')
    expect(mount(OcLinkRow, { slots: { default: '<li><a href="/x">X</a></li>' } }).findAll('li')).toHaveLength(1)
  })
})
