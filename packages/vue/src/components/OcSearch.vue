<!-- File: packages/vue/src/components/OcSearch.vue | Map: v-model -> label.oc-search (icon, input type=search, optional key hint) -->
<script setup lang="ts">
/**
 * Search field (same markup as packages/ui/snippets/search.html). v-model: the query. `hint` = key hint on the right
 * ("/"), hidden while focused. `placeholder` is also the aria-label. class / style stay on the label, other attributes
 * (name, id, listeners) go to the input. Classes: .oc-search, -icon, -input, -hint
 */
import { useAttrsSplit } from '../composables/useAttrsSplit'
import OcWebicon from './OcWebicon.vue'

defineOptions({ inheritAttrs: false })
defineProps<{ placeholder?: string; hint?: string }>()
const model = defineModel<string>()
const { root, control } = useAttrsSplit()
</script>

<template>
  <label class="oc-search" v-bind="root">
    <OcWebicon name="mdi:magnify" bare class="oc-search-icon" />
    <input v-model="model" class="oc-search-input" type="search" :placeholder="placeholder" :aria-label="placeholder" v-bind="control" />
    <kbd v-if="hint" class="oc-search-hint">{{ hint }}</kbd>
  </label>
</template>
