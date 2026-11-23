<script setup lang="ts">
/**
 * Brand column, link columns, a contact column and a bottom bar.
 * Slots: brand (the logo link), brand-icon (svg/img of a brandMark), bottom-start, bottom-end.
 * Optional: brandMark (a small .oc-brand-mark as the logo link), social (icons), newsletter (sign-up field; emits
 * `subscribe` with the e-mail when it has no action), variant center (brand, one `row` of links, social, bottom) or dark,
 * columns[].more (second title + list), legal + build (bottom bar).
 * Classes: .oc-site-footer, --center, --dark, __grid, __about, __title, __subtitle, __list, __row, __social, __signup,
 * __bottom, __legal, __build, .oc-site-header__brand
 */
import { computed, ref } from 'vue'
import { useUid } from '../composables/useUid'
import OcBrandMark from '../components/OcBrandMark.vue'
import OcWebicon from '../components/OcWebicon.vue'

export interface SiteFooterLink {
  label: string
  href: string
}
export interface SiteFooterColumn {
  title: string
  links?: SiteFooterLink[]
  /** Address column (rendered in an <address class="oc-site-footer__list">), anywhere among the columns. */
  lines?: { label: string; href?: string }[]
  /** More lists in the same column, each under a second title (.oc-site-footer__subtitle). */
  more?: { title: string; links: SiteFooterLink[] }[]
}
export interface SiteFooterContact {
  title: string
  lines: { label: string; href?: string }[]
}
export interface SiteFooterSocial {
  /** Accessible name ("LinkedIn"). */
  label: string
  href: string
  /** Webicon name ("mdi:linkedin"). */
  icon: string
}
export interface SiteFooterNewsletter {
  action?: string
  method?: string
  label?: string
  placeholder?: string
  name?: string
  button?: string
}
export interface SiteFooterBrandMark {
  name: string
  accent?: string
  tagline?: string
  /** aria-label of the logo link ("Company 1, home"). */
  label?: string
}
const props = withDefaults(
  defineProps<{
    about?: string
    columns?: SiteFooterColumn[]
    contact?: SiteFooterContact
    copyright?: string
    credit?: string
    homeHref?: string
    brandMark?: SiteFooterBrandMark
    social?: SiteFooterSocial[]
    socialLabel?: string
    newsletter?: SiteFooterNewsletter
    variant?: 'center' | 'dark'
    row?: SiteFooterLink[]
    legal?: SiteFooterLink[]
    build?: string
  }>(),
  { homeHref: '/', socialLabel: 'Social media' },
)
const emit = defineEmits<{ subscribe: [email: string] }>()
const mailId = useUid('oc-ft-mail')
const email = ref('')
const hasLegal = computed(() => (props.legal?.length ?? 0) > 0 || !!props.build)
function onSubmit(e: Event) {
  if (props.newsletter?.action) return
  e.preventDefault()
  emit('subscribe', email.value)
}
</script>

<template>
  <footer :class="['oc-site-footer', variant && `oc-site-footer--${variant}`]">
    <div class="oc-container">
      <template v-if="variant === 'center'">
        <div class="oc-site-footer__about">
          <slot name="brand">
            <OcBrandMark v-if="brandMark" :href="homeHref" :name="brandMark.name" :accent="brandMark.accent" :tagline="brandMark.tagline" size="sm" :aria-label="brandMark.label"><template #icon><slot name="brand-icon" /></template></OcBrandMark>
          </slot>
          <p v-if="about">{{ about }}</p>
        </div>
        <ul v-if="row?.length" class="oc-site-footer__row">
          <li v-for="link in row" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
        </ul>
        <ul v-if="social?.length" class="oc-site-footer__social" :aria-label="socialLabel">
          <li v-for="s in social" :key="s.href + s.label"><a :href="s.href" :aria-label="s.label"><OcWebicon :name="s.icon" bare fallback="iconify" /></a></li>
        </ul>
      </template>
      <div v-else class="oc-site-footer__grid">
        <div class="oc-site-footer__about">
          <slot name="brand">
            <OcBrandMark v-if="brandMark" :href="homeHref" :name="brandMark.name" :accent="brandMark.accent" :tagline="brandMark.tagline" size="sm" :aria-label="brandMark.label"><template #icon><slot name="brand-icon" /></template></OcBrandMark>
          </slot>
          <p v-if="about">{{ about }}</p>
          <form v-if="newsletter" class="oc-site-footer__signup" :action="newsletter.action" :method="newsletter.method" @submit="onSubmit">
            <label class="oc-visually-hidden" :for="mailId">{{ newsletter.label ?? 'E-mail' }}</label>
            <input :id="mailId" v-model="email" class="oc-input" type="email" :name="newsletter.name ?? 'email'" :placeholder="newsletter.placeholder" autocomplete="email" required>
            <button class="oc-btn" type="submit">{{ newsletter.button ?? 'Subscribe' }}</button>
          </form>
          <div v-if="social?.length && newsletter" style="margin-block-start: 1.25rem">
            <ul class="oc-site-footer__social" :aria-label="socialLabel">
              <li v-for="s in social" :key="s.href + s.label"><a :href="s.href" :aria-label="s.label"><OcWebicon :name="s.icon" bare fallback="iconify" /></a></li>
            </ul>
          </div>
          <ul v-else-if="social?.length" class="oc-site-footer__social" :aria-label="socialLabel">
            <li v-for="s in social" :key="s.href + s.label"><a :href="s.href" :aria-label="s.label"><OcWebicon :name="s.icon" bare fallback="iconify" /></a></li>
          </ul>
        </div>
        <div v-for="col in columns" :key="col.title">
          <h2 class="oc-site-footer__title">{{ col.title }}</h2>
          <ul v-if="col.links" class="oc-site-footer__list">
            <li v-for="link in col.links" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
          </ul>
          <address v-if="col.lines?.length" class="oc-site-footer__list">
            <template v-for="line in col.lines" :key="line.label">
              <a v-if="line.href" :href="line.href">{{ line.label }}</a>
              <span v-else>{{ line.label }}</span>
            </template>
          </address>
          <template v-for="m in col.more ?? []" :key="m.title">
            <h2 class="oc-site-footer__title oc-site-footer__subtitle">{{ m.title }}</h2>
            <ul class="oc-site-footer__list">
              <li v-for="link in m.links" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
            </ul>
          </template>
        </div>
        <div v-if="contact">
          <h2 class="oc-site-footer__title">{{ contact.title }}</h2>
          <address class="oc-site-footer__list">
            <template v-for="line in contact.lines" :key="line.label">
              <a v-if="line.href" :href="line.href">{{ line.label }}</a>
              <span v-else>{{ line.label }}</span>
            </template>
          </address>
        </div>
      </div>
      <div v-if="copyright || credit || hasLegal || $slots['bottom-start'] || $slots['bottom-end']" class="oc-site-footer__bottom">
        <span><slot name="bottom-start">{{ copyright }}</slot></span>
        <ul v-if="hasLegal" class="oc-site-footer__legal">
          <li v-for="link in legal ?? []" :key="link.href + link.label"><a :href="link.href">{{ link.label }}</a></li>
          <li v-if="build" class="oc-site-footer__build">{{ build }}</li>
        </ul>
        <span v-if="credit || $slots['bottom-end'] || (!hasLegal && variant !== 'center')"><slot name="bottom-end">{{ credit }}</slot></span>
      </div>
    </div>
  </footer>
</template>
