<!-- File: packages/vue/src/components/OcGreeting.vue | Map: time-of-day logic -> header -> icon slot -> body (eyebrow, title + name, date) -> actions slot -->
<script setup lang="ts">
/**
 * Dashboard greeting. The time of day comes from `date` (default now): morning 05-12, afternoon 12-18, evening otherwise.
 * Slots: icon, actions. Classes: .oc-greeting(--morning/--afternoon/--evening/--lg), -icon, -body, -eyebrow, -title, -name, -date, -actions
 */
import { computed } from 'vue'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

const props = defineProps<{
  name?: string
  date?: Date
  timeOfDay?: TimeOfDay
  /** Translated greetings, e.g. { morning: 'Goedemorgen' }. */
  words?: Partial<Record<TimeOfDay, string>>
  locale?: string
  hideDate?: boolean
  eyebrow?: string
  size?: 'lg'
}>()

const WORDS: Record<TimeOfDay, string> = { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' }

const when = computed(() => props.date ?? new Date())
const tod = computed<TimeOfDay>(() => {
  if (props.timeOfDay) return props.timeOfDay
  const h = when.value.getHours()
  return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : 'evening'
})
const word = computed(() => props.words?.[tod.value] ?? WORDS[tod.value])
const dateText = computed(() =>
  new Intl.DateTimeFormat(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(when.value),
)
// Local YYYY-MM-DD for datetime (toISOString would use UTC).
const iso = computed(() => {
  const d = when.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
</script>

<template>
  <header :class="['oc-greeting', `oc-greeting--${tod}`, size && `oc-greeting--${size}`]">
    <span v-if="$slots.icon" class="oc-greeting-icon" aria-hidden="true"><slot name="icon" /></span>
    <div class="oc-greeting-body">
      <p v-if="eyebrow" class="oc-greeting-eyebrow">{{ eyebrow }}</p>
      <h2 class="oc-greeting-title">{{ word }}<template v-if="name">, <span class="oc-greeting-name">{{ name }}</span></template></h2>
      <time v-if="!hideDate" class="oc-greeting-date" :datetime="iso">{{ dateText }}</time>
    </div>
    <div v-if="$slots.actions" class="oc-greeting-actions"><slot name="actions" /></div>
  </header>
</template>
