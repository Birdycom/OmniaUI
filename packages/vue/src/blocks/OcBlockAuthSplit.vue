<script setup lang="ts">
/**
 * Sign-in with a brand panel (logo, quote) next to the form. Emits `submit` (the native submit event).
 * Slots: logo, quote (or `quote` + `quoteAuthor` props), default (fields), row (remember me / forgot password),
 * submit (default: a full-width primary button with `submitLabel`), footer.
 * Classes: .oc-block-authsplit, -brand, -logo, -quote, -form, -card, -title, -subtitle, -fields, -row
 */
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    quote?: string
    quoteAuthor?: string
    submitLabel?: string
    action?: string
    method?: string
  }>(),
  { submitLabel: 'Sign in', action: '#', method: 'post' },
)
defineEmits<{ submit: [event: SubmitEvent] }>()
</script>

<template>
  <div class="oc-block-authsplit">
    <aside class="oc-block-authsplit-brand">
      <a v-if="$slots.logo" class="oc-block-authsplit-logo" href="/"><slot name="logo" /></a>
      <blockquote v-if="quote || $slots.quote" class="oc-block-authsplit-quote">
        <slot name="quote">
          <p>{{ quote }}</p>
          <footer v-if="quoteAuthor">{{ quoteAuthor }}</footer>
        </slot>
      </blockquote>
    </aside>
    <div class="oc-block-authsplit-form">
      <form class="oc-block-authsplit-card" :action="action" :method="method" @submit="$emit('submit', $event)">
        <h1 v-if="title" class="oc-block-authsplit-title">{{ title }}</h1>
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
