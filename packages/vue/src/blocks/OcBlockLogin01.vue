<!-- File: packages/vue/src/blocks/OcBlockLogin01.vue | Map: props (snippet defaults) -> OcAuthBlock kind=login, card layout -->
<script setup lang="ts">
/**
 * Login 01: centered sign-in card with e-mail, password and a link to sign up (snippet login-01).
 * Same form as OcBlockLogin02/03 (only the defaults differ): layout card | split | minimal, social buttons, remember me,
 * forgot link, password=false for a magic-link form.
 * Classes: .oc-block-authpage (--plain), .oc-block-authcard, -logo, -head, -title, -text, -fields, -submit, -foot, -legal
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthLoginProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthLoginProps>(), {
  layout: 'card',
  title: 'Login to your account',
  text: 'Enter your e-mail below to login',
  submitLabel: 'Login',
  password: true,
  footer: "Don't have an account?",
  footerLink: () => ({ label: 'Sign up', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
</script>

<template>
  <OcAuthBlock kind="login" v-bind="props" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
