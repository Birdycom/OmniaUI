<!-- File: packages/vue/src/components/OcCookieConsent.vue | Map: props -> storage helpers -> reopen button -> popover (title, text, categories, actions) -->
<script setup lang="ts">
/**
 * Cookie banner on popover="manual" (same markup as snippets/cookie-consent.html). Like the snippet script it shows itself
 * when no choice is stored, saves { necessary, <categories>, date } in localStorage and fires "oc-consent" on document.
 * Emits: consent (the choice, also on load when one is stored). Slot: text (replaces the paragraph content).
 * Classes: .oc-cookie-consent(--bar) __title __text __prefs __category __category-name __category-text __actions
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface CookieCategory {
  name: string
  label: string
  text?: string
  required?: boolean
}
export type ConsentChoice = { necessary: boolean; date: string } & Record<string, boolean | string>

const props = withDefaults(
  defineProps<{
    categories?: CookieCategory[]
    title?: string
    policyHref?: string
    customizeLabel?: string
    necessaryLabel?: string
    selectedLabel?: string
    allLabel?: string
    /** Text of the "Cookie settings" button; empty string hides it. */
    openLabel?: string
    bar?: boolean
    manual?: boolean
    storageKey?: string
    id?: string
  }>(),
  {
    categories: () => [
      { name: 'necessary', label: 'Necessary', text: 'Session, security and your cookie choice. Always on.', required: true },
      { name: 'statistics', label: 'Statistics', text: 'Anonymous visit counts.' },
      { name: 'marketing', label: 'Marketing', text: 'Embedded videos and ads that track you.' },
    ],
    title: 'We use cookies',
    policyHref: '#cookie-policy',
    customizeLabel: 'Customize',
    necessaryLabel: 'Only necessary',
    selectedLabel: 'Save choice',
    allLabel: 'Accept all',
    openLabel: 'Cookie settings',
    storageKey: 'oc-consent',
    id: 'oc-cookie-consent',
  },
)
const emit = defineEmits<{ consent: [choice: ConsentChoice] }>()
defineOptions({ inheritAttrs: false })
const box = ref<HTMLElement | null>(null)

const read = (): ConsentChoice | null => {
  try { return JSON.parse(localStorage.getItem(props.storageKey) ?? 'null') } catch { return null }
}
const inputs = () => Array.from(box.value?.querySelectorAll<HTMLInputElement>('input[name]') ?? [])
function tell(choice: ConsentChoice) {
  document.dispatchEvent(new CustomEvent('oc-consent', { detail: choice }))
  emit('consent', choice)
}
// Any [data-oc-consent-open] (also outside this component) opens the banner with the stored choice.
function reopen(e: Event) {
  if (!(e.target as Element | null)?.closest?.('[data-oc-consent-open]')) return
  const choice = read()
  for (const i of inputs()) if (!i.disabled) i.checked = !!choice?.[i.name]
  box.value?.showPopover?.()
}
function choose(e: MouseEvent) {
  const mode = (e.target as HTMLElement).closest<HTMLElement>('[data-oc-consent]')?.dataset.ocConsent
  if (!mode) return
  const choice: ConsentChoice = { necessary: true, date: new Date().toISOString() }
  for (const i of inputs()) if (!i.disabled) choice[i.name] = mode === 'all' || (mode === 'selected' && i.checked)
  try { localStorage.setItem(props.storageKey, JSON.stringify(choice)) } catch { /* storage blocked */ }
  box.value?.hidePopover?.()
  tell(choice)
}
onMounted(() => {
  const stored = read()
  if (stored) tell(stored)
  else if (!props.manual) box.value?.showPopover?.()
  document.addEventListener('click', reopen)
})
onBeforeUnmount(() => document.removeEventListener('click', reopen))
</script>

<template>
  <button v-if="openLabel" type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-consent-open>{{ openLabel }}</button>
  <aside
    :id="id"
    ref="box"
    v-bind="$attrs"
    :class="['oc-cookie-consent', bar && 'oc-cookie-consent--bar']"
    popover="manual"
    :data-oc-consent-manual="manual ? '' : undefined"
    :aria-labelledby="`${id}-title`"
    @click="choose"
  >
    <h2 :id="`${id}-title`" class="oc-cookie-consent__title"><span aria-hidden="true">&#127850;</span> {{ title }}</h2>
    <p class="oc-cookie-consent__text">
      <slot name="text">Necessary cookies keep the site working. With your permission we also measure visits to improve the site. Read the <a :href="policyHref">cookie policy</a>.</slot>
    </p>
    <details class="oc-cookie-consent__prefs">
      <summary>{{ customizeLabel }}</summary>
      <div v-for="c in categories" :key="c.name" class="oc-cookie-consent__category">
        <span class="oc-cookie-consent__category-name">{{ c.label }}</span>
        <span v-if="c.text" class="oc-cookie-consent__category-text">{{ c.text }}</span>
        <label class="oc-switch"><input type="checkbox" role="switch" :name="c.name" :checked="c.required" :disabled="c.required" :aria-label="`${c.label} cookies`" /><span class="oc-switch-track"></span></label>
      </div>
    </details>
    <div class="oc-cookie-consent__actions">
      <button type="button" class="oc-btn oc-btn--outline" data-oc-consent="necessary">{{ necessaryLabel }}</button>
      <button type="button" class="oc-btn oc-btn--secondary" data-oc-consent="selected">{{ selectedLabel }}</button>
      <button type="button" class="oc-btn" data-oc-consent="all">{{ allLabel }}</button>
    </div>
  </aside>
</template>
