<script setup lang="ts">
/**
 * Wizard step navigation. v-model = index of the active step (0-based); earlier steps are done and
 * clickable, later steps are disabled. Classes: .oc-stepper(--horizontal), .oc-stepper-item(--done/--active),
 * -label, -meta.
 */
export interface StepperStep {
  label: string
  /** Small text under the label, e.g. 2/4 */
  meta?: string
}
defineProps<{ steps: StepperStep[]; horizontal?: boolean; label?: string }>()
const current = defineModel<number>({ default: 0 })
</script>

<template>
  <ol :class="['oc-stepper', horizontal && 'oc-stepper--horizontal']" :aria-label="label">
    <li v-for="(step, i) in steps" :key="i">
      <button
        :class="['oc-stepper-item', i < current && 'oc-stepper-item--done', i === current && 'oc-stepper-item--active']"
        type="button"
        :aria-current="i === current ? 'step' : undefined"
        :disabled="i > current"
        @click="current = i"
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
