<script setup lang="ts">
/** Compound breadcrumb (0.17.1): an explicit separator (.oc-breadcrumb-separator), e.g. your own icon in the slot. Without it the items get "/" or › by CSS. */
import { inject } from 'vue'
import { breadcrumbKey } from '../composables/keys-breadcrumb'
import type { BreadcrumbContext } from '../composables/keys-breadcrumb'

const ctx = inject<BreadcrumbContext>(breadcrumbKey, { separator: 'slash', inList: false })
</script>

<template>
  <component :is="ctx.inList ? 'li' : 'span'" class="oc-breadcrumb-separator" role="presentation" aria-hidden="true"
    ><slot><svg v-if="ctx.separator === 'chevron'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:chevron-right"><path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" /></svg><template v-else>/</template></slot></component
  >
</template>
