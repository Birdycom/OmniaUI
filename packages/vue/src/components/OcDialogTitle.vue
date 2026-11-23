<script setup lang="ts">
/** Title of the compound OcDialog (0.17.0), the accessible name of the dialog. Classes: .oc-modal-title */
import { inject } from 'vue'
import { dialogKey } from '../composables/keys-d3'

const ctx = inject(dialogKey, null)
</script>

<template>
  <h2 :id="ctx?.titleId" class="oc-modal-title"><slot /></h2>
</template>
