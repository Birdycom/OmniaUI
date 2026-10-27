<!-- File: packages/vue/src/components/OcAffixInput.vue | Map: props -> variant presets -> template (input group --affix with inline symbol) -->
<script setup lang="ts">
/**
 * Input with a symbol inside the frame. variant: currency (€), percent (%) or email (@); or own prefix / suffix (props or slots).
 * Same markup as packages/ui/snippets/affix-input.html. v-model: string.
 * class/style stay on the wrapper, other attributes go to the input.
 */
import { computed } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'

export type AffixInputKind = 'currency' | 'percent' | 'email'

defineOptions({ inheritAttrs: false })
// alignEnd defaults to undefined (not false), so the variant preset can decide.
const props = withDefaults(defineProps<{ variant?: AffixInputKind; prefix?: string; suffix?: string; alignEnd?: boolean; error?: boolean }>(), {
  alignEnd: undefined,
})
const model = defineModel<string>({ default: '' })
const { root, control } = useAttrsSplit()

// Preset per variant. Email uses type="email" so :user-invalid checks the address.
const PRESETS = {
  currency: { prefix: '\u20AC', suffix: undefined, end: false, input: { type: 'text', inputmode: 'decimal' } },
  percent: { prefix: '%', suffix: undefined, end: false, input: { type: 'text', inputmode: 'decimal' } },
  email: { prefix: '@', suffix: undefined, end: false, input: { type: 'email', autocomplete: 'email' } },
} as const

const preset = computed(() => (props.variant ? PRESETS[props.variant] : undefined))
const before = computed(() => props.prefix ?? preset.value?.prefix)
const after = computed(() => props.suffix ?? preset.value?.suffix)
const end = computed(() => props.alignEnd ?? preset.value?.end ?? false)
</script>

<template>
  <div v-bind="root" :class="['oc-input-group', 'oc-input-group--affix', end && 'oc-input-group--end', error && 'oc-input-group--error']">
    <span v-if="before || $slots.prefix" class="oc-input-addon" aria-hidden="true"><slot name="prefix">{{ before }}</slot></span>
    <input v-bind="{ type: 'text', ...preset?.input, ...control }" v-model="model" class="oc-input" :aria-invalid="error ? 'true' : undefined" />
    <span v-if="after || $slots.suffix" class="oc-input-addon" aria-hidden="true"><slot name="suffix">{{ after }}</slot></span>
  </div>
</template>
