// File: packages/vue/src/badgeStatus.ts
// Map: the ready-made statuses of <OcBadge status="…"> (0.17.1): label, webicon and tone per status.
// Same list as packages/react/src/components/Badge.tsx and the Blade badge; the colour comes from the CSS (data-status).

export type BadgeStatus =
  | 'paid' | 'pending' | 'overdue' | 'draft' | 'sent' | 'cancelled' | 'approved' | 'rejected' | 'active' | 'inactive'
  | 'archived' | 'failed' | 'refunded' | 'scheduled' | 'in-progress' | 'done' | 'read-only'
  | 'working' | 'waiting' | 'error' | 'idle'

export type BadgeStatusTone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral'

export const badgeStatuses: Record<BadgeStatus, { label: string; icon: string; tone: BadgeStatusTone }> = {
  paid: { label: 'Paid', icon: 'mdi:check-circle-outline', tone: 'success' },
  pending: { label: 'Pending', icon: 'mdi:clock-outline', tone: 'warning' },
  overdue: { label: 'Overdue', icon: 'mdi:alert-circle-outline', tone: 'destructive' },
  draft: { label: 'Draft', icon: 'mdi:pencil-outline', tone: 'neutral' },
  sent: { label: 'Sent', icon: 'mdi:send-outline', tone: 'info' },
  cancelled: { label: 'Cancelled', icon: 'mdi:cancel', tone: 'neutral' },
  approved: { label: 'Approved', icon: 'mdi:check-decagram-outline', tone: 'success' },
  rejected: { label: 'Rejected', icon: 'mdi:close-circle-outline', tone: 'destructive' },
  active: { label: 'Active', icon: 'mdi:circle-medium', tone: 'success' },
  inactive: { label: 'Inactive', icon: 'mdi:circle-off-outline', tone: 'neutral' },
  archived: { label: 'Archived', icon: 'mdi:archive-outline', tone: 'neutral' },
  failed: { label: 'Failed', icon: 'mdi:alert-octagon-outline', tone: 'destructive' },
  refunded: { label: 'Refunded', icon: 'mdi:cash-refund', tone: 'info' },
  scheduled: { label: 'Scheduled', icon: 'mdi:calendar-clock-outline', tone: 'info' },
  'in-progress': { label: 'In progress', icon: 'mdi:progress-clock', tone: 'info' },
  done: { label: 'Done', icon: 'mdi:check', tone: 'success' },
  'read-only': { label: 'Read-only', icon: 'mdi:lock-outline', tone: 'neutral' },
  working: { label: 'Working', icon: 'mdi:progress-clock', tone: 'info' },
  waiting: { label: 'Waiting', icon: 'mdi:timer-sand', tone: 'warning' },
  error: { label: 'Error', icon: 'mdi:alert-circle-outline', tone: 'destructive' },
  idle: { label: 'Idle', icon: 'mdi:sleep', tone: 'neutral' },
}
