// File: packages/vue/tests/v0170-r3c.test.ts
// Map: 0.17.0 round 3C: headingLevel on the hero / header / auth blocks (default h1, 2 renders an h2 with the same class)

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OcBlockHero from '../src/blocks/OcBlockHero.vue'
import OcBlockHeroSplit from '../src/blocks/OcBlockHeroSplit.vue'
import OcBlockHeroCode from '../src/blocks/OcBlockHeroCode.vue'
import OcBlockModuleHeader from '../src/blocks/OcBlockModuleHeader.vue'
import OcBlockAuthSplit from '../src/blocks/OcBlockAuthSplit.vue'
import OcBlockLogin01 from '../src/blocks/OcBlockLogin01.vue'
import OcBlockSignup02 from '../src/blocks/OcBlockSignup02.vue'
import OcBlockOtp01 from '../src/blocks/OcBlockOtp01.vue'
import OcBlockForgotPassword from '../src/blocks/OcBlockForgotPassword.vue'
import OcBlockResetPassword from '../src/blocks/OcBlockResetPassword.vue'

describe('headingLevel', () => {
  it('hero and hero split: h1 by default, h2 with heading-level 2', () => {
    expect(mount(OcBlockHero, { props: { title: 'Title 1' } }).find('.oc-block-hero > h1').text()).toBe('Title 1')
    const two = mount(OcBlockHero, { props: { title: 'Title 2', headingLevel: 2 } })
    expect(two.find('h1').exists()).toBe(false)
    expect(two.find('.oc-block-hero > h2').text()).toBe('Title 2')
    expect(mount(OcBlockHeroSplit, { props: { title: 'Split' } }).find('h1').exists()).toBe(true)
    expect(mount(OcBlockHeroSplit, { props: { title: 'Split', headingLevel: 2 } }).find('.oc-block-hero-split h2').text()).toBe('Split')
  })

  it('hero code, module header and auth split keep their title class', () => {
    expect(mount(OcBlockHeroCode, { props: { title: 'Code' } }).find('h1.oc-display').exists()).toBe(true)
    expect(mount(OcBlockHeroCode, { props: { title: 'Code', headingLevel: 2 } }).find('h2.oc-display').text()).toContain('Code')
    expect(mount(OcBlockModuleHeader, { props: { title: 'Contacts' } }).find('h1.oc-block-modulehead-title').exists()).toBe(true)
    expect(mount(OcBlockModuleHeader, { props: { title: 'Contacts', headingLevel: 2 } }).find('h2.oc-block-modulehead-title').text()).toBe('Contacts')
    expect(mount(OcBlockAuthSplit, { props: { title: 'Welcome back' } }).find('h1.oc-block-authsplit-title').exists()).toBe(true)
    expect(mount(OcBlockAuthSplit, { props: { title: 'Welcome back', headingLevel: 2 } }).find('h2.oc-block-authsplit-title').text()).toBe('Welcome back')
  })

  it('auth page blocks pass heading-level to the card title', () => {
    expect(mount(OcBlockLogin01).find('h1.oc-block-authcard-title').text()).toBe('Login to your account')
    for (const comp of [OcBlockLogin01, OcBlockSignup02, OcBlockOtp01, OcBlockForgotPassword, OcBlockResetPassword]) {
      const w = (mount as (c: unknown, o: { props: Record<string, unknown> }) => ReturnType<typeof mount>)(comp, { props: { headingLevel: 2 } })
      expect(w.find('h1').exists()).toBe(false)
      expect(w.find('h2.oc-block-authcard-title').exists()).toBe(true)
    }
  })
})
