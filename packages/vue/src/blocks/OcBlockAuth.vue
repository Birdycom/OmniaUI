<script setup lang="ts">
/**
 * Sign-in card. Slots: default (fields, e.g. .oc-form-group blocks), actions (primary button),
 * social (alternative sign-in buttons, shown under the divider text), footer.
 * Classes: .oc-block-auth, -card, -divider, -footer, .oc-block-subtitle
 */
defineProps<{ title?: string; subtitle?: string; divider?: string }>()
</script>

<template>
  <div class="oc-block-auth">
    <div class="oc-block-auth-card">
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="subtitle" class="oc-block-subtitle">{{ subtitle }}</p>
      <slot />
      <slot name="actions" />
      <template v-if="$slots.social">
        <div v-if="divider" class="oc-block-auth-divider">{{ divider }}</div>
        <slot name="social" />
      </template>
    </div>
    <div v-if="$slots.footer" class="oc-block-auth-footer"><slot name="footer" /></div>
  </div>
</template>
