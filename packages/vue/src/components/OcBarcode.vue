<!-- File: packages/vue/src/components/OcBarcode.vue | Map: props -> encode -> svg + digits -->
<script setup lang="ts">
/** EAN-13, EAN-8, UPC-A or Code 128 as SVG; shows the reason when the value cannot be encoded. */
import { computed } from 'vue'
import { barsToSvg, encodeBarcode } from '../../../ui/src/barcode.js'

const props = withDefaults(defineProps<{ value: string; format?: 'auto' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE128'; digits?: boolean; size?: 'md' | 'hero' | 'compact' }>(), { format: 'auto', digits: true, size: 'md' })
const result = computed(() => {
  try {
    const { bits, text } = encodeBarcode(props.value, props.format)
    return { svg: barsToSvg(bits, `Barcode ${text}`), text, error: '' }
  } catch (err) {
    return { svg: '', text: props.value, error: (err as Error).message }
  }
})
</script>

<template>
  <figure :class="['oc-barcode', size !== 'md' && `oc-barcode--${size}`]" :data-error="result.error ? '' : undefined">
    <span v-if="result.svg" style="display: contents" v-html="result.svg"></span>
    <figcaption v-if="digits || result.error" class="oc-barcode__digits">{{ result.error ? `${value}: ${result.error}` : result.text }}</figcaption>
  </figure>
</template>
