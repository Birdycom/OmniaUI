<!-- File: packages/vue/src/blocks/OcBlockProfileHeader.vue | Map: props -> banner -> bar (avatar slot, info, actions slot) -> tabs -->
<script setup lang="ts">
/**
 * Profile / channel header: banner, overhanging avatar, name, meta, bio, actions and link tabs.
 * Slots: avatar (initials or <img>), actions, bio, panel-0, panel-1 … (with panel slots the tabs switch on the page
 * itself: radios + panels, CSS only; without them the tabs are links). Classes: .oc-block-profile (--compact), -banner, -bar, -avatar,
 * -info, -name, -meta, -bio, -actions, -tabs, -tab (aria-current="page")
 */
import { computed, useSlots } from 'vue'
import { useUid } from '../composables/useUid'

export interface ProfileHeaderTab {
  label: string
  href?: string
  current?: boolean
}
const props = withDefaults(
  defineProps<{
    name: string
    meta?: string
    bio?: string
    initials?: string
    banner?: string
    tabs?: ProfileHeaderTab[]
    tabsLabel?: string
    compact?: boolean
    headingLevel?: 1 | 2
  }>(),
  { tabs: () => [], tabsLabel: 'Profile sections', headingLevel: 1 },
)
const nameId = useUid('oc-profile-name')
const slots = useSlots()
const panels = computed(() => props.tabs.some((_, i) => Boolean(slots[`panel-${i}`])))
const bannerStyle = computed(() => (props.banner ? `--oc-profile-banner: url("${props.banner}")` : undefined))
</script>

<template>
  <section :class="['oc-block-profile', compact && 'oc-block-profile--compact']" :aria-labelledby="nameId">
    <div class="oc-block-profile-banner" :style="bannerStyle" aria-hidden="true"></div>
    <div class="oc-block-profile-bar">
      <span class="oc-avatar oc-block-profile-avatar" aria-hidden="true"><slot name="avatar">{{ initials }}</slot></span>
      <div class="oc-block-profile-info">
        <component :is="headingLevel === 1 ? 'h1' : 'h2'" :id="nameId" class="oc-block-profile-name">{{ name }}</component>
        <p v-if="meta" class="oc-block-profile-meta">{{ meta }}</p>
        <p v-if="bio || $slots.bio" class="oc-block-profile-bio"><slot name="bio">{{ bio }}</slot></p>
      </div>
      <div v-if="$slots.actions" class="oc-block-profile-actions"><slot name="actions" /></div>
    </div>
    <template v-if="tabs.length && panels">
      <div class="oc-block-profile-tabs" role="radiogroup" :aria-label="tabsLabel">
        <label v-for="(tab, i) in tabs" :key="i" class="oc-block-profile-tab"><input type="radio" :name="`${nameId}-tab`" :checked="tab.current ?? i === 0">{{ tab.label }}</label>
      </div>
      <div class="oc-block-profile-panels">
        <div v-for="(tab, i) in tabs" :key="i" class="oc-block-profile-panel"><slot :name="`panel-${i}`" /></div>
      </div>
    </template>
    <nav v-else-if="tabs.length" class="oc-block-profile-tabs" :aria-label="tabsLabel">
      <a v-for="(tab, i) in tabs" :key="i" class="oc-block-profile-tab" :href="tab.href" :aria-current="tab.current ? 'page' : undefined">{{ tab.label }}</a>
    </nav>
  </section>
</template>
