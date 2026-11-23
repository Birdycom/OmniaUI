<!-- File: packages/vue/src/components/OcScrim.vue | Map: props (side, dark, strength, size, color) -> span.oc-scrim + modifiers, tokens as style -->
<script setup lang="ts">
/**
 * A calm fade over a picture so text on it stays readable. Put it inside a positioned element (class="relative") after
 * the image; text on top gets class="oc-scrim-content". Decorative: aria-hidden.
 * Classes: .oc-scrim + --top/--start/--end/--full, --dark. Tokens: --oc-scrim-color, --oc-scrim-strength, --oc-scrim-size
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    side?: 'bottom' | 'top' | 'start' | 'end' | 'full'
    dark?: boolean
    strength?: number
    size?: string
    color?: string
  }>(),
  { side: 'bottom', dark: false },
)

const vars = computed(() => {
  const v: Record<string, string> = {}
  if (props.strength != null) v['--oc-scrim-strength'] = String(props.strength)
  if (props.size) v['--oc-scrim-size'] = props.size
  if (props.color) v['--oc-scrim-color'] = props.color
  return v
})
</script>

<template>
  <span
    :class="['oc-scrim', side !== 'bottom' && `oc-scrim--${side}`, dark && 'oc-scrim--dark']"
    :style="vars"
    aria-hidden="true"
  ></span>
</template>
