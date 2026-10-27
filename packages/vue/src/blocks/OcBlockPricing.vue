<script setup lang="ts">
/**
 * Pricing cards with a featured plan. Emits `select` with the plan when its button is clicked.
 * Slot `action` (scoped: { plan }) replaces the button. Classes: .oc-block-pricing, -grid, -card(--featured),
 * -name, -desc, -price, -features
 */
export interface PricingPlan {
  name: string
  description?: string
  price: string
  /** e.g. "/month" */
  period?: string
  features: string[]
  cta: string
  featured?: boolean
}
defineProps<{ title?: string; description?: string; plans: PricingPlan[] }>()
defineEmits<{ select: [plan: PricingPlan] }>()
</script>

<template>
  <div class="oc-block-pricing">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div class="oc-block-pricing-grid">
      <div v-for="plan in plans" :key="plan.name" :class="['oc-block-pricing-card', plan.featured && 'oc-block-pricing-card--featured']">
        <p class="oc-block-pricing-name">{{ plan.name }}</p>
        <p v-if="plan.description" class="oc-block-pricing-desc">{{ plan.description }}</p>
        <p class="oc-block-pricing-price">{{ plan.price }} <span v-if="plan.period">{{ plan.period }}</span></p>
        <ul class="oc-block-pricing-features">
          <li v-for="f in plan.features" :key="f">{{ f }}</li>
        </ul>
        <slot name="action" :plan="plan">
          <button :class="['oc-btn', !plan.featured && 'oc-btn--outline']" type="button" style="width: 100%" @click="$emit('select', plan)">{{ plan.cta }}</button>
        </slot>
      </div>
    </div>
  </div>
</template>
