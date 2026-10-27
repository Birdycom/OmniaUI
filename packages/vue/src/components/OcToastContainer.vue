<script setup lang="ts">
/** Fixed stack that renders the useToast() queue. Mount once near the app root. Classes: .oc-toast-container(--top/--static) */
import { useToast } from '../composables/useToast'
import OcToast from './OcToast.vue'

withDefaults(defineProps<{ position?: 'bottom' | 'top'; static?: boolean }>(), { position: 'bottom' })
const { toasts, dismiss } = useToast()
</script>

<template>
  <div :class="['oc-toast-container', position === 'top' && 'oc-toast-container--top', static && 'oc-toast-container--static']">
    <OcToast
      v-for="t in toasts"
      :key="t.id"
      :variant="t.variant"
      :title="t.title"
      :description="t.description"
      @dismiss="dismiss(t.id)"
    />
  </div>
</template>
