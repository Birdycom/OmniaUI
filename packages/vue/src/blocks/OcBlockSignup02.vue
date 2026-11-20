<!-- File: packages/vue/src/blocks/OcBlockSignup02.vue | Map: props (snippet defaults) -> OcAuthBlock kind=signup, reversed split with terms checkbox -->
<script setup lang="ts">
/**
 * Signup 02: registration form next to a brand panel with a quote and a terms checkbox (snippet signup-02).
 * Classes: .oc-block-authduo--reverse, -panel--image, -quote
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthSignupProps, AuthBlockPanel } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthSignupProps>(), {
  layout: 'split',
  reverse: true,
  title: 'Create your account',
  text: 'Free for 14 days, no card needed',
  nameLabel: 'Full name',
  terms: 'I agree to the',
  termsLink: () => ({ label: 'terms', href: '#' }),
  submitLabel: 'Create account',
  footer: 'Already registered?',
  footerLink: () => ({ label: 'Sign in', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
/** The brand panel of the snippet; the `panel` prop merges over it. */
const defaultPanel: AuthBlockPanel = { tone: 'image', quote: '\u201cSetup took ten minutes and the whole team was on board by lunch.\u201d', quoteAuthor: 'Customer 3, product manager' }
</script>

<template>
  <OcAuthBlock kind="signup" v-bind="props" :default-panel="defaultPanel" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
