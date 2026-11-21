<script setup lang="ts">
/**
 * Button. Renders <a> when `href` is set, otherwise <button>; `as` (or `is`) renders another tag or component with the
 * button classes ('a', 'span', RouterLink …; disabled/loading then become aria-disabled, other attributes such as `to`
 * fall through). iconStart / iconEnd: webicon names before / after the label (or slots `icon-start` / `icon-end`).
 * Classes: .oc-btn + --secondary/--outline/--ghost/--link/--destructive/--success/--gradient/--glass/--neon,
 * --soft-primary/-success/-warning/-destructive/-info (row actions), --plain (icon only, no surface),
 * --xs/--sm/--lg, --icon, --pill, --inline (link button inside running text). `loading` sets aria-busy (spinner).
 * module (0.17.0): data-module (blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name).
 * float (0.17.0): small icons rise behind the label (.oc-btn--float): 'hearts' or a webicon name ('mdi:star', any registered one).
 */
import { computed } from 'vue'
import type { Component } from 'vue'
import OcWebicon from './OcWebicon.vue'
import { getWebicon, webiconSvg } from '../webicons'

const props = withDefaults(
  defineProps<{
    variant?:
      | 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'gradient' | 'glass' | 'neon'
      | 'soft-primary' | 'soft-success' | 'soft-warning' | 'soft-destructive' | 'soft-info' | 'plain'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    icon?: boolean
    pill?: boolean
    inline?: boolean
    loading?: boolean
    disabled?: boolean
    href?: string
    type?: 'button' | 'submit' | 'reset'
    /** Tag or component to render instead of <a>/<button>. */
    as?: string | Component
    /** Same as `as`. */
    is?: string | Component
    iconStart?: string
    iconEnd?: string
    /** Module colour: data-module on the button. */
    module?: string
    /** Rising icons behind the label: 'hearts' or a webicon name. */
    float?: string
  }>(),
  { variant: 'default', size: 'md', type: 'button' },
)

const FLOAT_BUILT_IN = new Set(['mdi:heart', 'mdi:star'])
const floatName = computed(() => (props.float ? (props.float === 'hearts' ? 'mdi:heart' : props.float) : undefined))
const tag = computed(() => props.as ?? props.is ?? (props.href ? 'a' : 'button'))
const custom = computed(() => props.as != null || props.is != null)
const native = computed(() => tag.value === 'button')
// Only the attributes that apply: an undefined href would overwrite the one a component such as RouterLink renders.
const bind = computed(() => {
  const off = props.disabled || props.loading
  const out: Record<string, unknown> = {}
  if (native.value) {
    out.type = props.type
    out.disabled = off
  } else {
    if (props.href !== undefined) out.href = props.href
    if (custom.value && off) out['aria-disabled'] = 'true'
  }
  if (props.loading) out['aria-busy'] = true
  if (props.module) out['data-module'] = props.module
  if (floatName.value) {
    out['data-float-icon'] = floatName.value
    const icon = FLOAT_BUILT_IN.has(floatName.value) ? undefined : getWebicon(floatName.value)
    if (icon) {
      const { viewBox, html } = webiconSvg(icon)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${html}</svg>`
      out.style = { '--oc-btn-float-icon': `url("data:image/svg+xml,${encodeURIComponent(svg)}")` }
    }
  }
  return out
})
const classes = computed(() => [
  'oc-btn',
  props.variant !== 'default' && `oc-btn--${props.variant}`,
  props.size !== 'md' && `oc-btn--${props.size}`,
  props.icon && 'oc-btn--icon',
  props.pill && 'oc-btn--pill',
  props.inline && 'oc-btn--inline',
  props.float && 'oc-btn--float',
])
</script>

<template>
  <component
    :is="tag"
    v-bind="bind"
    :class="classes"
  >
    <span v-if="float" class="oc-btn-float" aria-hidden="true"><i /><i /><i /><i /><i /></span>
    <slot name="icon-start"><OcWebicon v-if="iconStart" :name="iconStart" fallback="iconify" /></slot>
    <slot />
    <slot name="icon-end"><OcWebicon v-if="iconEnd" :name="iconEnd" fallback="iconify" /></slot>
  </component>
</template>
