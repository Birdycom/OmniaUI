<script setup lang="ts">
/**
 * Modal wizard: stepper rail on the left, step content and a Back / Next footer.
 * v-model:open opens the dialog, v-model:step is the active step index. Emits `finish` on the last step's button.
 * Slots: step-<index> (or default, scoped: { step, index }) for the content of each step.
 * Classes: dialog.oc-modal > .oc-modal-content--xl, .oc-block-wizard(-rail/-main/-step), .oc-stepper, .oc-modal-footer
 */
import { computed, ref } from 'vue'
import OcStepper from '../components/OcStepper.vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{
    steps: { label: string }[]
    backLabel?: string
    nextLabel?: string
    finishLabel?: string
    stepsLabel?: string
    /** Text for "Step 2 of 3"; receives the 1-based index and the count */
    stepText?: (index: number, total: number) => string
  }>(),
  { backLabel: 'Back', nextLabel: 'Next', finishLabel: 'Finish', stepsLabel: 'Setup steps' },
)
const emit = defineEmits<{ finish: [] }>()
const open = defineModel<boolean>('open', { default: false })
const step = defineModel<number>('step', { default: 0 })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const titleId = useUid('oc-wizard-title')
const last = computed(() => step.value >= props.steps.length - 1)
const description = computed(() => (props.stepText ?? ((i, n) => `Step ${i} of ${n}`))(step.value + 1, props.steps.length))

function next() {
  if (last.value) {
    emit('finish')
    open.value = false
  } else {
    step.value++
  }
}
</script>

<template>
  <dialog ref="el" class="oc-modal" closedby="closerequest" :aria-labelledby="titleId" @close="onClose">
    <div class="oc-modal-content oc-modal-content--xl">
      <div class="oc-block-wizard">
        <div class="oc-block-wizard-rail">
          <OcStepper v-model="step" :steps="steps" :label="stepsLabel" />
        </div>
        <div class="oc-block-wizard-main">
          <div class="oc-modal-header">
            <h2 :id="titleId" class="oc-modal-title">{{ steps[step]?.label }}</h2>
            <p class="oc-modal-description">{{ description }}</p>
          </div>
          <div class="oc-block-wizard-step">
            <slot :name="`step-${step}`" :step="steps[step]" :index="step"><slot :step="steps[step]" :index="step" /></slot>
          </div>
          <div class="oc-modal-footer">
            <button class="oc-btn oc-btn--outline" type="button" :disabled="step === 0" @click="step--">{{ backLabel }}</button>
            <button class="oc-btn" type="button" @click="next">{{ last ? finishLabel : nextLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>
