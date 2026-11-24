<!-- File: packages/vue/src/components/OcTimeInput.vue | Map: props + model -> format helpers -> slot popover (0.18.0) -> template (text field + datalist, or the slots in a popover) -->
<script setup lang="ts">
/**
 * 24h time field (HH:mm). v-model: "HH:mm" or "". `slots` fills a datalist with suggestions.
 * Same markup as packages/ui/snippets/time-input.html. JS only adds the colon ("0930" -> "09:30").
 * All attributes go to the input.
 * slotsPopover (0.18.0): the slots in a popover under a clock button (.oc-time-picker: native popover, radio chips)
 * instead of the datalist; picking one fills the field and closes it. slotsLabel: name of the button (default "Choose a time").
 * selectOnFocus (0.18.0): select the whole time on focus (click or Tab) so the first key types over it; default on with
 * slotsPopover, off otherwise.
 */
import { computed, ref } from 'vue'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ slots?: string[]; error?: boolean; placeholder?: string; slotsPopover?: boolean; slotsLabel?: string; disabled?: boolean; selectOnFocus?: boolean }>(),
  // selectOnFocus: undefined = on with slotsPopover (0.18.0)
  { slotsLabel: 'Choose a time', selectOnFocus: undefined },
)
const model = defineModel<string>({ default: '' })
const listId = useUid('oc-time')
const panelId = `${listId}-slots`
const panel = ref<HTMLElement | null>(null)
const popover = computed(() => !!(props.slotsPopover && props.slots?.length))
const selectAll = computed(() => props.selectOnFocus ?? !!props.slotsPopover)
// A click focuses on mousedown and would drop the selection again at mouseup: keep it for that first mouseup.
let justFocused = false
function onFocus(e: FocusEvent) {
  if (!selectAll.value) return
  ;(e.target as HTMLInputElement).select()
  justFocused = true
}
function onMouseUp(e: MouseEvent) {
  if (!justFocused) return
  justFocused = false
  e.preventDefault()
}

/** A picked slot goes into the field; the popover closes. */
function pick(slot: string) {
  model.value = slot
  const el = panel.value as (HTMLElement & { hidePopover?: () => void }) | null
  try {
    if (el?.matches(':popover-open')) el.hidePopover?.()
  } catch {
    // No popover support (old browser, test DOM): the panel stays as it is.
  }
}

/** Up to 4 digits with a colon after the first two. A picked datalist option is kept as is. */
function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  const v = input.value
  const digits = v.replace(/\D/g, '').slice(0, 4)
  model.value = /^\d{2}:\d{2}$/.test(v) ? v : digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`
  input.value = model.value
}

/** On blur: "9" -> "09:00", "930" -> "09:30". */
function onBlur() {
  const d = model.value.replace(/\D/g, '')
  if (d.length === 1 || d.length === 2) model.value = `${d.padStart(2, '0')}:00`
  else if (d.length === 3) model.value = `0${d[0]}:${d.slice(1)}`
}
</script>

<template>
  <div v-if="popover" class="oc-time-picker">
    <input
      v-bind="$attrs"
      class="oc-input oc-time-input"
      type="text"
      inputmode="numeric"
      maxlength="5"
      pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
      :placeholder="placeholder ?? 'hh:mm'"
      :aria-invalid="error ? 'true' : undefined"
      :disabled="disabled"
      :value="model"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
      @mouseup="onMouseUp"
    />
    <button type="button" class="oc-btn oc-btn--outline oc-btn--icon" :popovertarget="panelId" :aria-label="slotsLabel" :disabled="disabled">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:clock-outline"><path d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" /></svg>
    </button>
    <div :id="panelId" ref="panel" class="oc-popover" popover="auto" role="dialog" :aria-label="slotsLabel">
      <div class="oc-time-slots" role="radiogroup" :aria-label="slotsLabel">
        <label v-for="s in slots" :key="s" class="oc-time-slot"
          ><input type="radio" :name="panelId" :value="s" :checked="model === s" @change="pick(s)" />{{ s }}</label
        >
      </div>
    </div>
  </div>
  <input
    v-else
    v-bind="$attrs"
    class="oc-input oc-time-input"
    type="text"
    inputmode="numeric"
    maxlength="5"
    pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
    :placeholder="placeholder ?? 'hh:mm'"
    :list="slots?.length ? listId : undefined"
    :aria-invalid="error ? 'true' : undefined"
    :disabled="disabled"
    :value="model"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
    @mouseup="onMouseUp"
  />
  <datalist v-if="slots?.length && !popover" :id="listId">
    <option v-for="s in slots" :key="s" :value="s"></option>
  </datalist>
</template>
