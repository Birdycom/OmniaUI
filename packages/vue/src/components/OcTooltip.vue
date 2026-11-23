<script setup lang="ts">
/** CSS-only tooltip: wraps the default slot and shows `text` via data-tooltip. `multiline` keeps its line breaks;
 *  `heading` puts a title above `text` (.oc-tooltip__content); `side` is the preferred side (default top), with
 *  anchor positioning it flips when there is no room.
 *  0.17.0: a `content` slot renders rich content (.oc-tooltip__content[role=tooltip] + aria-describedby); v-model:open
 *  controls it (true = .is-open, false = .is-closed: hidden also on hover); delay-duration (ms) sets --oc-tooltip-delay. */
import { computed, useSlots } from 'vue'
import { useUid } from '../composables/useUid'

const props = defineProps<{ text?: string; multiline?: boolean; heading?: string; side?: 'top' | 'bottom' | 'left' | 'right'; delayDuration?: number }>()
const open = defineModel<boolean | undefined>('open', { default: undefined })
const slots = useSlots()
const contentId = useUid('oc-tooltip')
const rich = computed(() => !!slots.content)
const tracked = computed(() => open.value !== undefined)
const show = (v: boolean) => { if (tracked.value && open.value !== v) open.value = v }
</script>

<template>
  <span
    :class="['oc-tooltip', {
      'oc-tooltip--multiline': multiline && !heading,
      [`oc-tooltip--${side}`]: side && side !== 'top',
      'is-open': open === true,
      'is-closed': open === false,
    }]"
    :data-tooltip="heading || rich ? undefined : text"
    :aria-describedby="rich ? contentId : undefined"
    :style="delayDuration != null ? { '--oc-tooltip-delay': `${delayDuration}ms` } : undefined"
    @mouseenter="show(true)"
    @mouseleave="show(false)"
    @focusin="show(true)"
    @focusout="show(false)"
  >
    <slot />
    <span v-if="heading || rich" :id="contentId" class="oc-tooltip__content" role="tooltip"><span v-if="heading" class="oc-tooltip__title">{{ heading }}</span><slot name="content">{{ text }}</slot></span>
  </span>
</template>
