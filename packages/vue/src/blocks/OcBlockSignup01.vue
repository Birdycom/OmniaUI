<!-- File: packages/vue/src/blocks/OcBlockSignup01.vue | Map: props (snippet defaults) -> OcAuthBlock kind=signup, card layout -->
<script setup lang="ts">
/**
 * Signup 01: create-account card with name, e-mail, password and confirmation (snippet signup-01).
 * nameLabel / confirmLabel / terms null hide those fields.
 * Classes: .oc-block-authpage, .oc-block-authcard, -hint
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthSignupProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthSignupProps>(), {
  layout: 'card',
  title: 'Create an account',
  text: 'Enter your information to get started',
  nameLabel: 'Full name',
  confirmLabel: 'Confirm password',
  hint: 'Must be at least 8 characters long.',
  submitLabel: 'Create account',
  footer: 'Already have an account?',
  footerLink: () => ({ label: 'Sign in', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
</script>

<template>
  <OcAuthBlock kind="signup" v-bind="props" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
