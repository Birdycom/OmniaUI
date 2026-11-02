<!-- File: packages/vue/src/components/OcPrice.vue | Map: props -> formatted amounts -> main line, note, alternative -->
<script setup lang="ts">
/** A price with old price, discount, VAT note and the other amount (same markup as snippets/price.html). */
const props = withDefaults(defineProps<{
  amount: number | string
  old?: number | string
  discount?: string
  note?: string
  alt?: string
  currency?: string
  locale?: string
  size?: 'sm' | 'md' | 'lg'
  sale?: boolean
  inline?: boolean
  end?: boolean
}>(), { currency: 'EUR', locale: 'nl-BE', size: 'md' })
const format = (v: number | string) => (typeof v === 'number' ? new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency }).format(v) : v)
</script>

<template>
  <div :class="['oc-price', size !== 'md' && `oc-price--${size}`, sale && 'oc-price--sale', inline && 'oc-price--inline', end && 'oc-price--end']">
    <div class="oc-price__main">
      <span class="oc-price__amount">{{ format(amount) }}</span>
      <s v-if="old != null" class="oc-price__old">{{ format(old) }}</s>
      <span v-if="discount" class="oc-badge oc-badge--destructive">{{ discount }}</span>
    </div>
    <span v-if="note" class="oc-price__note">{{ note }}</span>
    <span v-if="alt" class="oc-price__alt">{{ alt }}</span>
  </div>
</template>
