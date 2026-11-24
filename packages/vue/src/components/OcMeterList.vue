<!-- File: packages/vue/src/components/OcMeterList.vue | Map: variant + live -> list classes -> slot with OcMeterRow -->
<script setup lang="ts">
/** Stack of meter rows. variant: compact (tighter, thinner bar), dense (small widget or tray window, no transition), live (no width transition).
 *  `live` adds --live next to another variant (e.g. compact + live). Put OcMeterRow inside. Classes: .oc-meter-list(--compact|--dense|--live) */
defineProps<{ variant?: 'compact' | 'dense' | 'live'; live?: boolean }>()
</script>

<template>
  <div :class="['oc-meter-list', variant && `oc-meter-list--${variant}`, live && variant !== 'live' && 'oc-meter-list--live']">
    <slot />
  </div>
</template>
