<!-- File: packages/vue/src/components/OcStatusDot.vue | Map: props (tone, size, label) -> span.oc-status-dot (role="img" with a label, else aria-hidden) -->
<script setup lang="ts">
/** A live state light; --working pulses. With `label` the dot stands alone (role="img"), without it is decoration.
 *  Classes: .oc-status-dot + --working/--waiting/--done/--error/--idle, --sm/--lg */
withDefaults(
  defineProps<{ tone?: 'default' | 'working' | 'waiting' | 'done' | 'error' | 'idle'; size?: 'sm' | 'md' | 'lg'; label?: string }>(),
  { tone: 'default', size: 'md' },
)
</script>

<template>
  <span
    :class="['oc-status-dot', tone !== 'default' && `oc-status-dot--${tone}`, size !== 'md' && `oc-status-dot--${size}`]"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  ></span>
</template>
