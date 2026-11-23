<!-- File: packages/vue/src/blocks/OcBlockRouteProgress.vue | Map: props -> head -> progress -> next-step button -> ol of steps -->
<script setup lang="ts">
/**
 * What a visitor or team sees on a route or course: progress, the next step and every step with its state.
 * Emits `next` and `step` (index). Classes: .oc-block-route-progress, -head, -title, -meta, -score, -bar, -next (--finish, --over),
 * -list, -item (--done, --wrong, --current, --locked), -link, -marker, -text, -name, -sub, -value
 */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'
import OcWebicon from '../components/OcWebicon.vue'

export type RouteProgressState = 'todo' | 'done' | 'wrong' | 'current' | 'locked'
export interface RouteProgressStep {
  name: string
  sub?: string
  value?: string
  /** Number, or a webicon name (mdi:flag-checkered) for steps without a number. */
  marker?: string | number
  markerLabel?: string
  state?: RouteProgressState
}
export interface RouteProgressNext {
  label?: string
  title: string
  sub?: string
  meta?: string
  icon?: string
  tone?: 'default' | 'finish' | 'over'
}
const props = withDefaults(
  defineProps<{ title: string; meta?: string; score?: string | number; scoreLabel?: string; done: number; total: number; progressLabel?: string; next?: RouteProgressNext; steps: RouteProgressStep[]; listLabel?: string }>(),
  { scoreLabel: 'points', listLabel: 'Steps' },
)
const emit = defineEmits<{ next: []; step: [index: number] }>()
const titleId = useUid('oc-rprogress')
const pct = computed(() => (props.total > 0 ? Math.round((Math.min(props.done, props.total) / props.total) * 100) : 0))
const isIcon = (m: unknown) => typeof m === 'string' && m.includes(':')
const itemClass = (st: RouteProgressState = 'todo') => [
  'oc-block-route-progress-item',
  (st === 'done' || st === 'wrong') && 'oc-block-route-progress-item--done',
  st === 'wrong' && 'oc-block-route-progress-item--wrong',
  st === 'current' && 'oc-block-route-progress-item--current',
  st === 'locked' && 'oc-block-route-progress-item--locked',
]
</script>

<template>
  <section class="oc-block-route-progress" :aria-labelledby="titleId">
    <div class="oc-block-route-progress-head">
      <div>
        <h2 :id="titleId" class="oc-block-route-progress-title">{{ title }}</h2>
        <p v-if="meta" class="oc-block-route-progress-meta">{{ meta }}</p>
      </div>
      <div v-if="score !== undefined" class="oc-block-route-progress-score"><b>{{ score }}</b><span>{{ scoreLabel }}</span></div>
    </div>
    <div class="oc-block-route-progress-bar">
      <div class="oc-block-route-progress-bar-label"><span>{{ progressLabel ?? `${done} of ${total} steps done` }}</span><span>{{ pct }}%</span></div>
      <div class="oc-progress" role="progressbar" aria-label="Steps done" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="total"><div class="oc-progress-bar" :style="{ width: `${pct}%` }"></div></div>
    </div>
    <button v-if="next" type="button" :class="['oc-block-route-progress-next', next.tone && next.tone !== 'default' && `oc-block-route-progress-next--${next.tone}`]" @click="emit('next')">
      <span class="oc-block-route-progress-next-icon" aria-hidden="true"><OcWebicon :name="next.icon ?? 'mdi:walk'" bare fallback="iconify" /></span>
      <span class="oc-block-route-progress-next-text">
        <span class="oc-block-route-progress-next-label">{{ next.label ?? 'Now' }}</span>
        <span class="oc-block-route-progress-next-title">{{ next.title }}</span>
        <span v-if="next.sub" class="oc-block-route-progress-next-sub">{{ next.sub }}</span>
      </span>
      <span v-if="next.meta" class="oc-block-route-progress-next-meta">{{ next.meta }}</span>
    </button>
    <ol class="oc-block-route-progress-list" :aria-label="listLabel">
      <li v-for="(s, i) in steps" :key="i" :class="itemClass(s.state)">
        <button class="oc-block-route-progress-link" type="button" :aria-current="s.state === 'current' ? 'step' : undefined" @click="emit('step', i)">
          <span class="oc-block-route-progress-marker"><OcWebicon v-if="isIcon(s.marker)" :name="String(s.marker)" :label="s.markerLabel" bare fallback="iconify" /><template v-else>{{ s.marker ?? i + 1 }}</template></span>
          <span class="oc-block-route-progress-text">
            <span class="oc-block-route-progress-name">{{ s.name }}</span>
            <span v-if="s.sub" class="oc-block-route-progress-sub">{{ s.sub }}</span>
          </span>
          <span v-if="s.value" class="oc-block-route-progress-value">{{ s.value }}</span>
        </button>
      </li>
    </ol>
  </section>
</template>
