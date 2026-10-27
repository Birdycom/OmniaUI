<script setup lang="ts">
/**
 * List row. Renders <a> when `href` is set. Slots: media (left; `icon` boxes it, `image` makes it an image),
 * default (replaces title + description), actions (right), header / footer (full-width rows).
 * Classes: .oc-item(--outline/--muted/--sm/--interactive), -media(--icon/--image), -content, -title, -description,
 * -actions, -header, -footer
 */
withDefaults(
  defineProps<{
    variant?: 'default' | 'outline' | 'muted'
    size?: 'sm' | 'md'
    interactive?: boolean
    href?: string
    title?: string
    description?: string
    icon?: boolean
    image?: boolean
  }>(),
  { variant: 'default', size: 'md' },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="['oc-item', variant !== 'default' && `oc-item--${variant}`, size === 'sm' && 'oc-item--sm', interactive && 'oc-item--interactive']"
  >
    <div v-if="$slots.header" class="oc-item-header"><slot name="header" /></div>
    <div v-if="$slots.media" :class="['oc-item-media', icon && 'oc-item-media--icon', image && 'oc-item-media--image']"><slot name="media" /></div>
    <div class="oc-item-content">
      <slot>
        <p v-if="title" class="oc-item-title">{{ title }}</p>
        <p v-if="description" class="oc-item-description">{{ description }}</p>
      </slot>
    </div>
    <div v-if="$slots.actions" class="oc-item-actions"><slot name="actions" /></div>
    <div v-if="$slots.footer" class="oc-item-footer"><slot name="footer" /></div>
  </component>
</template>
