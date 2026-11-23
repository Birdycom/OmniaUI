<!-- File: packages/vue/src/blocks/OcBlockLogin02.vue | Map: props (snippet defaults) -> OcAuthBlock kind=login, split layout with quote panel -->
<script setup lang="ts">
/**
 * Login 02: brand panel with a quote next to the sign-in form, remember me and forgot password (snippet login-02).
 * The panel hides when the block is narrow. `panel` merges over the default panel (tone, photo, logo, quote).
 * Classes: .oc-block-authduo (--reverse), -grid, -panel (--image, --muted, --photo), -logo, -quote, -form
 * Emits `submit` (native SubmitEvent; call preventDefault to handle it yourself) and `social` (index).
 * Slots: default (replaces the fields; the submit button stays), panel, panel-logo, footer, legal.
 */
import OcAuthBlock from '../blockParts/OcAuthBlock.vue'
import type { AuthLoginProps, AuthBlockPanel } from '../blockParts/authBlock'

const props = withDefaults(defineProps<AuthLoginProps>(), {
  layout: 'split',
  title: 'Welcome back',
  text: 'Sign in to your workspace',
  password: true,
  rememberLabel: 'Remember me',
  forgot: () => ({ label: 'Forgot password?', href: '#' }),
  submitLabel: 'Sign in',
  footer: 'No account yet?',
  footerLink: () => ({ label: 'Create one', href: '#' }),
})
const emit = defineEmits<{ submit: [event: SubmitEvent]; social: [index: number] }>()
/** The brand panel of the snippet; the `panel` prop merges over it. */
const defaultPanel: AuthBlockPanel = { tone: 'image', quote: '\u201cThis workspace saved me hours of admin every week.\u201d', quoteAuthor: 'Customer 1, operations lead' }
</script>

<template>
  <OcAuthBlock kind="login" v-bind="props" :default-panel="defaultPanel" @submit="emit('submit', $event)" @social="emit('social', $event)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </OcAuthBlock>
</template>
