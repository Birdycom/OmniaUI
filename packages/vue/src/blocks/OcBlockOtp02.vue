<!-- File: packages/vue/src/blocks/OcBlockOtp02.vue | Map: props (snippet defaults) -> OcAuthBlock kind=otp, split layout with muted panel -->
<script setup lang="ts">
/**
 * OTP 02: verification form beside a brand panel (snippet otp-02). panel.tone 'photo' + panel.photo for a photo panel.
 * Classes: .oc-block-authduo, -panel--muted, .oc-otp
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index), `complete` (code); v-model:code.
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthOtpProps, AuthBlockPanel } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthOtpProps>(), {
  layout: 'split',
  title: 'Verify your login',
  text: 'Enter the code from your authenticator app',
  description: 'Enter the 6-digit code we sent to your authenticator app.',
  length: 6,
  submitLabel: 'Verify',
  footer: 'Lost your device?',
  footerLink: () => ({ label: 'Use a recovery code', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number]; complete: [code: string] }>()
const code = defineModel<string>('code', { default: '' })
/** The brand panel of the snippet; the `panel` prop merges over it. */
const defaultPanel: AuthBlockPanel = { tone: 'muted', quote: '\u201cTwo-step verification keeps our client data where it belongs.\u201d', quoteAuthor: 'Security team' }
</script>

<template>
  <OcAuthBlock kind="otp" v-bind="props" :default-panel="defaultPanel" v-model:code="code" @complete="emit('complete', $event)" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
