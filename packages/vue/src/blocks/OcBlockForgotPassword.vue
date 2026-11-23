<!-- File: packages/vue/src/blocks/OcBlockForgotPassword.vue | Map: props (snippet defaults) -> OcAuthBlock kind=forgot -->
<script setup lang="ts">
/**
 * Forgot password: request a reset link with an e-mail field, submit and a back link (snippet forgot-password).
 * Classes: .oc-block-authpage, .oc-block-authcard
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthForgotProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthForgotProps>(), {
  layout: 'card',
  title: 'Forgot your password?',
  text: 'Enter your e-mail and we will send you a reset link',
  submitLabel: 'Send reset link',
  footerLink: () => ({ label: 'Back to sign in', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
</script>

<template>
  <OcAuthBlock kind="forgot" v-bind="props" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
