<script setup lang="ts">
/**
 * Floating panel on the popover attribute + anchor positioning. Trigger = `trigger` slot (scoped: { id })
 * or a default outline button with `label`. Default slot = panel content. Classes: .oc-popover(--sm/--lg),
 * -title, -text. Attributes land on the panel.
 * Compound (0.17.0): put OcPopoverTrigger, OcPopoverContent (and OcPopoverAnchor) in the default slot; the open state is
 * v-model:open (or default-open), the default slot is then scoped: { open, close }.
 */
import { provide, ref, useAttrs, useSlots, watch } from 'vue'
import type { VNode } from 'vue'
import { useUid } from '../composables/useUid'
import { popoverKey } from '../composables/keys-d3'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ label?: string; title?: string; text?: string; size?: 'sm' | 'md' | 'lg'; defaultOpen?: boolean }>(), { size: 'md' })
const attrs = useAttrs()
const slots = useSlots()
const id = (attrs.id as string | undefined) ?? useUid('oc-popover')

const open = defineModel<boolean | undefined>('open', { default: undefined })
const inner = ref<boolean>(open.value ?? props.defaultOpen ?? false)
watch(open, (v) => { if (v !== undefined) inner.value = v })
const setOpen = (v: boolean) => {
  inner.value = v
  open.value = v
}
const close = () => setOpen(false)
provide(popoverKey, {
  open: inner,
  setOpen,
  contentId: id,
  anchorName: `--${id}`,
  anchored: ref(false),
  anchorEl: ref<HTMLElement | null>(null),
  triggerEl: ref<HTMLElement | null>(null),
})

const PARTS = new Set(['OcPopoverTrigger', 'OcPopoverContent', 'OcPopoverAnchor'])
function hasPart(nodes: VNode[]): boolean {
  return nodes.some((n) => {
    const type = n.type as { __name?: string; name?: string } | string
    if (typeof type === 'object' && type && PARTS.has(type.__name ?? type.name ?? '')) return true
    return Array.isArray(n.children) && hasPart(n.children as VNode[])
  })
}
/** Compound mode: the default slot holds OcPopoverTrigger / OcPopoverContent / OcPopoverAnchor. */
const isCompound = () => !props.label && !props.title && !props.text && !slots.trigger && hasPart((slots.default?.({ open: inner.value, close }) ?? []) as VNode[])
</script>

<template>
  <slot v-if="isCompound()" :open="inner" :close="close" />
  <template v-else>
    <slot name="trigger" :id="id">
      <button class="oc-btn oc-btn--outline" type="button" :popovertarget="id">{{ label }}</button>
    </slot>
    <div v-bind="attrs" :id="id" :class="['oc-popover', size !== 'md' && `oc-popover--${size}`]" popover>
      <h3 v-if="title" class="oc-popover-title">{{ title }}</h3>
      <p v-if="text" class="oc-popover-text">{{ text }}</p>
      <slot :open="inner" :close="close" />
    </div>
  </template>
</template>
