<script setup lang="ts">
/**
 * Tab list of the compound OcTabs (0.17.0): .oc-tab-list[role=tablist]. Arrow keys (Up/Down when vertical), Home and End
 * move between the enabled OcTabsTrigger buttons. variant overrides the one of OcTabs; counts adds .oc-data-table-tabs.
 * Classes: .oc-tab-list(--pill/--vertical), .oc-data-table-tabs
 */
import { computed, inject } from 'vue'
import { tabsKey } from '../composables/keys-d3'

const props = defineProps<{ variant?: 'pill' | 'vertical'; counts?: boolean }>()
const ctx = inject(tabsKey, null)
const v = computed(() => props.variant ?? ctx?.variant.value)

/** The index of the tab a key moves to (skips disabled tabs, wraps at both ends); -1 for another key. */
function nextIndex(index: number, disabled: boolean[], key: string, vertical: boolean): number {
  const n = disabled.length
  let step: number
  let from = index
  if (key === (vertical ? 'ArrowDown' : 'ArrowRight')) step = 1
  else if (key === (vertical ? 'ArrowUp' : 'ArrowLeft')) step = -1
  else if (key === 'Home') { step = 1; from = -1 }
  else if (key === 'End') { step = -1; from = n }
  else return -1
  for (let i = 1; i <= n; i++) {
    const at = (((from + step * i) % n) + n) % n
    if (!disabled[at]) return at
  }
  return -1
}

function onKey(e: KeyboardEvent) {
  const list = e.currentTarget as HTMLElement
  const all = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter((t) => t.closest('[role="tablist"]') === list)
  const at = all.indexOf(e.target as HTMLButtonElement)
  if (at < 0) return
  const next = nextIndex(at, all.map((t) => t.disabled), e.key, v.value === 'vertical')
  if (next < 0) return
  e.preventDefault()
  all[next].focus()
  all[next].click()
}
</script>

<template>
  <div
    :class="['oc-tab-list', v && `oc-tab-list--${v}`, counts && 'oc-data-table-tabs']"
    role="tablist"
    :aria-orientation="v === 'vertical' ? 'vertical' : undefined"
    @keydown="onKey"
  >
    <slot />
  </div>
</template>
