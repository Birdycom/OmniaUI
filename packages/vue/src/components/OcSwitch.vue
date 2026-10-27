<script setup lang="ts">
/** Toggle switch on a checkbox (role="switch"). v-model: boolean. Extra attributes go to the input. */
import { useAttrsSplit } from '../composables/useAttrsSplit'

defineOptions({ inheritAttrs: false })
const model = defineModel<boolean>({ default: false })
const { root, control } = useAttrsSplit()
</script>

<template>
  <label v-bind="root" class="oc-switch">
    <input v-bind="control" v-model="model" type="checkbox" role="switch" />
    <span class="oc-switch-track"></span>
  </label>
</template>
