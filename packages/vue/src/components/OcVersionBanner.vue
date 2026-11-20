<!-- File: packages/vue/src/components/OcVersionBanner.vue | Map: chip (role=status) -> dot -> long text -> short text -> reload action -->
<script setup lang="ts">
/**
 * "New version available - reload" chip. Renders nothing while `version` is empty.
 * Without an @reload listener the action is a plain link to the current page (or to `href`); with one it is a button.
 * An empty `short` leaves the short text out (the long text then stays on narrow screens).
 * Slots: default (long text). Classes: .oc-version-banner(--info/--success/--floating), -dot, -text, -short, -action
 */
const props = withDefaults(
  defineProps<{
    version?: string | null
    short?: string
    actionLabel?: string
    tone?: 'warning' | 'info' | 'success'
    floating?: boolean
    /** Link for the action instead of the current page (ignored with @reload). */
    href?: string
    /** Declared as a prop so the component can see whether a listener is set. */
    onReload?: () => void
  }>(),
  { short: 'New version', actionLabel: 'Reload', tone: 'warning', version: null, href: '', onReload: undefined },
)
</script>

<template>
  <div
    v-if="version"
    :class="['oc-version-banner', tone !== 'warning' && `oc-version-banner--${tone}`, floating && 'oc-version-banner--floating']"
    role="status"
  >
    <span class="oc-version-banner-dot" aria-hidden="true"></span>
    <span class="oc-version-banner-text"><slot>New version ({{ version }}) available - reload the page</slot></span>
    <span v-if="short" class="oc-version-banner-short">{{ short }}</span>
    <button v-if="props.onReload" class="oc-version-banner-action" type="button" @click="props.onReload()">{{ actionLabel }}</button>
    <a v-else class="oc-version-banner-action" :href="href">{{ actionLabel }}</a>
  </div>
</template>
