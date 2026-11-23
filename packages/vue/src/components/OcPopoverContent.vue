<script setup lang="ts">
/**
 * Panel of the compound OcPopover (0.17.0): <div class="oc-popover" popover>, shown and hidden from the v-model:open state;
 * trigger clicks, Esc and outside clicks update it. side: top | right | bottom (default) | left; align: start (default) |
 * center | end; side-offset in px (default 4). title / text as in OcPopover. Default slot (scoped: { close }).
 * Classes: .oc-popover(--sm/--lg)[data-side][data-align], -title, -text
 */
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { popoverKey } from '../composables/keys-d3'

const props = withDefaults(
  defineProps<{
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    size?: 'sm' | 'md' | 'lg'
    title?: string
    text?: string
  }>(),
  { side: 'bottom', align: 'start', size: 'md' },
)
const ctx = inject(popoverKey, null)
const el = ref<HTMLElement | null>(null)
const isOpen = computed(() => ctx?.open.value ?? false)

const supportsAnchors = () => typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('anchor-name: --oc-a')

function place(panel: HTMLElement) {
  const target = (ctx?.anchored.value ? ctx.anchorEl.value : null) ?? ctx?.triggerEl.value
  if (!target) return
  const a = target.getBoundingClientRect()
  const w = panel.offsetWidth
  const h = panel.offsetHeight
  const off = props.sideOffset ?? 4
  const along = (start: number, size: number, own: number) => (props.align === 'start' ? start : props.align === 'end' ? start + size - own : start + (size - own) / 2)
  let top: number
  let left: number
  if (props.side === 'top') { top = a.top - h - off; left = along(a.left, a.width, w) }
  else if (props.side === 'left') { top = along(a.top, a.height, h); left = a.left - w - off }
  else if (props.side === 'right') { top = along(a.top, a.height, h); left = a.left + a.width + off }
  else { top = a.top + a.height + off; left = along(a.left, a.width, w) }
  panel.style.top = `${top}px`
  panel.style.left = `${left}px`
}

function sync() {
  const panel = el.value
  if (!panel || typeof panel.showPopover !== 'function') return
  let shown = false
  try { shown = panel.matches(':popover-open') } catch { shown = false }
  try {
    if (isOpen.value && !shown) panel.showPopover()
    else if (!isOpen.value && shown) panel.hidePopover()
  } catch { /* not connected */ }
  if (isOpen.value && !supportsAnchors()) place(panel)
}

function onToggle(e: Event) {
  const now = (e as Event & { newState?: string }).newState === 'open'
  if (now !== isOpen.value) ctx?.setOpen(now)
}

watch(isOpen, sync, { flush: 'post' })
onMounted(() => {
  el.value?.addEventListener('toggle', onToggle)
  sync()
})
onBeforeUnmount(() => el.value?.removeEventListener('toggle', onToggle))

const style = computed(() => ({
  ...(props.sideOffset != null ? { '--oc-popover-offset': `${props.sideOffset}px` } : {}),
  ...(ctx?.anchored.value ? { positionAnchor: ctx.anchorName } : {}),
}))
const close = () => ctx?.setOpen(false)
</script>

<template>
  <div
    :id="ctx?.contentId"
    ref="el"
    :class="['oc-popover', size !== 'md' && `oc-popover--${size}`]"
    role="dialog"
    :data-side="side"
    :data-align="align"
    :data-state="isOpen ? 'open' : 'closed'"
    :style="style"
    popover
  >
    <h3 v-if="title" class="oc-popover-title">{{ title }}</h3>
    <p v-if="text" class="oc-popover-text">{{ text }}</p>
    <slot :close="close" />
  </div>
</template>
