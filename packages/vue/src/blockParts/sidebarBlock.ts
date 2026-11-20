// File: packages/vue/src/blockParts/sidebarBlock.ts | Map: data types -> props -> snippet data (brand, user, breadcrumbs, groups of sidebar-01..05)
// Shared by the sidebar page blocks (OcBlockSidebar01..05). Lives outside src/blocks so the index generator does not list it.

export interface SidebarBlockSubItem {
  label: string
  href?: string
  current?: boolean
}

export interface SidebarBlockItem {
  label: string
  href?: string
  /** Webicon name ("mdi:cog-outline"). */
  icon?: string
  badge?: string | number
  /** aria-current="page". */
  current?: boolean
  /** Submenu: a visible list or, with submenu="collapsible", a details element. */
  items?: SidebarBlockSubItem[]
  /** Collapsible submenu opened on load. */
  open?: boolean
}

export interface SidebarBlockGroup {
  label?: string
  items: SidebarBlockItem[]
  /** Collapsible groups: opened on load (default true). */
  open?: boolean
}

export interface SidebarBlockBrand {
  title: string
  sub?: string
  /** Webicon name in the tile (default mdi:layers-outline). */
  icon?: string
  href?: string
}

export interface SidebarBlockUser {
  name: string
  email?: string
  /** Avatar text (default: the initials of the name). */
  initials?: string
}

export interface SidebarBlockCrumb {
  label: string
  href?: string
  /** Webicon name before the label. */
  icon?: string
}

export interface SidebarBlockProps {
  /** Brand row in the sidebar header; null hides it. */
  brand?: SidebarBlockBrand | null
  groups?: SidebarBlockGroup[]
  /** User row in the sidebar footer; null hides it. The `footer` slot replaces it. */
  user?: SidebarBlockUser | null
  /** Breadcrumb in the top bar of the main column. */
  breadcrumbs?: SidebarBlockCrumb[]
  /** Group labels as details/summary that fold the group. */
  collapsibleGroups?: boolean
  /** Submenus as visible lists ("list") or as details/summary ("collapsible"). */
  submenu?: 'list' | 'collapsible'
  /** Rounded, shadowed panel over a muted page (--floating). */
  floating?: boolean
  /** aria-label of the aside. */
  navLabel?: string
}

export const SIDEBAR_BRAND: SidebarBlockBrand = { title: 'Documentation', sub: 'v1.0.0', icon: 'mdi:layers-outline', href: '#' }
export const SIDEBAR_USER: SidebarBlockUser = { name: 'User 1', email: 'user1@company1.example', initials: 'U1' }
export const SIDEBAR_CRUMBS: SidebarBlockCrumb[] = [{ label: 'Building', href: '#', icon: 'mdi:home-outline' }, { label: 'Overview' }]

/** The groups of sidebar-01 and sidebar-04. */
export const SIDEBAR_BASE_GROUPS: SidebarBlockGroup[] = [
  {
    label: 'Getting started',
    items: [
      { label: 'Introduction', icon: 'mdi:book-open-variant-outline', current: true },
      { label: 'Installation', icon: 'mdi:code-tags' },
      { label: 'Configuration', icon: 'mdi:cog-outline' },
    ],
  },
  {
    label: 'Building',
    items: [
      { label: 'Components', icon: 'mdi:layers-outline', badge: '24' },
      { label: 'Blocks', icon: 'mdi:file-document-outline' },
      { label: 'Charts', icon: 'mdi:chart-bar' },
    ],
  },
]

/** sidebar-02: three folding groups, the last one closed. */
export const SIDEBAR_02_GROUPS: SidebarBlockGroup[] = [
  {
    label: 'Getting started',
    items: [
      { label: 'Introduction', icon: 'mdi:book-open-variant-outline', current: true },
      { label: 'Installation', icon: 'mdi:code-tags' },
    ],
  },
  {
    label: 'Building',
    items: [
      { label: 'Components', icon: 'mdi:layers-outline' },
      { label: 'Blocks', icon: 'mdi:file-document-outline' },
    ],
  },
  {
    label: 'Reference',
    open: false,
    items: [
      { label: 'Configuration', icon: 'mdi:cog-outline' },
      { label: 'Charts', icon: 'mdi:chart-bar' },
    ],
  },
]

/** sidebar-03: items with visible submenus. */
export const SIDEBAR_03_GROUPS: SidebarBlockGroup[] = [
  {
    label: 'Getting started',
    items: [
      { label: 'Introduction', icon: 'mdi:book-open-variant-outline', current: true, items: [{ label: 'Overview' }, { label: 'Quick start' }, { label: 'Tokens' }] },
      { label: 'Components', icon: 'mdi:layers-outline', items: [{ label: 'Buttons' }, { label: 'Forms' }, { label: 'Navigation' }] },
    ],
  },
]

/** sidebar-05: items that fold a submenu. */
export const SIDEBAR_05_GROUPS: SidebarBlockGroup[] = [
  {
    label: 'Platform',
    items: [
      { label: 'Dashboard', icon: 'mdi:home-outline', open: true, items: [{ label: 'Overview' }, { label: 'Analytics' }, { label: 'Reports' }] },
      { label: 'Projects', icon: 'mdi:folder-outline', items: [{ label: 'Active' }, { label: 'Archived' }] },
      { label: 'Team', icon: 'mdi:account-outline', items: [{ label: 'Members' }, { label: 'Roles' }, { label: 'Invitations' }] },
    ],
  },
]

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
