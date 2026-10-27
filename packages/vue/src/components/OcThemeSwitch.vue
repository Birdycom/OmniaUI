<script setup lang="ts">
/**
 * System / light / dark switch (CSS only: color-scheme + :has()). v-model: 'system' | 'light' | 'dark'.
 * `options` limits the choices; `as="div"` renders a role="radiogroup" div instead of a fieldset.
 */
import { useUid } from '../composables/useUid'

type Theme = 'system' | 'light' | 'dark'
const labels: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }

withDefaults(
  defineProps<{
    options?: Theme[]
    as?: 'fieldset' | 'div'
    label?: string
    name?: string
  }>(),
  { options: () => ['system', 'light', 'dark'], as: 'fieldset', label: 'Color theme' },
)
const model = defineModel<Theme>({ default: 'system' })
const uid = useUid('oc-theme')
</script>

<template>
  <component :is="as" class="oc-theme-switch" :role="as === 'div' ? 'radiogroup' : undefined" :aria-label="label">
    <label v-for="o in options" :key="o">
      <input v-model="model" type="radio" :name="name ?? uid" :value="o" />
      {{ labels[o] }}
    </label>
  </component>
</template>
