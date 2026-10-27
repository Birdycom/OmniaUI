<!-- File: packages/vue/src/components/OcFlipCard.vue | Map: props + v-model:flipped -> card -> checkbox (toggle) -> inner -> front / back faces -->
<script setup lang="ts">
/**
 * 3D flip card (same markup as snippets/flip-card.html). v-model:flipped. trigger: toggle (checkbox, default) |
 * hover (--hover, tabindex 0) | manual (.is-flipped from the model only). Props: vertical, frontLabel, backLabel.
 * Slots: front, back. Classes: .oc-flip-card(--hover/--vertical, .is-flipped), __toggle, __inner, __face(--front/--back),
 * __title, __text, __flip
 */
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{ trigger?: 'toggle' | 'hover' | 'manual'; vertical?: boolean; frontLabel?: string; backLabel?: string }>(),
  { trigger: 'toggle', frontLabel: 'Show answer', backLabel: 'Back' },
)
const flipped = defineModel<boolean>('flipped', { default: false })
const id = useUid('oc-flip')
</script>

<template>
  <div
    :class="['oc-flip-card', trigger === 'hover' && 'oc-flip-card--hover', vertical && 'oc-flip-card--vertical', trigger !== 'toggle' && flipped && 'is-flipped']"
    :tabindex="trigger === 'hover' ? 0 : undefined"
  >
    <input v-if="trigger === 'toggle'" :id="id" v-model="flipped" type="checkbox" class="oc-flip-card__toggle" />
    <div class="oc-flip-card__inner">
      <div class="oc-flip-card__face oc-flip-card__face--front">
        <slot name="front" />
        <label v-if="trigger === 'toggle'" class="oc-flip-card__flip" :for="id">{{ frontLabel }}</label>
      </div>
      <div class="oc-flip-card__face oc-flip-card__face--back">
        <slot name="back" />
        <label v-if="trigger === 'toggle'" class="oc-flip-card__flip" :for="id">{{ backLabel }}</label>
      </div>
    </div>
  </div>
</template>
