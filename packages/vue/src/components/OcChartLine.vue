<!-- File: packages/vue/src/components/OcChartLine.vue | Map: props + demo data -> computed axis / paths -> figure (head, y axis, plot: svg + hover columns, x axis, legend) -->
<script setup lang="ts">
/**
 * Line / area chart in inline SVG (same markup as snippets/chart-line.html); tooltips open on :hover / :focus-visible (CSS only).
 * series: { name, values, dashed? }[]; labels = one per point (tooltips), xLabels = short axis labels. max defaults to a round
 * number above the data. variant: line | area | spark; dots = always visible. Classes: .oc-chart-line(--area/--dots/--spark) __head
 * __title __sub __value __body __y __plot __svg __series __area __path(--dashed) __cols __col __dot __tip __row __x; .oc-chart-legend
 */
import { computed } from 'vue'
import { chartLinePath, n2, niceMax } from '../composables/chartLine'

export interface ChartLineSeries { name: string; values: number[]; dashed?: boolean }
const props = withDefaults(
  defineProps<{
    title?: string
    sub?: string
    value?: string
    series?: ChartLineSeries[]
    labels?: string[]
    xLabels?: string[]
    max?: number
    rows?: number
    variant?: 'line' | 'area' | 'spark'
    dots?: boolean
    label?: string
  }>(),
  {
    title: 'Visitors',
    sub: 'January – June 2026',
    series: () => [
      { name: 'Desktop', values: [186, 305, 237, 73, 209, 214] },
      { name: 'Mobile', values: [80, 200, 120, 190, 130, 140] },
    ],
    rows: 4,
    variant: 'line',
    dots: true,
    label: 'Visitors per month',
  },
)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June']
const labels = computed(() => props.labels ?? MONTHS)
const axis = computed(() => props.xLabels ?? props.labels ?? MONTHS.map((m) => m.slice(0, 3)))
const top = computed(() => props.max ?? niceMax(Math.max(0, ...props.series.flatMap((s) => s.values)), props.rows))
const count = computed(() => Math.max(0, ...props.series.map((s) => s.values.length)))
const paths = computed(() => props.series.map((s) => chartLinePath(s.values, top.value)))
const yLabels = computed(() => Array.from({ length: props.rows + 1 }, (_, i) => top.value - (top.value / props.rows) * i))
const colLabel = (i: number) => `${labels.value[i] ?? i + 1}: ${props.series.map((s) => `${s.name} ${s.values[i]}`).join(', ')}`
</script>

<template>
  <figure :class="['oc-chart-line', variant !== 'line' && `oc-chart-line--${variant}`, dots && 'oc-chart-line--dots']">
    <figcaption v-if="title || sub || value" class="oc-chart-line__head">
      <span v-if="title" class="oc-chart-line__title">{{ title }}</span>
      <span v-if="sub" class="oc-chart-line__sub">{{ sub }}</span>
      <span v-if="value" class="oc-chart-line__value">{{ value }}</span>
    </figcaption>
    <div class="oc-chart-line__body">
      <ul class="oc-chart-line__y" aria-hidden="true"><li v-for="(y, i) in yLabels" :key="i">{{ y }}</li></ul>
      <div class="oc-chart-line__plot" :style="rows !== 4 ? `--oc-chart-line-rows:${rows}` : undefined">
        <svg class="oc-chart-line__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g v-for="(s, i) in series" :key="i" class="oc-chart-line__series">
            <path class="oc-chart-line__area" :d="`${paths[i]} L100 100 L0 100 Z`" />
            <path :class="['oc-chart-line__path', s.dashed && 'oc-chart-line__path--dashed']" :d="paths[i]" />
          </g>
        </svg>
        <ul class="oc-chart-line__cols" :style="`--n:${count}`" :aria-label="label">
          <li v-for="i in count" :key="i" class="oc-chart-line__col" :style="`--x:${i - 1}`" tabindex="0" :aria-label="colLabel(i - 1)">
            <i v-for="(s, j) in series" :key="j" class="oc-chart-line__dot" :style="`--y:${n2((s.values[i - 1] / top) * 100)}%`"></i>
            <span class="oc-chart-line__tip" aria-hidden="true">
              <strong>{{ labels[i - 1] ?? i }}</strong>
              <span v-for="(s, j) in series" :key="j" class="oc-chart-line__row">{{ s.name }}<b>{{ s.values[i - 1] }}</b></span>
            </span>
          </li>
        </ul>
      </div>
      <ol class="oc-chart-line__x" aria-hidden="true"><li v-for="(l, i) in axis" :key="i">{{ l }}</li></ol>
    </div>
    <ul class="oc-chart-legend"><li v-for="(s, i) in series" :key="i"><span class="oc-chart-swatch"></span>{{ s.name }}</li></ul>
  </figure>
</template>
