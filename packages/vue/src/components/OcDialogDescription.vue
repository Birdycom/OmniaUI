<script setup lang="ts">
/** Description of the compound OcDialog (0.17.0), the accessible description of the dialog. Classes: .oc-modal-description */
import { inject } from 'vue'
import { dialogKey } from '../composables/keys-d3'

const ctx = inject(dialogKey, null)
</script>

<template>
  <p :id="ctx?.descriptionId" class="oc-modal-description"><slot /></p>
</template>
