<script setup lang="ts">
/** Input with prefix/suffix addon. Default slot = the input(s); `prefix` / `suffix` are text props or slots. */
defineProps<{ prefix?: string; suffix?: string }>()
</script>

<template>
  <div class="oc-input-group">
    <span v-if="prefix || $slots.prefix" class="oc-input-addon"><slot name="prefix">{{ prefix }}</slot></span>
    <slot />
    <span v-if="suffix || $slots.suffix" class="oc-input-addon"><slot name="suffix">{{ suffix }}</slot></span>
  </div>
</template>
