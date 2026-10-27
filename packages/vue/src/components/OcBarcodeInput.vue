<!-- File: packages/vue/src/components/OcBarcodeInput.vue | Map: props + model -> template (label, digits-only field, preview figure + slot) -->
<script setup lang="ts">
/**
 * Barcode / EAN field with a preview. v-model: string (digits only).
 * Slot `preview`: your own <svg>/<canvas> barcode; default = decorative placeholder bars.
 * Same markup as packages/ui/snippets/barcode-input.html. class/style on the wrapper, other attributes on the input.
 */
import { computed } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ label?: string; id?: string; emptyText?: string; error?: boolean }>(), { emptyText: 'No code yet' })
const model = defineModel<string>({ default: '' })
const { root, control } = useAttrsSplit()
const auto = useUid('oc-barcode')
const inputId = computed(() => props.id ?? auto)

function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  model.value = input.value
}
</script>

<template>
  <div v-bind="root" class="oc-barcode-input">
    <label v-if="label" class="oc-field-label" :for="inputId">{{ label }}</label>
    <div class="oc-input-group oc-input-group--affix">
      <span class="oc-input-addon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 1h1.4v14H1zm2.2 0h.7v14h-.7zm1.6 0h1.5v14H4.8zm2.4 0h.7v14H7.2zm1.6 0h.7v14H8.8zm1.5 0h1.4v14h-1.4zm2.2 0H15v14h-.9z" /></svg>
      </span>
      <input
        v-bind="control"
        :id="inputId"
        class="oc-input oc-barcode-input-field"
        type="text"
        autocomplete="off"
        spellcheck="false"
        maxlength="80"
        placeholder="EAN-13 or internal code"
        :aria-invalid="error ? 'true' : undefined"
        :value="model"
        @input="onInput"
      />
    </div>
    <figure :class="['oc-barcode-preview', !model && 'oc-barcode-preview--empty']" aria-label="Barcode preview">
      <slot name="preview"><div class="oc-barcode-preview-bars" aria-hidden="true"></div></slot>
      <figcaption class="oc-barcode-preview-code">{{ model || emptyText }}</figcaption>
    </figure>
  </div>
</template>
