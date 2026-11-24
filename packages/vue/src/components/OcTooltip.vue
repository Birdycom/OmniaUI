<script setup lang="ts">
/** CSS-only tooltip: wraps the default slot and shows `text` via data-tooltip. `multiline` keeps its line breaks;
 *  `heading` puts a title above `text` (.oc-tooltip__content); `side` is the preferred side (default top), with
 *  anchor positioning it flips when there is no room.
 *  0.17.0: a `content` slot renders rich content (.oc-tooltip__content[role=tooltip] + aria-describedby); v-model:open
 *  controls it (true = .is-open, false = .is-closed: hidden also on hover); delay-duration (ms) sets --oc-tooltip-delay.
 *  0.18.0: as-child puts the tooltip on the only slot element itself (a button, a link, a RouterLink) instead of a
 *  wrapping <span>; rich content is appended inside it. The element must be able to hold a ::after (not <input>/<img>). */
import { computed, useSlots } from 'vue'
import { useUid } from '../composables/useUid'
import { SlotChild } from '../composables/asChild'

const props = defineProps<{ text?: string; multiline?: boolean; heading?: string; side?: 'top' | 'bottom' | 'left' | 'right'; delayDuration?: number; asChild?: boolean }>()
const open = defineModel<boolean | undefined>('open', { default: undefined })
const slots = useSlots()
const contentId = useUid('oc-tooltip')
const rich = computed(() => !!slots.content)
const tracked = computed(() => open.value !== undefined)
const show = (v: boolean) => { if (tracked.value && open.value !== v) open.value = v }
const bind = computed(() => ({
  class: ['oc-tooltip', {
    'oc-tooltip--multiline': props.multiline && !props.heading,
    [`oc-tooltip--${props.side}`]: props.side && props.side !== 'top',
    'is-open': open.value === true,
    'is-closed': open.value === false,
  }],
  'data-tooltip': props.heading || rich.value ? undefined : props.text,
  'aria-describedby': rich.value ? contentId : undefined,
  style: props.delayDuration != null ? { '--oc-tooltip-delay': `${props.delayDuration}ms` } : undefined,
  onMouseenter: () => show(true),
  onMouseleave: () => show(false),
  onFocusin: () => show(true),
  onFocusout: () => show(false),
}))
</script>

<template>
  <SlotChild v-if="asChild" v-bind="bind">
    <slot />
    <template v-if="heading || rich" #append><span :id="contentId" class="oc-tooltip__content" role="tooltip"><span v-if="heading" class="oc-tooltip__title">{{ heading }}</span><slot name="content">{{ text }}</slot></span></template>
  </SlotChild>
  <span
    v-else
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
