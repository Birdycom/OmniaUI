<script setup lang="ts">
/** Shortcut: `keys` ["Ctrl", "K"] renders one key per entry, with a "+" separator when `separator` is set. Or pass OcKbd in the slot. Classes: .oc-kbd-group, .oc-kbd-sep */
defineProps<{ keys?: string[]; separator?: boolean }>()
</script>

<template>
  <span class="oc-kbd-group">
    <slot>
      <template v-for="(key, i) in keys" :key="key + i">
        <span v-if="separator && i > 0" class="oc-kbd-sep">+</span>
        <kbd class="oc-kbd">{{ key }}</kbd>
      </template>
    </slot>
  </span>
</template>
