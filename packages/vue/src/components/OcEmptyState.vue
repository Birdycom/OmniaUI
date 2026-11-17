<script setup lang="ts">
/** Icon, title, text and actions for lists without data. Slots: icon, title, default (text), actions.
 *  locked: content that opens later (dashed frame, a lock icon); meta: what is left ("120 m to go"). */
import OcWebicon from './OcWebicon.vue'
defineProps<{ icon?: string; title?: string; text?: string; locked?: boolean; meta?: string }>()
</script>

<template>
  <div :class="['oc-empty', locked && 'oc-empty--locked']">
    <span v-if="icon || locked || $slots.icon" class="oc-empty-icon" aria-hidden="true"><slot name="icon"><OcWebicon v-if="(icon ?? '').includes(':') || (!icon && locked)" :name="icon || 'mdi:lock-outline'" bare fallback="iconify" /><template v-else>{{ icon }}</template></slot></span>
    <h3 v-if="title || $slots.title" class="oc-empty-title"><slot name="title">{{ title }}</slot></h3>
    <p v-if="text || $slots.default" class="oc-empty-text"><slot>{{ text }}</slot></p>
    <span v-if="meta" class="oc-empty-meta">{{ meta }}</span>
    <div v-if="$slots.actions" class="oc-empty-actions"><slot name="actions" /></div>
  </div>
</template>
