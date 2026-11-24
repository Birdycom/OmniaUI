<script setup lang="ts">
/**
 * 0.18.0: a group of OcCommandItems with an optional heading (`label`), in the slot of an OcCommand.
 * OcCommand reads it; on its own it renders nothing.
 */
defineProps<{ label?: string }>()
</script>

<template><template v-if="false"><slot /></template></template>
