<script setup lang="ts">
/**
 * Panel of the compound OcPopover (0.17.0): <div class="oc-popover" popover>, shown and hidden from the v-model:open state;
 * trigger clicks, Esc and outside clicks update it. side: top | right | bottom (default) | left; align: start (default) |
 * center | end; side-offset in px (default 4). title / text as in OcPopover. Default slot (scoped: { close }).
 * 0.18.0: lazy (the default slot renders from the first open on; with unmount-on-close only while open),
 * match-trigger-width (as wide as the trigger or anchor: data-match-width + CSS anchor-size, px fallback), and the
 * fallback placement (no anchor positioning) flips to the other side and shifts to stay inside the viewport.
 * Classes: .oc-popover(--sm/--lg)[data-side][data-align][data-match-width], -title, -text
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
    /** 0.18.0: render the default slot only from the first open on */
    lazy?: boolean
    /** 0.18.0: with lazy, unmount the slot again when the panel closes */
    unmountOnClose?: boolean
    /** 0.18.0: as wide as the trigger (or OcPopoverAnchor) */
    matchTriggerWidth?: boolean
  }>(),
  { side: 'bottom', align: 'start', size: 'md' },
)
const ctx = inject(popoverKey, null)
const el = ref<HTMLElement | null>(null)
const isOpen = computed(() => ctx?.open.value ?? false)
const opened = ref(isOpen.value)
watch(isOpen, (v) => { if (v) opened.value = true })
const showSlot = computed(() => !props.lazy || (props.unmountOnClose ? isOpen.value : opened.value || isOpen.value))
const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

const supportsAnchors = () => typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('anchor-name: --oc-a')

function place(panel: HTMLElement) {
  const target = (ctx?.anchored.value ? ctx.anchorEl.value : null) ?? ctx?.triggerEl.value
  if (!target) return
  const a = target.getBoundingClientRect()
  if (props.matchTriggerWidth) panel.style.width = `${a.width}px`
  const w = panel.offsetWidth
  const h = panel.offsetHeight
  const off = props.sideOffset ?? 4
  const m = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const along = (start: number, size: number, own: number) => (props.align === 'start' ? start : props.align === 'end' ? start + size - own : start + (size - own) / 2)
  const at = (s: 'top' | 'right' | 'bottom' | 'left') => {
    if (s === 'top') return { top: a.top - h - off, left: along(a.left, a.width, w) }
    if (s === 'left') return { top: along(a.top, a.height, h), left: a.left - w - off }
    if (s === 'right') return { top: along(a.top, a.height, h), left: a.left + a.width + off }
    return { top: a.top + a.height + off, left: along(a.left, a.width, w) }
  }
  // Flip to the opposite side when the preferred side has no room and the other has more; then shift into the viewport.
  const room = (s: 'top' | 'right' | 'bottom' | 'left') => (s === 'top' ? a.top : s === 'bottom' ? vh - a.bottom : s === 'left' ? a.left : vw - a.right) - m
  const need = (s: 'top' | 'right' | 'bottom' | 'left') => (s === 'top' || s === 'bottom' ? h : w) + off
  const used = room(props.side) < need(props.side) && room(OPPOSITE[props.side]) > room(props.side) ? OPPOSITE[props.side] : props.side
  const p = at(used)
  const clamp = (v: number, own: number, max: number) => Math.max(m, Math.min(v, max - own - m))
  if (used === 'top' || used === 'bottom') p.left = clamp(p.left, w, vw)
  else p.top = clamp(p.top, h, vh)
  panel.style.top = `${p.top}px`
  panel.style.left = `${p.left}px`
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
    :data-match-width="matchTriggerWidth ? '' : undefined"
    :style="style"
    popover
  >
    <h3 v-if="title" class="oc-popover-title">{{ title }}</h3>
    <p v-if="text" class="oc-popover-text">{{ text }}</p>
    <slot v-if="showSlot" :close="close" />
  </div>
</template>
