<script setup lang="ts">
/**
 * Compound breadcrumb (0.17.1): a level you can go back to. An <a> by default; `as` renders your router link
 * (RouterLink, Inertia Link …) with the same attributes (to, …). href: the link. icon: a webicon name before the label.
 */
import type { Component } from 'vue'
import OcWebicon from './OcWebicon.vue'

withDefaults(defineProps<{ as?: string | Component; href?: string; icon?: string }>(), { as: 'a' })
</script>

<template>
  <component :is="as" class="oc-breadcrumb-link" v-bind="href === undefined ? {} : { href }"><OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /><slot /></component>
</template>
