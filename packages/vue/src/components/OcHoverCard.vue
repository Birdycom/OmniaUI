<script setup lang="ts">
/**
 * Preview on hover/focus (interestfor + popover, CSS hover fallback). The trigger is the `trigger` slot
 * (scoped: { id }) or a link with `label` and `href`; default slot = card content.
 * Classes: .oc-hover-card(--top), -trigger, -content(--sm). Attributes land on the content element.
 */
import { useAttrs } from 'vue'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
defineProps<{ label?: string; href?: string; top?: boolean; small?: boolean }>()
const attrs = useAttrs()
const id = (attrs.id as string | undefined) ?? useUid('oc-hover-card')
</script>

<template>
  <span :class="['oc-hover-card', top && 'oc-hover-card--top']">
    <slot name="trigger" :id="id">
      <a class="oc-hover-card-trigger" :href="href ?? '#'" :interestfor="id">{{ label }}</a>
    </slot>
    <div v-bind="attrs" :id="id" :class="['oc-hover-card-content', small && 'oc-hover-card-content--sm']" popover>
      <slot />
    </div>
  </span>
</template>
