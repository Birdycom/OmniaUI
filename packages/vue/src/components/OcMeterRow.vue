<!-- File: packages/vue/src/components/OcMeterRow.vue | Map: props -> level from the percentage -> row markup -->
<script setup lang="ts">
/** Usage line: label, percentage and amount, a colored bar (warn from 75, critical from 90), a sub-line (sub, subPercent) and the reset line. */
import { computed } from 'vue'

const props = defineProps<{ label: string; percent: number; value?: string; reset?: string; level?: 'ok' | 'warn' | 'critical'; sub?: string; subPercent?: number; subLevel?: 'warn' | 'critical' }>()
const pct = computed(() => Math.max(0, Math.min(100, Math.round(props.percent))))
const tone = computed(() => props.level ?? (pct.value >= 90 ? 'critical' : pct.value >= 75 ? 'warn' : 'ok'))
</script>

<template>
  <div class="oc-meter-row" :data-level="tone === 'ok' ? undefined : tone" :style="{ '--oc-meter': `${pct}%` }">
    <span class="oc-meter-row__label">{{ label }}</span>
    <span class="oc-meter-row__value"><strong>{{ pct }}%</strong><template v-if="value"> · {{ value }}</template></span>
    <span class="oc-meter-row__bar" role="meter" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct" :aria-label="label"></span>
    <span v-if="sub" class="oc-meter-row__sub">{{ sub }}<span v-if="subPercent != null" class="oc-meter-row__subbar" :data-level="subLevel" :style="{ '--oc-meter': `${Math.max(0, Math.min(100, subPercent))}%` }"></span></span>
    <span v-if="reset" class="oc-meter-row__reset">{{ reset }}</span>
  </div>
</template>
