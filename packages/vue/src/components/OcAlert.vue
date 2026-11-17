<!-- File: packages/vue/src/components/OcAlert.vue | Map: props -> div.oc-alert (icon, body: title + description, actions) -->
<script setup lang="ts">
/**
 * Alert. Classes: .oc-alert--info/success/warning/danger, --inline (compact, under a field). Default slot = description.
 * Slots `icon` / `actions` (or prop `icon`, a webicon name) add an icon on the left and buttons on the right.
 * alarm ('new' | 'seen'): an urgent message, 'new' pulses until acknowledged (role alert); the tone defaults to danger.
 */
import { computed, useSlots } from 'vue'
import OcWebicon from './OcWebicon.vue'

const props = defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  inline?: boolean
  icon?: string
  alarm?: 'new' | 'seen'
}>()
const slots = useSlots()
const tone = computed(() => props.variant ?? (props.alarm ? 'danger' : 'info'))
const parts = computed(() => !!(props.icon || slots.icon || slots.actions))
const role = computed(() => (props.alarm === 'new' || (tone.value === 'danger' && props.inline) ? 'alert' : 'status'))
</script>

<template>
  <div :class="['oc-alert', `oc-alert--${tone}`, inline && 'oc-alert--inline', alarm && 'oc-alert--alarm']" :role="role" :data-state="alarm">
    <template v-if="parts">
      <span v-if="icon || $slots.icon" class="oc-alert-icon" aria-hidden="true"><slot name="icon"><OcWebicon :name="icon!" bare fallback="iconify" /></slot></span>
      <div class="oc-alert-body">
        <h4 v-if="title || $slots.title" class="oc-alert-title"><slot name="title">{{ title }}</slot></h4>
        <p v-if="$slots.default" class="oc-alert-description"><slot /></p>
      </div>
      <div v-if="$slots.actions" class="oc-alert-actions"><slot name="actions" /></div>
    </template>
    <template v-else>
      <h4 v-if="title || $slots.title" class="oc-alert-title"><slot name="title">{{ title }}</slot></h4>
      <p v-if="$slots.default" class="oc-alert-description"><slot /></p>
    </template>
  </div>
</template>
