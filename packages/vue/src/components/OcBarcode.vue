<!-- File: packages/vue/src/components/OcBarcode.vue | Map: props -> encode -> svg + digits -->
<script setup lang="ts">
/** EAN-13, EAN-8, UPC-A or Code 128 as SVG; shows the reason when the value cannot be encoded.
 *  variant="bare": no white plate and border (inside a card). groupDigits (default true): EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1.
 *  format="QR" (0.18.0): a QR code from the own encoder (level L|M|Q|H, default M), white quiet zone in every theme.
 *  fallback="code128" (0.17.1): an EAN/UPC value that cannot be encoded (wrong check digit) is drawn as Code 128 (data-fallback-used). */
import { computed } from 'vue'
import { barsToSvg, digitGroups, encodeBarcode, qrToSvg } from '../../../ui/src/barcode.js'

const props = withDefaults(defineProps<{ value: string; format?: 'auto' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE128' | 'QR'; level?: 'L' | 'M' | 'Q' | 'H'; digits?: boolean; size?: 'md' | 'hero' | 'compact'; variant?: 'plate' | 'bare'; groupDigits?: boolean; fallback?: 'code128' }>(), { format: 'auto', level: 'M', digits: true, size: 'md', variant: 'plate', groupDigits: true })
const result = computed(() => {
  try {
    const { bits, text, format, fallback, qr } = encodeBarcode(props.value, props.format, { fallback: props.fallback, level: props.level })
    if (qr) return { svg: qrToSvg(qr.matrix, `QR code ${text}`), text, groups: [text], error: '', fell: false, qr: true }
    return { svg: barsToSvg(bits, `Barcode ${text}`), text, groups: props.groupDigits ? digitGroups(text, format) : [text], error: '', fell: !!fallback, qr: false }
  } catch (err) {
    return { svg: '', text: props.value, groups: [] as string[], error: (err as Error).message, fell: false, qr: false }
  }
})
</script>

<template>
  <figure :class="['oc-barcode', result.qr && 'oc-barcode--qr', size !== 'md' && `oc-barcode--${size}`, variant === 'bare' && 'oc-barcode--bare']" :data-error="result.error ? '' : undefined" :data-fallback-used="result.fell ? '' : undefined">
    <span v-if="result.svg" style="display: contents" v-html="result.svg"></span>
    <figcaption v-if="digits || result.error" class="oc-barcode__digits">
      <template v-if="result.error">{{ `${value}: ${result.error}` }}</template>
      <span v-for="(g, i) in result.groups" v-else :key="i" class="oc-barcode__group">{{ g }}</span>
    </figcaption>
  </figure>
</template>
