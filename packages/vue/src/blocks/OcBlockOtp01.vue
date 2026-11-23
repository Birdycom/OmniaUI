<!-- File: packages/vue/src/blocks/OcBlockOtp01.vue | Map: props (snippet defaults) -> OcAuthBlock kind=otp, card layout -->
<script setup lang="ts">
/**
 * OTP 01: verification card with a six-digit code, verify button and a resend link (snippet otp-01).
 * Classes: .oc-block-authpage, .oc-block-authcard, .oc-otp, .oc-field-description
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index), `complete` (code); v-model:code.
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthOtpProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthOtpProps>(), {
  layout: 'card',
  title: 'Enter verification code',
  text: 'We sent a 6-digit code to your e-mail',
  description: 'Enter the 6-digit code we sent to name@company1.example.',
  length: 6,
  submitLabel: 'Verify',
  footer: "Didn't receive the code?",
  footerLink: () => ({ label: 'Resend', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number]; complete: [code: string] }>()
const code = defineModel<string>('code', { default: '' })
</script>

<template>
  <OcAuthBlock kind="otp" v-bind="props" v-model:code="code" @complete="emit('complete', $event)" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
