<script setup lang="ts">
/**
 * Input with prefix/suffix addon. Default slot = the input(s); `prefix` / `suffix` are text props or slots.
 * 0.17.0: `variant="ledger"` (.oc-input-group--ledger; give the OcInput variant="ledger" too) and `module` (data-module).
 */
defineProps<{ prefix?: string; suffix?: string; variant?: 'ledger'; module?: string }>()
</script>

<template>
  <div :class="['oc-input-group', variant === 'ledger' && 'oc-input-group--ledger']" :data-module="module">
    <span v-if="prefix || $slots.prefix" class="oc-input-addon"><slot name="prefix">{{ prefix }}</slot></span>
    <slot />
    <span v-if="suffix || $slots.suffix" class="oc-input-addon"><slot name="suffix">{{ suffix }}</slot></span>
  </div>
</template>
