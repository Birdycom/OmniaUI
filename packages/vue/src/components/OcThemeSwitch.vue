<script setup lang="ts">
/**
 * System / light / dark switch (CSS only: color-scheme + :has()). v-model: 'system' | 'light' | 'dark'.
 * `options` limits the choices; `as="div"` renders a role="radiogroup" div instead of a fieldset.
 * `icons`: monitor / sun / moon webicons (<iconify-icon>); `true` = icons only (text for screen readers), `'text'` = icon + text.
 */
import { useUid } from '../composables/useUid'

type Theme = 'system' | 'light' | 'dark'
const labels: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }
const iconNames: Record<Theme, string> = { system: 'mdi:monitor', light: 'mdi:white-balance-sunny', dark: 'mdi:weather-night' }

withDefaults(
  defineProps<{
    options?: Theme[]
    as?: 'fieldset' | 'div'
    label?: string
    name?: string
    icons?: boolean | 'text'
  }>(),
  { options: () => ['system', 'light', 'dark'], as: 'fieldset', label: 'Color theme', icons: false },
)
const model = defineModel<Theme>({ default: 'system' })
const uid = useUid('oc-theme')
</script>

<template>
  <component :is="as" :class="['oc-theme-switch', { 'oc-theme-switch--icons': icons === true }]" :role="as === 'div' ? 'radiogroup' : undefined" :aria-label="label">
    <label v-for="o in options" :key="o" :title="icons === true ? labels[o] : undefined">
      <input v-model="model" type="radio" :name="name ?? uid" :value="o" />
      <iconify-icon v-if="icons" :icon="iconNames[o]" aria-hidden="true" />
      <span v-if="icons === true" class="oc-theme-switch__text">{{ labels[o] }}</span>
      <template v-else>{{ labels[o] }}</template>
    </label>
  </component>
</template>
