<!-- File: packages/vue/src/blockParts/OcAuthBlock.vue | Map: props (kind + frame + fields) -> page / split / minimal root -> form: logo tile, head, social, fields per kind, hint, submit, foot, legal -->
<script setup lang="ts">
/**
 * @internal Shared renderer of the auth page blocks (OcBlockLogin01..03, OcBlockSignup01..02, OcBlockOtp01..02,
 * OcBlockForgotPassword, OcBlockResetPassword). Not listed as a block: it lives outside src/blocks.
 * Emits `submit` (native SubmitEvent), `social` (index), `complete` (otp code).
 * Slots: default (replaces the fields; the submit button stays), panel (panel content), panel-logo, footer, legal.
 */
import { computed, h, ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'
import OcPasswordInput from '../components/OcPasswordInput.vue'
import OcOtpInput from '../components/OcOtpInput.vue'
import { AUTH_ICONS } from './authBlock'
import type { AuthBlockAllProps, AuthBlockPanel } from './authBlock'

const props = withDefaults(defineProps<AuthBlockAllProps & { defaultPanel?: AuthBlockPanel }>(), {
  layout: 'card',
  socialPosition: 'top',
  action: '#',
  method: 'post',
  emailLabel: 'E-mail',
  emailPlaceholder: 'name@company1.example',
  passwordLabel: 'Password',
  password: true,
  namePlaceholder: 'Contact 1',
  codeLabel: 'Verification code',
  length: 6,
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number]; complete: [code: string] }>()
const code = defineModel<string>('code', { default: '' })
const id = useUid('oc-auth').replace(/[^\w-]/g, '')
const otp = ref(code.value)

const tile = computed(() => (props.icon === null ? null : props.icon ?? (props.layout === 'split' ? null : AUTH_ICONS[props.kind])))
const p = computed<AuthBlockPanel>(() => ({ ...props.defaultPanel, ...props.panel }))
const tone = computed(() => p.value.tone ?? 'image')
const panelStyle = computed(() => (tone.value === 'photo' && p.value.photo ? { '--oc-authduo-photo': `url('${p.value.photo}')` } : undefined))
const rootClass = computed(() =>
  props.layout === 'split'
    ? ['oc-block-authduo', props.reverse && 'oc-block-authduo--reverse']
    : props.layout === 'minimal'
      ? 'oc-block-authmin'
      : ['oc-block-authpage', !props.muted && 'oc-block-authpage--plain'],
)
const formClass = computed(() => ['oc-block-authcard', props.layout !== 'card' && 'oc-block-authcard--flat', props.wide && 'oc-block-authcard--wide'])
const hasSocial = computed(() => (props.social?.length ?? 0) > 0)
/** A div with class `cls`, or only its children when `cls` is empty (the card / minimal layouts have no grid). */
const Wrap: FunctionalComponent<{ cls?: string }> = (wp, { slots }) => (wp.cls ? h('div', { class: wp.cls }, slots.default?.()) : slots.default?.())
const onCode = (v: string) => {
  otp.value = v
  code.value = v
}
</script>

<template>
  <div :class="rootClass">
    <Wrap :cls="layout === 'split' ? 'oc-block-authduo-grid' : undefined">
      <aside v-if="layout === 'split'" :class="['oc-block-authduo-panel', `oc-block-authduo-panel--${tone}`]" :style="panelStyle">
        <slot name="panel">
          <a class="oc-block-authduo-logo" :href="p.logoHref ?? '#'"><slot name="panel-logo"><OcWebicon name="mdi:layers-outline" bare fallback="iconify" /> {{ p.logo ?? 'Company 1' }}</slot></a>
          <blockquote v-if="p.quote" class="oc-block-authduo-quote">
            <p>{{ p.quote }}</p>
            <footer v-if="p.quoteAuthor">{{ p.quoteAuthor }}</footer>
          </blockquote>
        </slot>
      </aside>
      <Wrap :cls="layout === 'split' ? 'oc-block-authduo-form' : undefined">
        <form :class="formClass" :action="action" :method="method" @submit="emit('submit', $event as SubmitEvent)">
          <span v-if="tile" class="oc-block-authcard-logo"><OcWebicon :name="tile" bare fallback="iconify" /></span>
          <div v-if="title || text" class="oc-block-authcard-head">
            <h1 v-if="title" class="oc-block-authcard-title">{{ title }}</h1>
            <p v-if="text" class="oc-block-authcard-text">{{ text }}</p>
          </div>
          <template v-if="hasSocial && socialPosition === 'top'">
            <div class="oc-block-authsocial"><button v-for="(s, i) in social" :key="i" class="oc-btn oc-btn--outline" type="button" @click="emit('social', i)">{{ s }}</button></div>
            <div v-if="dividerLabel" class="oc-separator-text">{{ dividerLabel }}</div>
          </template>
          <div class="oc-block-authcard-fields">
            <slot>
              <div v-if="kind === 'signup' && nameLabel" class="oc-field">
                <label class="oc-field-label" :for="`${id}-name`">{{ nameLabel }}</label>
                <input :id="`${id}-name`" class="oc-input" name="name" type="text" autocomplete="name" required :placeholder="namePlaceholder" />
              </div>
              <div v-if="kind === 'login' || kind === 'signup' || kind === 'forgot'" class="oc-field">
                <label class="oc-field-label" :for="`${id}-email`">{{ emailLabel }}</label>
                <input :id="`${id}-email`" class="oc-input" name="email" type="email" :autocomplete="kind === 'signup' ? 'email' : 'username'" required :placeholder="emailPlaceholder" />
              </div>
              <div v-if="(kind === 'login' && password) || kind === 'signup' || kind === 'reset'" class="oc-field">
                <label class="oc-field-label" :for="`${id}-password`">{{ passwordLabel }}</label>
                <OcPasswordInput :id="`${id}-password`" name="password" :autocomplete="kind === 'login' ? 'current-password' : 'new-password'" required />
              </div>
              <div v-if="(kind === 'signup' || kind === 'reset') && confirmLabel" class="oc-field">
                <label class="oc-field-label" :for="`${id}-confirm`">{{ confirmLabel }}</label>
                <OcPasswordInput :id="`${id}-confirm`" name="password_confirmation" autocomplete="new-password" required />
              </div>
              <div v-if="kind === 'login' && (rememberLabel || forgot)" class="oc-block-authcard-row">
                <label v-if="rememberLabel"><input class="oc-checkbox" type="checkbox" name="remember" /> {{ rememberLabel }}</label>
                <a v-if="forgot" class="oc-link" :href="forgot.href">{{ forgot.label }}</a>
              </div>
              <label v-if="kind === 'signup' && terms"><input class="oc-checkbox" type="checkbox" name="terms" required /> {{ terms }}<template v-if="termsLink">{{ ' ' }}<a class="oc-link" :href="termsLink.href">{{ termsLink.label }}</a></template></label>
              <div v-if="kind === 'otp'" class="oc-field">
                <label class="oc-field-label" :for="`${id}-code`">{{ codeLabel }}</label>
                <OcOtpInput :id="`${id}-code`" name="code" :length="length" :model-value="otp" @update:model-value="onCode" @complete="emit('complete', $event)" />
                <p v-if="description" class="oc-field-description">{{ description }}</p>
              </div>
            </slot>
            <p v-if="hint" class="oc-block-authcard-hint">{{ hint }}</p>
            <button class="oc-btn oc-block-authcard-submit" type="submit">{{ submitLabel }}</button>
          </div>
          <template v-if="hasSocial && socialPosition === 'bottom'">
            <div v-if="dividerLabel" class="oc-separator-text">{{ dividerLabel }}</div>
            <div class="oc-block-authsocial"><button v-for="(s, i) in social" :key="i" class="oc-btn oc-btn--outline" type="button" @click="emit('social', i)">{{ s }}</button></div>
          </template>
          <p v-if="$slots.footer || footer || footerLink" class="oc-block-authcard-foot"><slot name="footer">{{ footer }}{{ footer && footerLink ? ' ' : '' }}<a v-if="footerLink" :href="footerLink.href">{{ footerLink.label }}</a></slot></p>
          <p v-if="$slots.legal || legal" class="oc-block-authcard-legal"><slot name="legal">{{ legal }}<template v-for="(l, i) in legalLinks ?? []" :key="i">{{ i === 0 ? ' ' : ' and ' }}<a :href="l.href">{{ l.label }}</a></template><template v-if="legalLinks?.length">.</template></slot></p>
        </form>
      </Wrap>
    </Wrap>
  </div>
</template>
