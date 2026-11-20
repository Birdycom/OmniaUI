<!-- File: packages/vue/src/blocks/OcBlockResetPassword.vue | Map: props (snippet defaults) -> OcAuthBlock kind=reset -->
<script setup lang="ts">
/**
 * Reset password: new password with reveal, confirmation, a rules hint and submit (snippet reset-password).
 * Classes: .oc-block-authpage, .oc-block-authcard, -hint
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthResetProps } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthResetProps>(), {
  layout: 'card',
  title: 'Set a new password',
  text: 'Your new password must differ from earlier ones',
  passwordLabel: 'New password',
  confirmLabel: 'Confirm password',
  hint: 'At least 8 characters, with a number and a symbol.',
  submitLabel: 'Reset password',
  footerLink: () => ({ label: 'Back to sign in', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
</script>

<template>
  <OcAuthBlock kind="reset" v-bind="props" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
