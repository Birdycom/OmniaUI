<!-- File: packages/vue/src/components/OcParticleField.vue | Map: canvas.oc-particles -> start on mount (particles.js) -> stop on unmount -->
<script setup lang="ts">
/** Background canvas with drifting points and lines; one still frame with reduced motion. local = fill the positioned parent. */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { initParticles } from '../../../ui/src/particles.js'

const props = defineProps<{ count?: number; speed?: number; link?: number; local?: boolean }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let stop = () => {}
const start = () => {
  stop()
  if (!canvas.value) return
  const options = Object.fromEntries(Object.entries({ count: props.count, speed: props.speed, link: props.link }).filter(([, v]) => v != null))
  stop = initParticles(canvas.value, options)
}
onMounted(start)
watch(() => [props.count, props.speed, props.link], start)
onBeforeUnmount(() => stop())
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" :class="['oc-particles', local && 'oc-particles--local']"></canvas>
</template>
