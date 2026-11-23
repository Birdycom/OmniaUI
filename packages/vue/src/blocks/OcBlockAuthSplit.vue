<script setup lang="ts">
import { computed } from 'vue'
/**
 * Sign-in with a brand panel (logo, quote) next to the form. Emits `submit` (the native submit event).
 * Slots: logo, quote (or `quote` + `quoteAuthor` props), default (fields), row (remember me / forgot password),
 * submit (default: a full-width primary button with `submitLabel`), footer.
 * 0.17.0: `photo` (brand panel with a photo, .oc-block-authsplit-brand--photo), `logoHref`, `formAttrs` (extra form attributes).
 * Classes: .oc-block-authsplit, -brand, -logo, -quote, -form, -card, -title, -subtitle, -fields, -row
 */
const props = withDefaults(
  defineProps<{
    title?: string
    /** 0.17.0: heading level of the title (default 1). */
    headingLevel?: 1 | 2
    subtitle?: string
    quote?: string
    quoteAuthor?: string
    submitLabel?: string
    action?: string
    method?: string
    photo?: string
    logoHref?: string
    formAttrs?: Record<string, string | number | boolean>
  }>(),
  { submitLabel: 'Sign in', action: '#', method: 'post', logoHref: '/', headingLevel: 1 },
)
const brandStyle = computed(() => (props.photo ? `--oc-authsplit-photo: url("${props.photo}")` : undefined))
defineEmits<{ submit: [event: SubmitEvent] }>()
</script>

<template>
  <div class="oc-block-authsplit">
    <aside :class="['oc-block-authsplit-brand', photo && 'oc-block-authsplit-brand--photo']" :style="brandStyle">
      <a v-if="$slots.logo" class="oc-block-authsplit-logo" :href="logoHref"><slot name="logo" /></a>
      <blockquote v-if="quote || $slots.quote" class="oc-block-authsplit-quote">
        <slot name="quote">
          <p>{{ quote }}</p>
          <footer v-if="quoteAuthor">{{ quoteAuthor }}</footer>
        </slot>
      </blockquote>
    </aside>
    <div class="oc-block-authsplit-form">
      <form class="oc-block-authsplit-card" :action="action" :method="method" v-bind="formAttrs" @submit="$emit('submit', $event)">
        <component :is="headingLevel === 2 ? 'h2' : 'h1'" v-if="title" class="oc-block-authsplit-title">{{ title }}</component>
        <p v-if="subtitle" class="oc-block-authsplit-subtitle">{{ subtitle }}</p>
        <div class="oc-block-authsplit-fields">
          <slot />
          <div v-if="$slots.row" class="oc-block-authsplit-row"><slot name="row" /></div>
          <slot name="submit"><button class="oc-btn" type="submit" style="width: 100%">{{ submitLabel }}</button></slot>
        </div>
        <slot name="footer" />
      </form>
    </div>
  </div>
</template>
