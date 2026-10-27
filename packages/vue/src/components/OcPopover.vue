<script setup lang="ts">
/**
 * Floating panel on the popover attribute + anchor positioning. Trigger = `trigger` slot (scoped: { id })
 * or a default outline button with `label`. Default slot = panel content. Classes: .oc-popover(--sm/--lg),
 * -title, -text. Attributes land on the panel.
 */
import { useAttrs } from 'vue'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ label?: string; title?: string; text?: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const attrs = useAttrs()
const id = (attrs.id as string | undefined) ?? useUid('oc-popover')
</script>

<template>
  <slot name="trigger" :id="id">
    <button class="oc-btn oc-btn--outline" type="button" :popovertarget="id">{{ label }}</button>
  </slot>
  <div v-bind="attrs" :id="id" :class="['oc-popover', size !== 'md' && `oc-popover--${size}`]" popover>
    <h3 v-if="title" class="oc-popover-title">{{ title }}</h3>
    <p v-if="text" class="oc-popover-text">{{ text }}</p>
    <slot />
  </div>
</template>
