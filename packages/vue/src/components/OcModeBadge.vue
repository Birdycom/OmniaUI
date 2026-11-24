<!-- File: packages/vue/src/components/OcModeBadge.vue | Map: props -> span.oc-mode-badge[data-mode] ("both" as two parts) -->
<script setup lang="ts">
/** Test / live at a glance in fixed colors. Props: mode (test | live | both | staging | offline (0.18.0)), size (sm | md | lg), labels (translations). */
withDefaults(defineProps<{ mode: 'test' | 'live' | 'both' | 'staging' | 'offline'; size?: 'sm' | 'md' | 'lg'; labels?: { test?: string; live?: string; staging?: string; offline?: string } }>(), { size: 'md' })
</script>

<template>
  <span :class="['oc-mode-badge', size !== 'md' && `oc-mode-badge--${size}`]" :data-mode="mode">
    <slot>
      <template v-if="mode === 'both'"><span>{{ labels?.test ?? 'Test' }}</span><span>{{ labels?.live ?? 'Live' }}</span></template>
      <template v-else-if="mode === 'staging'">{{ labels?.staging ?? 'Staging' }}</template>
      <template v-else-if="mode === 'offline'">{{ labels?.offline ?? 'Offline' }}</template>
      <template v-else>{{ mode === 'live' ? (labels?.live ?? 'Live') : (labels?.test ?? 'Test') }}</template>
    </slot>
  </span>
</template>
