<!-- File: packages/vue/src/blocks/OcBlockLogin03.vue | Map: props (snippet defaults) -> OcAuthBlock kind=login, muted card with social buttons and legal line -->
<script setup lang="ts">
/**
 * Login 03: card on a muted page with social sign-in buttons above the e-mail form and a legal line (snippet login-03).
 * Classes: .oc-block-authpage, .oc-block-authsocial, .oc-separator-text, .oc-block-authcard-legal
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthLoginProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthLoginProps>(), {
  layout: 'card',
  muted: true,
  title: 'Welcome back',
  text: 'Login with your Apple or Google account',
  social: () => ['Apple', 'Google'],
  dividerLabel: 'Or continue with',
  password: true,
  submitLabel: 'Login',
  footer: "Don't have an account?",
  footerLink: () => ({ label: 'Sign up', href: '#' }),
  legal: 'By clicking continue, you agree to our',
  legalLinks: () => [{ label: 'Terms of Service', href: '#' }, { label: 'Privacy Policy', href: '#' }],
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
</script>

<template>
  <OcAuthBlock kind="login" v-bind="props" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
