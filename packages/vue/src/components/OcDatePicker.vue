<!-- File: packages/vue/src/components/OcDatePicker.vue | Map: props + v-model (day) -> trigger (.oc-date-picker-trigger, value or placeholder) -> popover (.oc-popover--calendar) with OcCalendar -> pick (close the popover) -> hidden input -->
<script setup lang="ts">
/**
 * Trigger button with a calendar in a popover (same markup as packages/ui/snippets/date-picker.html).
 * v-model: '2026-10-16'. A pick closes the popover. placeholder (default "Pick a date"), locale, name (a hidden input
 * for a form), min, max, isDisabled, today, weekStart. Attributes land on the trigger button.
 * Classes: .oc-date-picker-trigger([data-empty]), .oc-popover.oc-popover--calendar
 */
import { computed, ref, useAttrs } from 'vue'
import { useUid } from '../composables/useUid'
import OcCalendar from './OcCalendar.vue'
import OcWebicon from './OcWebicon.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    placeholder?: string
    locale?: string
    name?: string
    min?: string
    max?: string
    isDisabled?: (date: string) => boolean
    today?: string
    weekStart?: 0 | 1
  }>(),
  { placeholder: 'Pick a date', weekStart: 1 },
)
const model = defineModel<string | undefined>()
const attrs = useAttrs()
const popId = attrs.id ? `${attrs.id}-calendar` : useUid('oc-date-picker')
const pop = ref<HTMLElement | null>(null)
const text = computed(() =>
  model.value
    ? new Intl.DateTimeFormat(props.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${model.value}T12:00:00`))
    : props.placeholder,
)

function pick(date: string | undefined) {
  model.value = date
  try { (pop.value as (HTMLElement & { hidePopover?: () => void }) | null)?.hidePopover?.() } catch { /* already closed */ }
}
</script>

<template>
  <button
    v-bind="attrs"
    class="oc-btn oc-btn--outline oc-date-picker-trigger"
    type="button"
    :popovertarget="popId"
    aria-haspopup="dialog"
    :data-empty="model ? undefined : ''"
  >
    <span>{{ text }}</span> <OcWebicon name="mdi:calendar" size="sm" />
  </button>
  <div :id="popId" ref="pop" class="oc-popover oc-popover--calendar" popover>
    <OcCalendar
      :model-value="model"
      :locale="locale"
      :min="min"
      :max="max"
      :is-disabled="isDisabled"
      :today="today"
      :week-start="weekStart"
      @update:model-value="pick"
    />
  </div>
  <input v-if="name" type="hidden" :name="name" :value="model ?? ''" />
</template>
