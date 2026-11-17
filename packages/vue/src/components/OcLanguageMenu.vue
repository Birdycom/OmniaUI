<!-- File: packages/vue/src/components/OcLanguageMenu.vue | Map: props + v-model -> trigger (flag + code or name, or icon only) -> popover menu (flag, native name, code, check) -->
<script setup lang="ts">
/**
 * Language select as a menu: button.oc-language-select opens .oc-dropdown-menu.oc-language-menu (popover API, no script).
 * v-model = language value. An option with `href` is a link (hreflang) to the page in that language; without it a
 * button that sets v-model. `flag` is a webicon name ("flag:nl-4x3"). `compact`: round icon-only trigger with a tooltip.
 */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from './OcWebicon.vue'

export interface LanguageMenuItem {
  value: string
  /** Name of the language in that language */
  label: string
  code?: string
  flag?: string
  href?: string
}

const props = withDefaults(
  defineProps<{ options: LanguageMenuItem[]; show?: 'code' | 'name'; compact?: boolean; ghost?: boolean; label?: string }>(),
  { show: 'code', label: 'Language' },
)
const model = defineModel<string>()
const menuId = useUid('oc-language-menu')
const cur = computed(() => props.options.find((o) => o.value === model.value) ?? props.options[0])
const name = computed(() => `${props.label}: ${cur.value?.label ?? ''}`)
const codeOf = (o: LanguageMenuItem) => o.code ?? o.value.toUpperCase()

function pick(o: LanguageMenuItem, event: MouseEvent) {
  model.value = o.value
  try { (event.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover?.() } catch { /* already closed */ }
}
</script>

<template>
  <button
    type="button"
    :class="['oc-language-select', ghost && 'oc-language-select--ghost', compact && 'oc-language-select--icon oc-tooltip oc-tooltip--bottom']"
    :aria-label="name"
    :data-tooltip="compact ? name : undefined"
    :popovertarget="menuId"
  >
    <template v-if="compact">
      <span v-if="cur?.flag" class="oc-language-flag" aria-hidden="true"><OcWebicon :name="cur.flag" bare fallback="iconify" /></span>
      <span v-else class="oc-language-select-icon" aria-hidden="true"><OcWebicon name="mdi:web" bare fallback="iconify" /></span>
    </template>
    <template v-else>
      <span v-if="cur?.flag" class="oc-language-flag" aria-hidden="true"><OcWebicon :name="cur.flag" bare fallback="iconify" /></span>
      <span v-if="show === 'name'" :lang="cur?.value">{{ cur?.label }}</span>
      <span v-else class="oc-language-select-code">{{ cur && codeOf(cur) }}</span>
    </template>
  </button>
  <div :id="menuId" class="oc-dropdown-menu oc-language-menu" popover :aria-label="label">
    <component
      :is="o.href ? 'a' : 'button'"
      v-for="o in options"
      :key="o.value"
      class="oc-dropdown-item"
      :href="o.href"
      :hreflang="o.href ? o.value : undefined"
      :type="o.href ? undefined : 'button'"
      :lang="o.value"
      :aria-current="o.value === cur?.value ? 'true' : undefined"
      @click="pick(o, $event)"
    >
      <span v-if="o.flag" class="oc-language-flag" aria-hidden="true"><OcWebicon :name="o.flag" bare fallback="iconify" /></span>
      <span>{{ o.label }}</span>
      <span class="oc-language-menu-code" aria-hidden="true">{{ codeOf(o) }}</span>
    </component>
  </div>
</template>
