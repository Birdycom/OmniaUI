// File: packages/vue/tests/v0170-w4.test.ts
// Map: 0.17.0 W4 blocks: auth pages + sidebars -> site header / footer + topbar -> route blocks -> marketing blocks -> hero orbit + auth split

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import OcBlockLogin01 from '../src/blocks/OcBlockLogin01.vue'
import OcBlockLogin02 from '../src/blocks/OcBlockLogin02.vue'
import OcBlockLogin03 from '../src/blocks/OcBlockLogin03.vue'
import OcBlockSignup01 from '../src/blocks/OcBlockSignup01.vue'
import OcBlockSignup02 from '../src/blocks/OcBlockSignup02.vue'
import OcBlockOtp01 from '../src/blocks/OcBlockOtp01.vue'
import OcBlockOtp02 from '../src/blocks/OcBlockOtp02.vue'
import OcBlockForgotPassword from '../src/blocks/OcBlockForgotPassword.vue'
import OcBlockResetPassword from '../src/blocks/OcBlockResetPassword.vue'
import OcBlockSidebar01 from '../src/blocks/OcBlockSidebar01.vue'
import OcBlockSidebar02 from '../src/blocks/OcBlockSidebar02.vue'
import OcBlockSidebar03 from '../src/blocks/OcBlockSidebar03.vue'
import OcBlockSidebar04 from '../src/blocks/OcBlockSidebar04.vue'
import OcBlockSidebar05 from '../src/blocks/OcBlockSidebar05.vue'
import OcBlockSiteHeader from '../src/blocks/OcBlockSiteHeader.vue'
import OcBlockSiteFooter from '../src/blocks/OcBlockSiteFooter.vue'
import OcTopbar from '../src/components/OcTopbar.vue'
import OcBlockRouteProgress from '../src/blocks/OcBlockRouteProgress.vue'
import OcBlockStepView from '../src/blocks/OcBlockStepView.vue'
import OcBlockRouteSteps from '../src/blocks/OcBlockRouteSteps.vue'
import OcBlockTypePicker from '../src/blocks/OcBlockTypePicker.vue'
import OcBlockShowcase from '../src/blocks/OcBlockShowcase.vue'
import OcBlockHeroCode from '../src/blocks/OcBlockHeroCode.vue'
import OcBlockProductGrid from '../src/blocks/OcBlockProductGrid.vue'
import OcBlockAboutTimeline from '../src/blocks/OcBlockAboutTimeline.vue'
import OcBlockPortfolioGrid from '../src/blocks/OcBlockPortfolioGrid.vue'
import OcBlockContactGrid from '../src/blocks/OcBlockContactGrid.vue'
import OcBlockHeroOrbit from '../src/blocks/OcBlockHeroOrbit.vue'
import OcBlockAuthSplit from '../src/blocks/OcBlockAuthSplit.vue'

// --- part a ---
describe('0.17.0 auth page blocks', () => {
  it('login-01: plain page with the snippet defaults; class falls through', () => {
    const w = mount(OcBlockLogin01, { attrs: { class: 'x' } })
    expect(w.classes()).toEqual(['oc-block-authpage', 'oc-block-authpage--plain', 'x'])
    expect(w.find('form.oc-block-authcard').attributes('action')).toBe('#')
    expect(w.find('.oc-block-authcard-logo').exists()).toBe(true)
    expect(w.find('.oc-block-authcard-title').text()).toBe('Login to your account')
    expect(w.find('.oc-input-reveal input[name=password]').exists()).toBe(true)
    expect(w.find('.oc-block-authcard-row').exists()).toBe(false)
    expect(w.find('.oc-block-authcard-foot').text()).toBe("Don't have an account? Sign up")
  })

  it('login-01: props win, submit is emitted, footer slot replaces the line', () => {
    const w = mount(OcBlockLogin01, { props: { title: 'Sign in to Company 1', action: '/login' }, slots: { footer: () => h('a', { href: '/register' }, 'Register') } })
    expect(w.find('.oc-block-authcard-title').text()).toBe('Sign in to Company 1')
    expect(w.find('form').attributes('action')).toBe('/login')
    expect(w.find('.oc-block-authcard-foot').html()).toContain('href="/register"')
    w.find('form').trigger('submit')
    expect(w.emitted('submit')).toHaveLength(1)
  })

  it('login-02: split with quote panel, remember me and forgot link', () => {
    const w = mount(OcBlockLogin02)
    expect(w.classes()).toEqual(['oc-block-authduo'])
    expect(w.find('.oc-block-authduo-panel--image .oc-block-authduo-quote footer').text()).toBe('Customer 1, operations lead')
    expect(w.find('form').classes()).toEqual(['oc-block-authcard', 'oc-block-authcard--flat'])
    expect(w.find('.oc-block-authcard-logo').exists()).toBe(false)
    expect(w.find('.oc-block-authcard-row input[name=remember]').exists()).toBe(true)
    expect(w.find('.oc-block-authcard-row a').text()).toBe('Forgot password?')
  })

  it('login-02: reverse + social + photo panel keeps the default quote', async () => {
    const w = mount(OcBlockLogin02, { props: { reverse: true, social: ['Apple', 'Google', 'Meta'], dividerLabel: 'Or continue with e-mail', panel: { tone: 'photo', photo: '/img/a.webp' } } })
    expect(w.classes()).toEqual(['oc-block-authduo', 'oc-block-authduo--reverse'])
    const aside = w.find('aside')
    expect(aside.classes()).toContain('oc-block-authduo-panel--photo')
    expect(aside.attributes('style')).toContain("--oc-authduo-photo: url('/img/a.webp')")
    expect(aside.find('.oc-block-authduo-quote').exists()).toBe(true)
    expect(w.findAll('.oc-block-authsocial button')).toHaveLength(3)
    await w.findAll('.oc-block-authsocial button')[2].trigger('click')
    expect(w.emitted('social')![0]).toEqual([2])
  })

  it('login-03: muted page, social buttons, divider and legal line with links', () => {
    const w = mount(OcBlockLogin03)
    expect(w.classes()).toEqual(['oc-block-authpage'])
    expect(w.find('.oc-block-authsocial + .oc-separator-text').text()).toBe('Or continue with')
    expect(w.find('.oc-block-authcard-legal').text()).toBe('By clicking continue, you agree to our Terms of Service and Privacy Policy.')
    expect(w.findAll('.oc-block-authcard-legal a')).toHaveLength(2)
  })

  it('minimal magic-link layout (login-05 demo)', () => {
    const w = mount(OcBlockLogin01, { props: { layout: 'minimal', password: false, social: ['Continue with Apple'], socialPosition: 'bottom', dividerLabel: 'Or', footer: '', footerLink: null } })
    expect(w.classes()).toEqual(['oc-block-authmin'])
    expect(w.find('input[name=password]').exists()).toBe(false)
    expect(w.find('.oc-block-authcard-fields + .oc-separator-text').exists()).toBe(true)
    expect(w.find('.oc-block-authcard-foot').exists()).toBe(false)
  })

  it('signup-01 / signup-02 / signup-03 demo', () => {
    const s1 = mount(OcBlockSignup01)
    expect(s1.findAll('.oc-field')).toHaveLength(4)
    expect(s1.find('input[name=password_confirmation]').exists()).toBe(true)
    expect(s1.find('.oc-block-authcard-hint').text()).toBe('Must be at least 8 characters long.')
    const s2 = mount(OcBlockSignup02)
    expect(s2.classes()).toEqual(['oc-block-authduo', 'oc-block-authduo--reverse'])
    expect(s2.find('input[name=terms]').exists()).toBe(true)
    expect(s2.find('label a.oc-link').text()).toBe('terms')
    expect(s2.find('input[name=terms]').element.parentElement!.textContent).toBe(' I agree to the terms')
    const s3 = mount(OcBlockSignup01, { props: { muted: true, nameLabel: null, confirmLabel: null, hint: '', social: ['Apple', 'Google'], dividerLabel: 'Or continue with' } })
    expect(s3.find('input[name=name]').exists()).toBe(false)
    expect(s3.findAll('.oc-field')).toHaveLength(2)
    expect(s3.classes()).toEqual(['oc-block-authpage'])
  })

  it('otp-01 / otp-02: code input, v-model:code and complete', async () => {
    const w = mount(OcBlockOtp01, { props: { length: 4 } })
    const input = w.find('input.oc-otp')
    expect(input.attributes('maxlength')).toBe('4')
    expect(w.find('.oc-field-description').text()).toContain('name@company1.example')
    await input.setValue('1234')
    expect(w.emitted('update:code')!.at(-1)).toEqual(['1234'])
    expect(w.emitted('complete')![0]).toEqual(['1234'])
    const w2 = mount(OcBlockOtp02)
    expect(w2.find('.oc-block-authduo-panel--muted').exists()).toBe(true)
    expect(w2.find('.oc-block-authcard-title').text()).toBe('Verify your login')
  })

  it('forgot and reset password; default slot replaces the fields', () => {
    const f = mount(OcBlockForgotPassword)
    expect(f.find('.oc-block-authcard-submit').text()).toBe('Send reset link')
    expect(f.find('.oc-block-authcard-foot').text()).toBe('Back to sign in')
    const r = mount(OcBlockResetPassword)
    expect(r.findAll('.oc-input-reveal')).toHaveLength(2)
    expect(r.find('.oc-block-authcard-hint').text()).toContain('8 characters')
    const own = mount(OcBlockForgotPassword, { slots: { default: () => h('input', { id: 'own', name: 'login' }) } })
    expect(own.find('#own').exists()).toBe(true)
    expect(own.find('input[name=email]').exists()).toBe(false)
    expect(own.find('.oc-block-authcard-submit').exists()).toBe(true)
  })
})

describe('0.17.0 sidebar blocks', () => {
  it('sidebar-01: brand, labelled groups, badge, current page and user footer', () => {
    const w = mount(OcBlockSidebar01)
    expect(w.classes()).toEqual(['oc-block-sb'])
    expect(w.find('.oc-sidebar-header strong').text()).toBe('Documentation')
    expect(w.findAll('.oc-sidebar-group')).toHaveLength(2)
    expect(w.find('[aria-current=page] .oc-sidebar-menu-label').text()).toBe('Introduction')
    expect(w.find('.oc-sidebar-menu-badge').text()).toBe('24')
    expect(w.find('.oc-sidebar-footer .oc-user-name').text()).toBe('User 1')
    expect(w.findAll('.oc-block-sb-ph')).toHaveLength(4)
    expect(w.find('.oc-breadcrumb-item[aria-current=page]').text()).toBe('Overview')
  })

  it('sidebar-01: own groups, initials, breadcrumbs and main slot', () => {
    const w = mount(OcBlockSidebar01, {
      props: { brand: { title: 'Company 1' }, groups: [{ label: 'Sales', items: [{ label: 'Quotes', href: '/quotes', current: true }] }], user: { name: 'Customer One' }, breadcrumbs: [{ label: 'Sales', href: '/' }, { label: 'Quotes' }] },
      slots: { default: () => h('p', { id: 'body' }, 'Body') },
    })
    expect(w.find(".oc-sidebar-menu-button[href='/quotes']").attributes('aria-current')).toBe('page')
    expect(w.find('.oc-avatar').text()).toBe('CO')
    expect(w.find('.oc-block-sb-body #body').exists()).toBe(true)
    expect(w.find('.oc-block-sb-ph').exists()).toBe(false)
  })

  it('sidebar-02: groups fold with details', () => {
    const w = mount(OcBlockSidebar02)
    const groups = w.findAll('details.oc-block-sb-group')
    expect(groups).toHaveLength(3)
    expect((groups[0].element as HTMLDetailsElement).open).toBe(true)
    expect((groups[2].element as HTMLDetailsElement).open).toBe(false)
    expect(groups[2].find('summary').text()).toBe('Reference')
    expect(w.find('.oc-sidebar-footer').exists()).toBe(false)
  })

  it('sidebar-03 visible submenus, sidebar-05 collapsible submenus, sidebar-04 floating', () => {
    const w3 = mount(OcBlockSidebar03)
    expect(w3.findAll('.oc-sidebar-menu-sub')).toHaveLength(2)
    expect(w3.find('details').exists()).toBe(false)
    const w5 = mount(OcBlockSidebar05)
    const items = w5.findAll('details.oc-sidebar-collapsible')
    expect(items).toHaveLength(3)
    expect((items[0].element as HTMLDetailsElement).open).toBe(true)
    expect(items[0].find('summary.oc-sidebar-menu-button .oc-sidebar-menu-label').text()).toBe('Dashboard')
    expect(items[1].findAll('.oc-sidebar-menu-sub li')).toHaveLength(2)
    const w4 = mount(OcBlockSidebar04)
    expect(w4.classes()).toEqual(['oc-block-sb', 'oc-block-sb--floating'])
    expect(w4.find('aside').classes()).toEqual(['oc-sidebar', 'oc-sidebar--floating'])
  })
})

// --- part b ---
const items = [{ label: 'Product', href: '#product', current: true }, { label: 'Pricing', href: '#pricing' }]

describe('0.17.0 site header block', () => {
  it('without the new props the markup is unchanged', () => {
    const w = mount(OcBlockSiteHeader, { props: { items }, slots: { brand: 'Company 1' } })
    expect(w.find('header').classes()).toEqual(['oc-site-header'])
    expect(w.find('.oc-site-header__brand').text()).toBe('Company 1')
    expect(w.find('.oc-site-header__toggle').text()).toBe('☰')
    expect(w.find('.oc-site-header__actions').exists()).toBe(false)
    expect(w.find('.oc-site-header__progress').exists()).toBe(false)
  })

  it('actions slot, progress, variant and a brand mark', () => {
    const w = mount(OcBlockSiteHeader, {
      props: { items, homeHref: '#', variant: 'dark', progress: true, brandMark: { name: 'Company', accent: '1', tagline: 'Software & IT', label: 'Company 1, home' } },
      slots: { actions: '<a class="oc-btn oc-btn--sm" href="#">Contact</a>', 'brand-icon': '<svg class="oc-brand-mark__icon"></svg>' },
    })
    expect(w.find('header').classes()).toEqual(['oc-site-header', 'oc-site-header--dark'])
    const mark = w.find('a.oc-brand-mark')
    expect(mark.attributes('href')).toBe('#')
    expect(mark.attributes('aria-label')).toBe('Company 1, home')
    expect(mark.find('svg.oc-brand-mark__icon').exists()).toBe(true)
    expect(mark.find('.oc-brand-mark__tagline').text()).toBe('Software & IT')
    expect(w.find('.oc-site-header__brand').exists()).toBe(false)
    expect(w.find('.oc-site-header__inner > .oc-site-header__actions a').text()).toBe('Contact')
    expect(w.find('header > .oc-site-header__progress').attributes('aria-hidden')).toBe('true')
  })
})

describe('0.17.0 site footer block', () => {
  it('without the new props the bottom bar keeps two spans', () => {
    const w = mount(OcBlockSiteFooter, { props: { columns: [{ title: 'Company', links: [{ label: 'About', href: '#' }] }], copyright: '© 2026 Company 1', credit: 'Built with OmniaCSS' } })
    expect(w.find('footer').classes()).toEqual(['oc-site-footer'])
    expect(w.findAll('.oc-site-footer__bottom > span')).toHaveLength(2)
    expect(w.find('.oc-site-footer__social').exists()).toBe(false)
  })

  it('brand mark, social, more lists, legal and build', () => {
    const w = mount(OcBlockSiteFooter, {
      props: {
        brandMark: { name: 'Company', accent: '1', label: 'Company 1, home' },
        social: [{ label: 'LinkedIn', href: '#', icon: 'mdi:linkedin' }],
        columns: [{ title: 'Projects', links: [{ label: 'Customer 1', href: '#' }], more: [{ title: 'Tools', links: [{ label: 'Tool 1', href: '#' }] }] }, { title: 'Contact', lines: [{ label: 'info@company1.example', href: 'mailto:info@company1.example' }, { label: 'Street 1' }] }, { title: 'Helpdesk', links: [{ label: 'Remote support', href: '#' }] }],
        copyright: '© 2026 Company 1',
        legal: [{ label: 'Terms', href: '#' }, { label: 'Privacy', href: '#' }],
        build: 'build 2026.11.02',
      },
    })
    expect(w.find('.oc-site-footer__about > a.oc-brand-mark.oc-brand-mark--sm').exists()).toBe(true)
    expect(w.find('.oc-site-footer__about > ul.oc-site-footer__social a').attributes('aria-label')).toBe('LinkedIn')
    expect(w.find('h2.oc-site-footer__subtitle').text()).toBe('Tools')
    const cols = w.findAll('.oc-site-footer__grid > div')
    expect(cols[2].find('address.oc-site-footer__list a').attributes('href')).toBe('mailto:info@company1.example')
    expect(cols[2].find('ul').exists()).toBe(false)
    expect(cols[3].find('h2').text()).toBe('Helpdesk')
    const legal = w.find('.oc-site-footer__bottom > ul.oc-site-footer__legal')
    expect(legal.findAll('a')).toHaveLength(2)
    expect(legal.find('li.oc-site-footer__build').text()).toBe('build 2026.11.02')
    expect(w.findAll('.oc-site-footer__bottom > span')).toHaveLength(1)
  })

  it('center variant: about, row, social and one bottom line', () => {
    const w = mount(OcBlockSiteFooter, {
      props: { variant: 'center', about: 'Web apps.', row: [{ label: 'Product', href: '#' }], social: [{ label: 'GitHub', href: '#', icon: 'mdi:github' }], copyright: '© 2026 Company 1' },
      slots: { brand: '<a class="oc-site-header__brand" href="#">Company 1</a>' },
    })
    expect(w.find('footer').classes()).toEqual(['oc-site-footer', 'oc-site-footer--center'])
    expect(w.find('.oc-site-footer__grid').exists()).toBe(false)
    expect(w.find('.oc-container').element.children.length).toBe(4)
    expect(w.findAll('.oc-site-footer__bottom > span')).toHaveLength(1)
  })

  it('newsletter emits subscribe without an action', async () => {
    const w = mount(OcBlockSiteFooter, { props: { variant: 'dark', newsletter: { placeholder: 'info@company1.example' }, social: [{ label: 'LinkedIn', href: '#', icon: 'mdi:linkedin' }] } })
    const input = w.find('form.oc-site-footer__signup input.oc-input')
    expect(w.find('label.oc-visually-hidden').attributes('for')).toBe(input.attributes('id'))
    await input.setValue('info@company1.example')
    await w.find('form').trigger('submit')
    expect(w.emitted('subscribe')![0]).toEqual(['info@company1.example'])
    expect(w.find('.oc-site-footer__about > div > .oc-site-footer__social').exists()).toBe(true)
  })
})

describe('0.17.0 topbar', () => {
  it('brand with logo, checkbox menu, navmenu links, actions', () => {
    const w = mount(OcTopbar, { props: { brand: 'Company 1', logo: 'mdi:lightning-bolt', links: items }, slots: { actions: '<a class="oc-btn oc-btn--sm" href="#">Get started</a>' } })
    expect(w.find('header').classes()).toEqual(['oc-topbar', 'oc-topbar--collapsible'])
    expect(w.find('.oc-topbar-brand > .oc-topbar-logo').exists()).toBe(true)
    expect(w.find('.oc-topbar-brand').text()).toBe('Company 1')
    expect(w.find('label.oc-topbar-burger').attributes('for')).toBe(w.find('input.oc-topbar-toggle').attributes('id'))
    const a = w.findAll('ul.oc-navmenu.oc-navmenu--site a.oc-navmenu-link')
    expect(a).toHaveLength(2)
    expect(a[0].attributes('aria-current')).toBe('page')
    expect(w.find('.oc-topbar-actions a').text()).toBe('Get started')
  })

  it('modifiers, strip above, icon link, not collapsible', () => {
    const w = mount(OcTopbar, {
      props: { brand: 'Company 1', variant: 'dark', center: true, plain: true, links: [{ label: 'GitHub', href: '#', icon: 'mdi:github' }] },
      slots: { strip: '<span>info@company1.example</span>' },
      attrs: { class: 'x' },
    })
    expect(w.find('.oc-topbar-strip').exists()).toBe(true)
    expect(w.find('header').classes()).toEqual(['x', 'oc-topbar', 'oc-topbar--collapsible', 'oc-topbar--dark', 'oc-topbar--center', 'oc-topbar--plain'])
    expect(w.find('.oc-navmenu-link').attributes('aria-label')).toBe('GitHub')
    const plain = mount(OcTopbar, { props: { brand: 'Company 1', collapsible: false } })
    expect(plain.find('.oc-topbar-toggle').exists()).toBe(false)
    expect(plain.find('header').classes()).toEqual(['oc-topbar'])
  })
})

// --- part c ---
describe('0.17.0 W4 route blocks (Vue)', () => {
  it('route progress: list label, finish tone and the bar from done / total', () => {
    const w = mount(OcBlockRouteProgress, {
      props: {
        title: 'Route 1', score: 80, done: 5, total: 6, listLabel: 'Route steps',
        next: { tone: 'finish', icon: 'mdi:flag-checkered', title: 'The finish is open', meta: '350 m' },
        steps: [{ name: 'Old gate', state: 'done' }, { name: 'Finish', state: 'current', marker: 'mdi:flag-checkered', markerLabel: 'Finish' }],
      },
    })
    expect(w.find('.oc-block-route-progress-list').attributes('aria-label')).toBe('Route steps')
    expect(w.find('.oc-block-route-progress-next').classes()).toContain('oc-block-route-progress-next--finish')
    expect(w.find('.oc-block-route-progress-bar-label').text()).toContain('83%')
    expect(w.find('.oc-block-route-progress-score b').text()).toBe('80')
  })

  it('route progress keeps the default list label', () => {
    const w = mount(OcBlockRouteProgress, { props: { title: 'Route 1', done: 0, total: 2, steps: [] } })
    expect(w.find('.oc-block-route-progress-list').attributes('aria-label')).toBe('Steps')
  })

  it('step view: question.name names the radio group', () => {
    const w = mount(OcBlockStepView, { props: { title: 'Town hall', number: 3, question: { text: 'Which year?', options: ['1890', '1910'], name: 'answer' } } })
    expect(w.findAll('input.oc-radio').every((i) => i.attributes('name') === 'answer')).toBe(true)
    expect(w.find('.oc-block-step-view-picture--empty').attributes('data-number')).toBe('3')
  })

  it('route steps locked: lock line, grips disabled, no move items', () => {
    const w = mount(OcBlockRouteSteps, {
      props: { title: 'Steps of Route 1', locked: true, lockedLabel: 'Order locked during the live round', search: false, steps: [{ id: 'l1', name: 'Old gate' }, { id: 'l2', name: 'Market square' }] },
    })
    expect(w.classes()).toContain('oc-block-route-steps--locked')
    expect(w.find('.oc-block-route-steps-lock').text()).toBe('Order locked during the live round')
    expect(w.findAll('.oc-sortable-row-grip').every((g) => g.attributes('disabled') !== undefined)).toBe(true)
    expect(w.text()).not.toContain('Move up')
  })

  it('type picker action mode: buttons, a reason on the unavailable card', async () => {
    const w = mount(OcBlockTypePicker, {
      props: { mode: 'action', search: false, options: [{ value: 'text', label: 'Text' }, { value: 'question', label: 'Question', disabledReason: 'This step already has a question' }] },
    })
    expect(w.classes()).toContain('oc-block-type-picker--action')
    const cards = w.findAll('button.oc-block-type-picker-item')
    expect(cards).toHaveLength(2)
    expect(cards[1].attributes('aria-disabled')).toBe('true')
    await cards[1].trigger('click')
    expect(w.emitted('pick')).toBeUndefined()
    await cards[0].trigger('click')
    expect(w.emitted('pick')![0][0]).toBe('text')
  })
})

// --- part d ---
describe('0.17.0 W4 marketing blocks (vue)', () => {
  it('showcase: pill (and tag), imageAlt, cardMin', () => {
    const w = mount(OcBlockShowcase, {
      props: {
        title: 'Websites',
        cardMin: '20rem',
        projects: [
          { href: '/p1', accent: 'green', pill: 'Website with CMS', name: 'Project 1', image: '/s.png', imageAlt: 'Shot' },
          { href: '/p2', tag: 'Custom website', name: 'Project 2' },
        ],
      },
    })
    expect(w.find('.oc-card-grid').attributes('style')).toContain('--oc-card-min: 20rem')
    const pills = w.findAll('.oc-pill')
    expect(pills.map((p) => p.text())).toEqual(['Website with CMS', 'Custom website'])
    expect(pills[0].classes()).toEqual(['oc-pill', 'oc-pill--accent', 'justify-self-start'])
    expect(w.find('img').attributes('alt')).toBe('Shot')
  })

  it('hero-code: tiles and codeDark', () => {
    const w = mount(OcBlockHeroCode, { props: { title: 'T', code: 'x', codeDark: true, tiles: [{ glyph: 'A', accent: 'cyan', style: 'inset: 0' }] } })
    expect(w.find('.oc-code-window').classes()).toContain('oc-code-window--dark')
    const tiles = w.findAll('.oc-icon-tile--float')
    expect(tiles.length).toBe(1)
    expect(tiles[0].classes()).toContain('oc-accent--cyan')
    expect(tiles[0].text()).toBe('A')
    const plain = mount(OcBlockHeroCode, { props: { title: 'T', code: 'x' } })
    expect(plain.findAll('.oc-icon-tile--float').length).toBe(3)
    expect(plain.find('.oc-code-window').classes()).toEqual(['oc-code-window'])
  })

  it('product-grid: pill alias and webicon icon; no empty icon tile', () => {
    const w = mount(OcBlockProductGrid, {
      props: { title: 'P', products: [{ name: 'Product 1', icon: '◆', pill: 'Own product' }, { name: 'Product 2', icon: 'mdi:package-variant', tag: 'Tool' }, { name: 'Product 3' }] },
    })
    const tiles = w.findAll('.oc-icon-tile')
    expect(tiles.length).toBe(2)
    expect(tiles[0].text()).toBe('◆')
    expect(tiles[1].find('svg, iconify-icon').exists()).toBe(true)
    expect(w.findAll('.oc-pill').map((p) => p.text())).toEqual(['Own product', 'Tool'])
  })

  it('about-timeline: badge prop, accent and timelineAccent', () => {
    const w = mount(OcBlockAboutTimeline, { props: { title: 'T', badge: '40 projects', accent: 'green', reverse: true, timelineAccent: true, timeline: [{ date: '2016' }] } })
    expect(w.classes()).toEqual(['oc-block-about', 'oc-block-about--reverse', 'oc-accent--green'])
    expect(w.find('.oc-block-about-badge').text()).toBe('40 projects')
    expect(w.find('ol').classes()).toContain('oc-timeline--accent')
    const plain = mount(OcBlockAboutTimeline, { props: { title: 'T' } })
    expect(plain.find('.oc-block-about-badge').exists()).toBe(false)
    expect(plain.classes()).toEqual(['oc-block-about'])
  })

  it('portfolio-grid: link text + linkHref + linkTone; slot wins', () => {
    const w = mount(OcBlockPortfolioGrid, { props: { title: 'Case studies', two: true, link: 'All cases', linkHref: '#cases', linkTone: 'muted', projects: [{ href: '#c1', name: 'Customer 4' }] } })
    const a = w.find('.oc-block-portfolio-head > a')
    expect(a.classes()).toEqual(['oc-link-arrow', 'oc-link-arrow--muted'])
    expect(a.attributes('href')).toBe('#cases')
    expect(a.text()).toBe('All cases')
    const s = mount(OcBlockPortfolioGrid, { props: { title: 'T', link: 'x', linkHref: '/x' }, slots: { link: '<a class="mine" href="/m">Mine</a>' } })
    expect(s.find('.oc-block-portfolio-head > a').classes()).toEqual(['mine'])
  })

  it('contact-grid: webicon name in the mark', () => {
    const w = mount(OcBlockContactGrid, { props: { plain: true, title: 'Reach', cards: [{ title: 'Office', address: true, icon: 'mdi:map-marker-outline', accent: 'orange', lines: [{ text: 'Company 1' }] }, { title: 'Phone', icon: '☎', lines: [] }] } })
    const marks = w.findAll('.oc-product-mark')
    expect(marks[0].find('svg, iconify-icon').exists()).toBe(true)
    expect(marks[1].text()).toBe('☎')
    expect(w.find('address').exists()).toBe(true)
  })
})

// --- part e ---
describe('OcBlockHeroOrbit 0.17.0 options', () => {
  it('keeps the default markup without the new props', () => {
    const w = mount(OcBlockHeroOrbit, { props: { title: 'Hero' } })
    expect(w.find('h1.oc-display').exists()).toBe(true)
    expect(w.find('.oc-split--lead').exists()).toBe(false)
    const marks = w.findAll('.oc-block-orbit-mark')
    expect(marks).toHaveLength(6)
    expect(marks[1].attributes('style')).toContain('--oc-orbit-angle: 60deg')
    expect(marks[0].find('span').classes()).toEqual(['oc-product-mark', 'oc-product-mark--sm', 'oc-accent--green'])
    expect(w.find('.oc-code-window.oc-block-orbit-center').exists()).toBe(true)
  })

  it('renders the floating variant with a wider copy column', () => {
    const w = mount(OcBlockHeroOrbit, { props: { title: 'Fits', splitLead: true, float: true } })
    expect(w.find('.oc-container.oc-split.oc-split--lead').exists()).toBe(true)
    expect(w.find('.oc-block-orbit-visual.oc-block-orbit-visual--float').exists()).toBe(true)
    expect(w.find('.oc-block-orbit-mark').attributes('style')).toBeUndefined()
  })

  it('renders soft marks from a start angle, an h2 and a big center mark', () => {
    const w = mount(OcBlockHeroOrbit, {
      props: {
        title: 'Every module',
        headingLevel: 2,
        softMarks: true,
        markSize: 'md',
        startAngle: 45,
        marks: [
          { glyph: 'A', accent: 'green' },
          { glyph: 'B', accent: 'orange' },
          { glyph: 'C', accent: 'cyan' },
          { glyph: 'D', accent: 'violet', angle: 300 },
        ],
        centerMark: { glyph: 'E', accent: 'blue' },
      },
    })
    expect(w.find('h1').exists()).toBe(false)
    expect(w.find('h2.oc-display.oc-display--md').text()).toBe('Every module')
    const marks = w.findAll('.oc-block-orbit-mark')
    expect(marks[0].attributes('style')).toContain('45deg')
    expect(marks[1].attributes('style')).toContain('135deg')
    expect(marks[3].attributes('style')).toContain('300deg')
    expect(marks[0].find('span').classes()).toEqual(['oc-product-mark', 'oc-product-mark--soft', 'oc-accent--green'])
    expect(w.find('.oc-block-orbit-center').classes()).toEqual(['oc-block-orbit-center', 'oc-product-mark', 'oc-product-mark--xl', 'oc-accent--blue'])
    expect(w.find('.oc-code-window').exists()).toBe(false)
  })
})

describe('OcBlockAuthSplit 0.17.0 options', () => {
  it('shows a photo brand panel, the logo link and form attributes', () => {
    const w = mount(OcBlockAuthSplit, {
      props: { photo: '/img/team.webp', logoHref: '/home', formAttrs: { 'data-form': 'login' } },
      slots: { logo: 'Company 1' },
    })
    const aside = w.find('aside')
    expect(aside.classes()).toEqual(['oc-block-authsplit-brand', 'oc-block-authsplit-brand--photo'])
    expect(aside.attributes('style')).toContain('/img/team.webp')
    expect(w.find('.oc-block-authsplit-logo').attributes('href')).toBe('/home')
    const form = w.find('form')
    expect(form.attributes('data-form')).toBe('login')
    expect(form.attributes('action')).toBe('#')
  })

  it('keeps the plain brand panel by default', () => {
    const w = mount(OcBlockAuthSplit)
    expect(w.find('aside').classes()).toEqual(['oc-block-authsplit-brand'])
    expect(w.find('aside').attributes('style')).toBeUndefined()
  })
})
