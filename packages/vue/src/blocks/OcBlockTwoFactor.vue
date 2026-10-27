<script setup lang="ts">
/**
 * Authenticator setup: QR, copyable key, OTP code and recovery codes. v-model = the typed code.
 * Emits `submit` with the code (form submit of the confirm step). Slot `qr` replaces the QR placeholder.
 * Classes: .oc-block-twofactor, -step, -center, -qr; reuses copy-field, otp, recovery-codes components.
 */
import OcCopyField from '../components/OcCopyField.vue'
import OcOtpInput from '../components/OcOtpInput.vue'
import OcRecoveryCodes from '../components/OcRecoveryCodes.vue'
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    setupKey: string
    recoveryCodes?: string[]
    length?: number
    scanTitle?: string
    scanText?: string
    confirmTitle?: string
    codeLabel?: string
    submitLabel?: string
  }>(),
  {
    length: 6,
    scanTitle: '1. Scan the QR code',
    scanText: 'Use an authenticator app, or enter the key manually.',
    confirmTitle: '2. Confirm with a code',
    codeLabel: 'Authentication code',
    submitLabel: 'Enable two-factor',
  },
)
defineEmits<{ submit: [code: string] }>()
const code = defineModel<string>({ default: '' })
const codeId = useUid('oc-twofactor-code')
</script>

<template>
  <div class="oc-block-twofactor">
    <section class="oc-block-twofactor-step">
      <div class="oc-heading oc-heading--sm">
        <h2 class="oc-heading-title">{{ scanTitle }}</h2>
        <p v-if="scanText" class="oc-heading-description">{{ scanText }}</p>
      </div>
      <div class="oc-block-twofactor-center">
        <slot name="qr"><div class="oc-block-twofactor-qr" role="img" aria-label="QR code">QR code</div></slot>
        <OcCopyField :value="setupKey" label="Setup key" />
      </div>
    </section>
    <section class="oc-block-twofactor-step">
      <div class="oc-heading oc-heading--sm"><h2 class="oc-heading-title">{{ confirmTitle }}</h2></div>
      <div class="oc-field">
        <label class="oc-field-label" :for="codeId">{{ codeLabel }}</label>
        <OcOtpInput :id="codeId" v-model="code" name="code" :length="length" />
      </div>
      <button class="oc-btn" type="submit" @click="$emit('submit', code)">{{ submitLabel }}</button>
    </section>
    <section v-if="recoveryCodes?.length" class="oc-block-twofactor-step">
      <OcRecoveryCodes :codes="recoveryCodes" />
    </section>
  </div>
</template>
