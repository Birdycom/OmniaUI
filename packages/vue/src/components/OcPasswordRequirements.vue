<!-- File: packages/vue/src/components/OcPasswordRequirements.vue | Map: rule type + defaults -> props -> template (live list, --met per rule) -->
<script setup lang="ts">
/**
 * Live password rule checklist. Pass the password; each rule turns green (--met) when it passes.
 * Same markup as packages/ui/snippets/password-requirements.html.
 */
export interface PasswordRequirementRule {
  label: string
  /** True when the password meets the rule. */
  test: (password: string) => boolean
}

withDefaults(defineProps<{ password: string; rules?: PasswordRequirementRule[]; inline?: boolean; hideWhenEmpty?: boolean }>(), {
  // Common rules: length, uppercase, number, symbol.
  rules: () => [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ],
})
</script>

<template>
  <ul v-if="!hideWhenEmpty || password" :class="['oc-password-requirements', inline && 'oc-password-requirements--inline']" aria-live="polite">
    <li v-for="(rule, i) in rules" :key="i" :class="['oc-password-requirement', rule.test(password) && 'oc-password-requirement--met']">{{ rule.label }}</li>
  </ul>
</template>
