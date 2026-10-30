<!-- File: packages/vue/src/components/OcPriceCard.vue | Map: props -> head -> toggle (radios) -> monthly / yearly / lifetime price -> features -> cta slot -->
<script setup lang="ts">
/**
 * Plan card with a CSS-only monthly / yearly switch (radio + :has). Slots: cta, features (replaces the list items).
 * Classes: .oc-price-card (--featured), __head, __name, __discount, __desc, __toggle, __price(--monthly/--yearly),
 * __amount, __period, __was, __note, __features, __feature(--excluded), __cta
 */
import { useUid } from '../composables/useUid'

export interface PriceCardFeature {
  label: string
  excluded?: boolean
}
export interface PriceCardPrice {
  amount: string
  period?: string
  was?: string
  note?: string
}
withDefaults(
  defineProps<{
    name: string
    description?: string
    discount?: string
    monthly: PriceCardPrice
    yearly?: PriceCardPrice
    /** Optional third option, e.g. a one-time price. Needs `yearly`. */
    lifetime?: PriceCardPrice
    defaultPeriod?: 'monthly' | 'yearly' | 'lifetime'
    features?: PriceCardFeature[]
    featured?: boolean
    monthlyLabel?: string
    yearlyLabel?: string
    lifetimeLabel?: string
  }>(),
  { defaultPeriod: 'monthly', features: () => [], monthlyLabel: 'Monthly', yearlyLabel: 'Yearly', lifetimeLabel: 'Lifetime' },
)
// Every card needs its own radio group name.
const group = useUid('oc-price')
</script>

<template>
  <article :class="['oc-price-card', featured && 'oc-price-card--featured']">
    <div class="oc-price-card__head">
      <h3 class="oc-price-card__name">{{ name }}</h3>
      <span v-if="discount" class="oc-price-card__discount">{{ discount }}</span>
    </div>
    <p v-if="description" class="oc-price-card__desc">{{ description }}</p>
    <div v-if="yearly" class="oc-segmented oc-price-card__toggle" role="radiogroup" aria-label="Billing period">
      <label class="oc-segmented-item"><input type="radio" :name="group" value="monthly" :checked="defaultPeriod === 'monthly'" /> {{ monthlyLabel }}</label>
      <label class="oc-segmented-item"><input type="radio" :name="group" value="yearly" :checked="defaultPeriod === 'yearly'" /> {{ yearlyLabel }}</label>
      <label v-if="lifetime" class="oc-segmented-item"><input type="radio" :name="group" value="lifetime" :checked="defaultPeriod === 'lifetime'" /> {{ lifetimeLabel }}</label>
    </div>
    <p class="oc-price-card__price oc-price-card__price--monthly">
      <span class="oc-price-card__amount">{{ monthly.amount }}</span>
      <span v-if="monthly.period" class="oc-price-card__period">{{ monthly.period }}</span>
      <s v-if="monthly.was" class="oc-price-card__was">{{ monthly.was }}</s>
      <span v-if="monthly.note" class="oc-price-card__note">{{ monthly.note }}</span>
    </p>
    <p v-if="yearly" class="oc-price-card__price oc-price-card__price--yearly">
      <span class="oc-price-card__amount">{{ yearly.amount }}</span>
      <span v-if="yearly.period" class="oc-price-card__period">{{ yearly.period }}</span>
      <s v-if="yearly.was" class="oc-price-card__was">{{ yearly.was }}</s>
      <span v-if="yearly.note" class="oc-price-card__note">{{ yearly.note }}</span>
    </p>
    <p v-if="yearly && lifetime" class="oc-price-card__price oc-price-card__price--lifetime">
      <span class="oc-price-card__amount">{{ lifetime.amount }}</span>
      <span v-if="lifetime.period" class="oc-price-card__period">{{ lifetime.period }}</span>
      <s v-if="lifetime.was" class="oc-price-card__was">{{ lifetime.was }}</s>
      <span v-if="lifetime.note" class="oc-price-card__note">{{ lifetime.note }}</span>
    </p>
    <ul v-if="features.length || $slots.features" class="oc-price-card__features">
      <slot name="features">
        <li v-for="(f, i) in features" :key="i" :class="['oc-price-card__feature', f.excluded && 'oc-price-card__feature--excluded']">{{ f.label }}</li>
      </slot>
    </ul>
    <slot name="cta" />
  </article>
</template>
