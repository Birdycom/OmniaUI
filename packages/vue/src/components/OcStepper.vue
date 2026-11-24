<script setup lang="ts">
/**
 * Wizard step navigation. v-model = index of the active step (0-based); earlier steps are done and
 * clickable, later steps are disabled. Classes: .oc-stepper(--horizontal), .oc-stepper-item(--done/--active),
 * -label, -meta.
 * isStepEnabled (0.18.0): (index) => boolean, which steps can be clicked (default: index <= current).
 */
export interface StepperStep {
  label: string
  /** Small text under the label, e.g. 2/4 */
  meta?: string
}
const props = defineProps<{ steps: StepperStep[]; horizontal?: boolean; label?: string; isStepEnabled?: (index: number) => boolean }>()
const current = defineModel<number>({ default: 0 })
const enabled = (i: number) => (props.isStepEnabled ? props.isStepEnabled(i) : i <= current.value)
function go(i: number) {
  if (enabled(i)) current.value = i
}
</script>

<template>
  <ol :class="['oc-stepper', horizontal && 'oc-stepper--horizontal']" :aria-label="label">
    <li v-for="(step, i) in steps" :key="i">
      <button
        :class="['oc-stepper-item', i < current && 'oc-stepper-item--done', i === current && 'oc-stepper-item--active']"
        type="button"
        :aria-current="i === current ? 'step' : undefined"
        :disabled="!enabled(i)"
        @click="go(i)"
      >
        <span v-if="step.meta">
          <span class="oc-stepper-label">{{ step.label }}</span>
          <span class="oc-stepper-meta">{{ step.meta }}</span>
        </span>
        <span v-else class="oc-stepper-label">{{ step.label }}</span>
      </button>
    </li>
  </ol>
</template>
