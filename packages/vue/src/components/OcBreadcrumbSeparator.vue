<script setup lang="ts">
/** Compound breadcrumb (0.17.1): an explicit separator (.oc-breadcrumb-separator), e.g. your own icon in the slot. Without it the items get "/" or › by CSS. */
import { inject } from 'vue'
import { breadcrumbKey } from '../composables/keys-breadcrumb'
import type { BreadcrumbContext } from '../composables/keys-breadcrumb'
import OcWebicon from './OcWebicon.vue'

const ctx = inject<BreadcrumbContext>(breadcrumbKey, { separator: 'slash', inList: false })
</script>

<template>
  <component :is="ctx.inList ? 'li' : 'span'" class="oc-breadcrumb-separator" role="presentation" aria-hidden="true"
    ><slot><OcWebicon v-if="ctx.separator === 'chevron'" name="mdi:chevron-right" bare fallback="iconify" /><template v-else>/</template></slot></component
  >
</template>
