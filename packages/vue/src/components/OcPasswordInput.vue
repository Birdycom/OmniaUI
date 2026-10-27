<script setup lang="ts">
/**
 * Password field with show/hide button (aria-pressed reflects the state). v-model.
 * class/style stay on the wrapper, every other attribute (id, name, autocomplete...) goes to the input.
 */
import { ref } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'

defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ showLabel?: string; hideLabel?: string; toggleLabel?: string }>(), {
  showLabel: 'Show',
  hideLabel: 'Hide',
  toggleLabel: 'Toggle password visibility',
})
const model = defineModel<string>({ default: '' })
const { root, control } = useAttrsSplit()
const visible = ref(false)
</script>

<template>
  <div v-bind="root" class="oc-input-reveal">
    <input v-bind="control" v-model="model" class="oc-input" :type="visible ? 'text' : 'password'" />
    <button class="oc-input-reveal-button" type="button" :aria-pressed="visible ? 'true' : 'false'" :aria-label="toggleLabel" @click="visible = !visible">
      {{ visible ? hideLabel : showLabel }}
    </button>
  </div>
</template>
