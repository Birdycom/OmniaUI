// File: packages/react/src/blockParts/SidebarBlockFrame.tsx | Map: data types -> menu item (link / sub list / collapsible) -> group (label / details) -> SidebarBlockFrame (aside + main bar + body)
// Shared markup of the sidebar page blocks (BlockSidebar01..05). Lives outside src/blocks so the index/manifest
// generator does not list it as a block.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon, webiconNode } from "../components/Webicon";
import type { BreadcrumbItemData } from "../components/Breadcrumb";

export interface SidebarBlockSubItem {
  label: ReactNode;
  href?: string;
  current?: boolean;
}

export interface SidebarBlockItem {
  label: ReactNode;
  href?: string;
  /** Webicon name ("mdi:cog-outline") or a node. */
  icon?: ReactNode;
  badge?: ReactNode;
  /** aria-current="page". */
  current?: boolean;
  /** Submenu: an always visible list (`.oc-sidebar-menu-sub`) or, with `submenu="collapsible"`, a details element. */
  items?: SidebarBlockSubItem[];
  /** Collapsible submenu opened on load. */
  open?: boolean;
}

export interface SidebarBlockGroup {
  label?: ReactNode;
  items: SidebarBlockItem[];
  /** Collapsible groups: opened on load (default true). */
  open?: boolean;
}

export interface SidebarBlockBrand {
  title: ReactNode;
  sub?: ReactNode;
  /** Webicon name or node in the tile (default mdi:layers-outline). */
  icon?: ReactNode;
  href?: string;
}

export interface SidebarBlockUser {
  name: ReactNode;
  email?: ReactNode;
  /** Avatar text (default: the initials of a string name). */
  initials?: ReactNode;
}

export interface SidebarBlockProps extends HTMLAttributes<HTMLDivElement> {
  brand?: SidebarBlockBrand | false;
  groups?: SidebarBlockGroup[];
  /** User row in the sidebar footer; false hides it. */
  user?: SidebarBlockUser | false;
  /** Extra footer content (replaces the user row). */
  footer?: ReactNode;
  /** Breadcrumb in the top bar of the main column; the first item may carry an icon. */
  breadcrumbs?: BreadcrumbItemData[];
  /** Group labels as details/summary that fold the group. */
  collapsibleGroups?: boolean;
  /** Submenus as visible lists ("list") or as details/summary ("collapsible"). */
  submenu?: "list" | "collapsible";
  /** Rounded, shadowed panel over a muted page (`--floating`). */
  floating?: boolean;
  /** aria-label of the aside. */
  navLabel?: string;
  /** Main column content; default the placeholder blocks of the snippet. */
  children?: ReactNode;
}

export const SIDEBAR_BRAND: SidebarBlockBrand = { title: "Documentation", sub: "v1.0.0", icon: "mdi:layers-outline", href: "#" };
export const SIDEBAR_USER: SidebarBlockUser = { name: "User 1", email: "user1@company1.example", initials: "U1" };
export const SIDEBAR_CRUMBS: BreadcrumbItemData[] = [{ label: "Building", href: "#", icon: "mdi:home-outline" }, { label: "Overview" }];

/** The groups of sidebar-01 and sidebar-04. */
export const SIDEBAR_BASE_GROUPS: SidebarBlockGroup[] = [
  {
    label: "Getting started",
    items: [
      { label: "Introduction", icon: "mdi:book-open-variant-outline", current: true },
      { label: "Installation", icon: "mdi:code-tags" },
      { label: "Configuration", icon: "mdi:cog-outline" },
    ],
  },
  {
    label: "Building",
    items: [
      { label: "Components", icon: "mdi:layers-outline", badge: "24" },
      { label: "Blocks", icon: "mdi:file-document-outline" },
      { label: "Charts", icon: "mdi:chart-bar" },
    ],
  },
];

const initialsOf = (name: ReactNode) =>
  typeof name === "string" ? name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() : null;

/** A webicon name becomes `svg.oc-sidebar-menu-icon`; any other node is drawn as it is. */
const menuIcon = (icon: ReactNode) =>
  typeof icon === "string" && icon.includes(":") ? <Webicon name={icon} className="oc-sidebar-menu-icon" bare fallback="iconify" /> : icon;

function ItemButton({ item }: { item: SidebarBlockItem }) {
  return (
    <>
      {menuIcon(item.icon)}
      <span className="oc-sidebar-menu-label">{item.label}</span>
      {item.badge != null && <span className="oc-sidebar-menu-badge">{item.badge}</span>}
    </>
  );
}

function SubList({ items }: { items: SidebarBlockSubItem[] }) {
  return (
    <ul className="oc-sidebar-menu-sub">
      {items.map((s, i) => (
        <li key={i}><a className="oc-sidebar-menu-button" href={s.href ?? "#"} aria-current={s.current ? "page" : undefined}>{s.label}</a></li>
      ))}
    </ul>
  );
}

function Menu({ items, submenu }: { items: SidebarBlockItem[]; submenu: "list" | "collapsible" }) {
  return (
    <ul className="oc-sidebar-menu">
      {items.map((item, i) =>
        item.items && submenu === "collapsible" ? (
          <li key={i}>
            <details className="oc-sidebar-collapsible" open={item.open}>
              <summary className="oc-sidebar-menu-button"><ItemButton item={item} /></summary>
              <SubList items={item.items} />
            </details>
          </li>
        ) : (
          <li key={i}>
            <a className="oc-sidebar-menu-button" href={item.href ?? "#"} aria-current={item.current ? "page" : undefined}><ItemButton item={item} /></a>
            {item.items && <SubList items={item.items} />}
          </li>
        ),
      )}
    </ul>
  );
}

/** @internal Shared markup of the sidebar page blocks. */
export const SidebarBlockFrame = forwardRef<HTMLDivElement, SidebarBlockProps & { defaults: Partial<SidebarBlockProps> }>(function SidebarBlockFrame(
  { defaults, ...props },
  ref,
) {
  const merged: SidebarBlockProps = { ...defaults };
  for (const [k, v] of Object.entries(props)) if (v !== undefined) (merged as Record<string, unknown>)[k] = v;
  const {
    brand = SIDEBAR_BRAND,
    groups = [],
    user = false,
    footer,
    breadcrumbs = SIDEBAR_CRUMBS,
    collapsibleGroups,
    submenu = "list",
    floating,
    navLabel = "Main navigation",
    className,
    children,
    ...rest
  } = merged;
  return (
    <div ref={ref} className={cx("oc-block-sb", floating && "oc-block-sb--floating", className)} {...rest}>
      <aside className={cx("oc-sidebar", floating && "oc-sidebar--floating")} aria-label={navLabel}>
        {brand && (
          <div className="oc-sidebar-header">
            <a className="oc-sidebar-menu-button oc-sidebar-menu-button--lg" href={brand.href ?? "#"}>
              <span className="oc-block-sb-tile">{webiconNode(brand.icon ?? "mdi:layers-outline")}</span>
              <span className="oc-sidebar-menu-label"><strong>{brand.title}</strong>{brand.sub != null && <span className="oc-block-sb-sub">{brand.sub}</span>}</span>
            </a>
          </div>
        )}
        <div className="oc-sidebar-content">
          {groups.map((g, i) =>
            collapsibleGroups ? (
              <details key={i} className="oc-block-sb-group" open={g.open ?? true}>
                <summary>{g.label}</summary>
                <Menu items={g.items} submenu={submenu} />
              </details>
            ) : (
              <div key={i} className="oc-sidebar-group">
                {g.label != null && <div className="oc-sidebar-group-label">{g.label}</div>}
                <Menu items={g.items} submenu={submenu} />
              </div>
            ),
          )}
        </div>
        {(footer != null || user) && (
          <div className="oc-sidebar-footer">
            {footer ?? (user && (
              <div className="oc-user">
                <span className="oc-avatar oc-avatar--sm">{user.initials ?? initialsOf(user.name)}</span>
                <span className="oc-user-text"><span className="oc-user-name">{user.name}</span>{user.email != null && <span className="oc-user-email">{user.email}</span>}</span>
              </div>
            ))}
          </div>
        )}
      </aside>
      <div className="oc-block-sb-main">
        <header className="oc-block-sb-bar">
          <span className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" aria-hidden="true">{webiconNode("mdi:dock-left")}</span>
          <span className="oc-block-sb-sep" />
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="oc-breadcrumb oc-breadcrumb--chevron">
                {breadcrumbs.map((c, i) =>
                  c.href && i < breadcrumbs.length - 1 ? (
                    <li key={i} className="oc-breadcrumb-item"><a href={c.href}>{c.icon != null && webiconNode(c.icon)}{c.label}</a></li>
                  ) : (
                    <li key={i} className="oc-breadcrumb-item" aria-current="page">{c.icon != null && webiconNode(c.icon)}{c.label}</li>
                  ),
                )}
              </ol>
            </nav>
          )}
        </header>
        <div className="oc-block-sb-body">
          {children ?? (
            <>
              <div className="oc-block-sb-ph" /><div className="oc-block-sb-ph" /><div className="oc-block-sb-ph" />
              <div className="oc-block-sb-ph oc-block-sb-ph--wide" />
            </>
          )}
        </div>
      </div>
    </div>
  );
});
