<script setup lang="ts">
/** Avatar with name and e-mail (truncating). `initials` or `src` fill the avatar; slot `avatar` replaces it. */
defineProps<{
  name: string
  email?: string
  initials?: string
  src?: string
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
  <div class="oc-user">
    <slot name="avatar">
      <span :class="['oc-avatar', avatarSize && avatarSize !== 'md' && `oc-avatar--${avatarSize}`]">
        <img v-if="src" :src="src" alt="" />
        <template v-else>{{ initials }}</template>
      </span>
    </slot>
    <span class="oc-user-text">
      <span class="oc-user-name">{{ name }}</span>
      <span v-if="email" class="oc-user-email">{{ email }}</span>
    </span>
  </div>
</template>
