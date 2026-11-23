<!-- File: packages/vue/src/components/OcBarcode.vue | Map: props -> encode -> svg + digits -->
<script setup lang="ts">
/** EAN-13, EAN-8, UPC-A or Code 128 as SVG; shows the reason when the value cannot be encoded.
 *  variant="bare": no white plate and border (inside a card). groupDigits (default true): EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1. */
import { computed } from 'vue'
import { barsToSvg, digitGroups, encodeBarcode } from '../../../ui/src/barcode.js'

const props = withDefaults(defineProps<{ value: string; format?: 'auto' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE128'; digits?: boolean; size?: 'md' | 'hero' | 'compact'; variant?: 'plate' | 'bare'; groupDigits?: boolean }>(), { format: 'auto', digits: true, size: 'md', variant: 'plate', groupDigits: true })
const result = computed(() => {
  try {
    const { bits, text, format } = encodeBarcode(props.value, props.format)
    return { svg: barsToSvg(bits, `Barcode ${text}`), text, groups: props.groupDigits ? digitGroups(text, format) : [text], error: '' }
  } catch (err) {
    return { svg: '', text: props.value, groups: [] as string[], error: (err as Error).message }
  }
})
</script>

<template>
  <figure :class="['oc-barcode', size !== 'md' && `oc-barcode--${size}`, variant === 'bare' && 'oc-barcode--bare']" :data-error="result.error ? '' : undefined">
    <span v-if="result.svg" style="display: contents" v-html="result.svg"></span>
    <figcaption v-if="digits || result.error" class="oc-barcode__digits">
      <template v-if="result.error">{{ `${value}: ${result.error}` }}</template>
      <span v-for="(g, i) in result.groups" v-else :key="i" class="oc-barcode__group">{{ g }}</span>
    </figcaption>
  </figure>
</template>
