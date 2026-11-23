<script setup lang="ts">
/** Compound breadcrumb (0.18.0): one level, .oc-breadcrumb-item (<li> inside OcBreadcrumbList, else <span>). Holds a link, the page or the ellipsis. */
import { inject } from 'vue'
import { breadcrumbKey } from '../composables/keys-breadcrumb'
import type { BreadcrumbContext } from '../composables/keys-breadcrumb'

const ctx = inject<BreadcrumbContext>(breadcrumbKey, { separator: 'slash', inList: false })
</script>

<template>
  <component :is="ctx.inList ? 'li' : 'span'" class="oc-breadcrumb-item"><slot /></component>
</template>
