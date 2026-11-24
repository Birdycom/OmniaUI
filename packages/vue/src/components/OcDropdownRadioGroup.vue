<script setup lang="ts">
/**
 * role="group" around OcDropdownRadioItem's (0.17.2): v-model is the chosen value; the item with that value is checked
 * (role menuitemradio). A click on an item sets the v-model; like every check item it keeps the menu open.
 */
import { computed, provide } from 'vue'
const model = defineModel<string | undefined>({ default: undefined })
provide('oc-dropdown-radio', {
  value: computed(() => model.value),
  select: (value: string) => { model.value = value },
})
</script>

<template>
  <div class="oc-dropdown-radio-group" role="group"><slot /></div>
</template>
