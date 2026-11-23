<script setup lang="ts">
/** Compound breadcrumb (0.17.1): the <ol> inside OcBreadcrumb; its OcBreadcrumbItem / OcBreadcrumbSeparator become <li>. */
import { inject, provide } from 'vue'
import { breadcrumbKey } from '../composables/keys-breadcrumb'
import type { BreadcrumbContext } from '../composables/keys-breadcrumb'

const parent = inject<BreadcrumbContext>(breadcrumbKey, { separator: 'slash', inList: false })
provide(breadcrumbKey, { separator: parent.separator, inList: true })
</script>

<template>
  <ol class="oc-breadcrumb-list"><slot /></ol>
</template>
