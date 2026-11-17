<!-- File: packages/vue/src/components/OcColorField.vue | Map: props + v-model -> picker + hex input -> contrast report (text on the color, the color on backgrounds) -->
<script setup lang="ts">
/**
 * Native color picker next to a hex text input, kept in sync. v-model: color string (#rrggbb).
 * contrast-against ([{ name, color }]): a report under the field with the contrast of text on the color (4.5:1, light or
 * dark text) and of the color on those backgrounds (3:1); `contrast` shows the text line alone.
 */
import { onMounted, ref, watch } from 'vue'
import { contrastRatio, pickOnColor } from '../color'

const props = withDefaults(defineProps<{
  pickerLabel?: string
  valueLabel?: string
  contrastAgainst?: { name: string; color: string }[]
  contrast?: boolean
  contrastLabels?: { text?: string; against?: string; ok?: string; low?: string }
}>(), {
  pickerLabel: 'Pick a color',
  valueLabel: 'Color value',
})
const model = defineModel<string>({ default: '#000000' })

interface Check { key: string; label: string; ratio: number; ok: boolean; bg: string; fg?: string; dot?: string }
const checks = ref<Check[]>([])
const L = () => ({ text: 'Text on this color', against: 'On {name}', ok: 'OK', low: 'Too low', ...props.contrastLabels })

function measure() {
  if (!props.contrast && !props.contrastAgainst?.length) { checks.value = []; return }
  if (!/^#[0-9a-f]{6}$/i.test(model.value)) return
  const l = L()
  const on = pickOnColor(model.value)
  const list: Check[] = []
  const text = contrastRatio(model.value, on)
  if (text) list.push({ key: 'text', label: l.text, ratio: text, ok: text >= 4.5, bg: model.value, fg: on })
  for (const b of props.contrastAgainst ?? []) {
    const r = contrastRatio(model.value, b.color)
    if (r) list.push({ key: b.name, label: l.against.replace('{name}', b.name), ratio: r, ok: r >= 3, bg: b.color, dot: model.value })
  }
  checks.value = list
}
onMounted(measure)
watch([model, () => props.contrastAgainst, () => props.contrast], measure, { deep: true })
</script>

<template>
  <div class="oc-color-field">
    <input v-model="model" type="color" :aria-label="pickerLabel" />
    <input v-model="model" class="oc-input" type="text" :aria-label="valueLabel" />
    <ul v-if="checks.length" class="oc-color-field-report" aria-live="polite">
      <li v-for="c in checks" :key="c.key" class="oc-color-field-check" :data-ok="c.ok ? 'true' : 'false'">
        <span class="oc-color-field-sample" aria-hidden="true" :style="{ background: c.bg, color: c.fg }"><i v-if="c.dot" :style="{ background: c.dot }"></i><template v-else>Aa</template></span>
        <span>{{ c.label }}</span>
        <span class="oc-color-field-ratio">{{ c.ratio.toFixed(1) }}:1 · {{ c.ok ? L().ok : L().low }}</span>
      </li>
    </ul>
  </div>
</template>
