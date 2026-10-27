<!-- File: packages/vue/src/components/OcUpgradeBanner.vue | Map: aside -> icon slot -> body (title + plan pill, text slot, usage meter) -> actions slot -> dismiss button -->
<script setup lang="ts">
/**
 * Free-plan limits callout. `dismissible` adds an X that emits `dismiss` (your app hides the banner).
 * Slots: icon, default (text, may hold links), actions.
 * Classes: .oc-upgrade-banner(--premium/--compact), -icon, -body, -title, -plan, -text, -usage, meter.oc-upgrade-banner-meter, -actions, -dismiss
 */
withDefaults(
  defineProps<{
    title: string
    plan?: string
    text?: string
    usage?: { label: string; value: number; max: number }
    premium?: boolean
    compact?: boolean
    dismissible?: boolean
    dismissLabel?: string
  }>(),
  { dismissLabel: 'Dismiss' },
)
const emit = defineEmits<{ dismiss: [] }>()
</script>

<template>
  <aside :class="['oc-upgrade-banner', premium && 'oc-upgrade-banner--premium', compact && 'oc-upgrade-banner--compact']">
    <span v-if="$slots.icon" class="oc-upgrade-banner-icon" aria-hidden="true"><slot name="icon" /></span>
    <div class="oc-upgrade-banner-body">
      <p class="oc-upgrade-banner-title">{{ title }} <span v-if="plan" class="oc-upgrade-banner-plan">{{ plan }}</span></p>
      <p v-if="$slots.default || text" class="oc-upgrade-banner-text"><slot>{{ text }}</slot></p>
      <div v-if="usage" class="oc-upgrade-banner-usage">
        <span>{{ usage.label }}</span>
        <!-- low / high make the meter turn "less good" near the limit. -->
        <meter class="oc-upgrade-banner-meter" min="0" :max="usage.max" :low="usage.max * 0.6" :high="usage.max * 0.8" optimum="0" :value="usage.value">
          {{ usage.value }} of {{ usage.max }}
        </meter>
        <span>{{ usage.value }} / {{ usage.max }}</span>
      </div>
    </div>
    <div v-if="$slots.actions" class="oc-upgrade-banner-actions"><slot name="actions" /></div>
    <button v-if="dismissible" class="oc-upgrade-banner-dismiss" type="button" :aria-label="dismissLabel" @click="emit('dismiss')">×</button>
  </aside>
</template>
