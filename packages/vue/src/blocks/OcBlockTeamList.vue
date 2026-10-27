<script setup lang="ts">
/**
 * Member rows with avatar, role badge and a row action menu (popover). Emits `action` ({ member, action }).
 * Slot `meta` (scoped: { member }) adds extra badges. Classes: .oc-block-team, -row, -meta, .oc-user, .oc-dropdown-menu
 */
import { useUid } from '../composables/useUid'

export interface TeamAction {
  label: string
  href?: string
  /** Draw a separator line before this action */
  separator?: boolean
}
export interface TeamMember {
  name: string
  email?: string
  initials?: string
  role?: string
  roleVariant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'
  actions?: TeamAction[]
}
defineProps<{ members: TeamMember[]; actionsLabel?: string }>()
defineEmits<{ action: [payload: { member: TeamMember; action: TeamAction }] }>()
const base = useUid('oc-team-menu')
</script>

<template>
  <div class="oc-block-team">
    <div v-for="(member, i) in members" :key="member.email ?? member.name" class="oc-block-team-row">
      <div class="oc-user">
        <span class="oc-avatar">{{ member.initials }}</span>
        <span class="oc-user-text">
          <span class="oc-user-name">{{ member.name }}</span>
          <span v-if="member.email" class="oc-user-email">{{ member.email }}</span>
        </span>
      </div>
      <div class="oc-block-team-meta">
        <span v-if="member.role" :class="['oc-badge', member.roleVariant && member.roleVariant !== 'default' && `oc-badge--${member.roleVariant}`]">{{ member.role }}</span>
        <slot name="meta" :member="member" />
        <template v-if="member.actions?.length">
          <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" :popovertarget="`${base}-${i}`" :aria-label="actionsLabel ?? 'Member actions'">&hellip;</button>
          <div :id="`${base}-${i}`" class="oc-dropdown-menu" popover>
            <template v-for="action in member.actions" :key="action.label">
              <div v-if="action.separator" class="oc-dropdown-separator"></div>
              <a v-if="action.href" class="oc-dropdown-item" :href="action.href" @click="$emit('action', { member, action })">{{ action.label }}</a>
              <button v-else class="oc-dropdown-item" type="button" @click="$emit('action', { member, action })">{{ action.label }}</button>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
