<script setup lang="ts">
/** Avatar with name and e-mail (truncating). `initials` (default: from `name`) or `src` fill the avatar; slot `avatar` replaces it. */
import { computed } from 'vue'

const props = defineProps<{
  name: string
  email?: string
  initials?: string
  src?: string
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const shownInitials = computed(() => props.initials ?? props.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join(''))
</script>

<template>
  <div class="oc-user">
    <slot name="avatar">
      <span :class="['oc-avatar', avatarSize && avatarSize !== 'md' && `oc-avatar--${avatarSize}`]">
        <img v-if="src" :src="src" alt="" />
        <template v-else>{{ shownInitials }}</template>
      </span>
    </slot>
    <span class="oc-user-text">
      <span class="oc-user-name">{{ name }}</span>
      <span v-if="email" class="oc-user-email">{{ email }}</span>
    </span>
  </div>
</template>
