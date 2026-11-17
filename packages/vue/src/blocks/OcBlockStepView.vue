<!-- File: packages/vue/src/blocks/OcBlockStepView.vue | Map: props -> top -> picture + badges -> title, place, text -> task -> blocks slot -> question -->
<script setup lang="ts">
/**
 * One step of a route or course as the visitor sees it: picture, title, place, text, task, the content blocks and a question.
 * v-model:answer = index of the picked answer; emits `send`. Slots: back, distance, picture, badges, default (text), blocks.
 * Countdown in the blocks slot: <div class="oc-block-step-view-countdown" role="timer" style="--oc-step-view-left: 62%">.
 * Classes: .oc-block-step-view, -top, -picture (--empty + data-number), -badges, -title, -place, -text, -task, -blocks, -countdown, -question, -kicker, -ask, -answers, -send, -hint
 */
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'

export interface StepViewQuestion {
  kicker?: string
  text: string
  options: string[]
  sendLabel?: string
  hint?: string
  /** After checking (0.17.0): the picked and the right answer; the answers turn green / red and lock (slot `feedback`). */
  result?: { picked: number; correct: number }
  resultLabels?: { correct?: string; wrong?: string }
}
const props = defineProps<{ title: string; place?: string; task?: string; number?: string | number; question?: StepViewQuestion }>()
const answer = defineModel<number>('answer')
const mark = (i: number): 'correct' | 'wrong' | undefined => {
  const r = props.question?.result
  if (!r) return undefined
  return i === r.correct ? 'correct' : i === r.picked ? 'wrong' : undefined
}
const emit = defineEmits<{ send: [] }>()
const titleId = useUid('oc-stepview')
</script>

<template>
  <article class="oc-block-step-view" :aria-labelledby="titleId">
    <div v-if="$slots.back || $slots.distance" class="oc-block-step-view-top"><slot name="back"><span></span></slot><slot name="distance" /></div>
    <figure v-if="$slots.picture || number !== undefined" :class="['oc-block-step-view-picture', !$slots.picture && 'oc-block-step-view-picture--empty']" :data-number="$slots.picture ? undefined : number">
      <slot name="picture" />
      <figcaption v-if="$slots.badges" class="oc-block-step-view-badges"><slot name="badges" /></figcaption>
    </figure>
    <h2 :id="titleId" class="oc-block-step-view-title">{{ title }}</h2>
    <p v-if="place" class="oc-block-step-view-place"><OcWebicon name="mdi:map-marker-outline" bare fallback="iconify" /> {{ place }}</p>
    <div v-if="$slots.default" class="oc-block-step-view-text"><slot /></div>
    <p v-if="task" class="oc-block-step-view-task"><OcWebicon name="mdi:target" bare fallback="iconify" /> {{ task }}</p>
    <div v-if="$slots.blocks" class="oc-block-step-view-blocks"><slot name="blocks" /></div>
    <div v-if="question" class="oc-block-step-view-question">
      <span v-if="question.kicker" class="oc-block-step-view-kicker">{{ question.kicker }}</span>
      <p :id="`${titleId}-ask`" class="oc-block-step-view-ask">{{ question.text }}</p>
      <fieldset class="oc-block-step-view-answers" :aria-labelledby="`${titleId}-ask`">
        <label v-for="(o, i) in question.options" :key="i" class="oc-radio-item oc-radio-item--card" :data-result="mark(i)">
          <input v-model="answer" class="oc-radio" type="radio" :name="`${titleId}-answer`" :value="i" :disabled="!!question.result" :checked="question.result ? question.result.picked === i : undefined"><span>{{ o }}</span>
          <span v-if="mark(i)" class="oc-visually-hidden"> {{ mark(i) === 'correct' ? (question.resultLabels?.correct ?? 'Correct') : (question.resultLabels?.wrong ?? 'Wrong') }}</span>
        </label>
      </fieldset>
      <slot v-if="question.result" name="feedback" />
      <button v-else class="oc-btn oc-btn--lg oc-block-step-view-send" type="button" @click="emit('send')">{{ question.sendLabel ?? 'Send answer' }}</button>
      <p v-if="question.hint" class="oc-block-step-view-hint">{{ question.hint }}</p>
    </div>
  </article>
</template>
