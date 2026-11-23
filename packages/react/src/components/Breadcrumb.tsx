// File: packages/react/src/components/Breadcrumb.tsx
// Map: item data -> context (separator, inside a list) -> Breadcrumb (items, maxItems collapse) -> compound parts (0.17.1):
//      BreadcrumbList, BreadcrumbItem, BreadcrumbLink (asChild), BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
// Same markup as packages/ui/snippets/breadcrumb.html. The ellipsis menu is a native popover (no script).
import { createContext, forwardRef, useContext, useId } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, OlHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { mergeIntoChild } from "../asChild";
import { Webicon, webiconNode } from "./Webicon";

export interface BreadcrumbItemData {
  label: ReactNode;
  /** Omit (or put last) to mark the current page. */
  href?: string;
  /** Shown before the label: a webicon name (`"mdi:home-outline"`, drawn as inline SVG), an `<Icon d=… />` or any node. */
  icon?: ReactNode;
}

type Separator = "slash" | "chevron";
const BreadcrumbContext = createContext<{ separator: Separator; inList: boolean }>({ separator: "slash", inList: false });

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemData[];
  /** `"slash"` (default) or `"chevron"` (›) between the items. */
  separator?: Separator;
  /**
   * 0.17.1: a longer trail folds its middle into a "…" button with a menu of the hidden levels. Keeps `itemsBefore`
   * levels at the start and `itemsAfter` at the end (the current page included).
   */
  maxItems?: number;
  /** Levels kept before the "…" (default 1). */
  itemsBefore?: number;
  /** Levels kept after the "…", the current page included (default 2). */
  itemsAfter?: number;
  /** Accessible name of the "…" button; `{count}` is the number of hidden levels. Default "Show {count} more levels". */
  ellipsisLabel?: string;
}

/** Which levels to show and which to fold: `[before, hidden, after]`, or null when the trail fits. */
export function collapseBreadcrumb<T>(items: T[], maxItems?: number, itemsBefore = 1, itemsAfter = 2): [T[], T[], T[]] | null {
  if (!maxItems || items.length <= maxItems || itemsBefore + itemsAfter >= items.length) return null;
  return [items.slice(0, itemsBefore), items.slice(itemsBefore, items.length - itemsAfter), items.slice(items.length - itemsAfter)];
}

/** `<nav class="oc-breadcrumb">` with links and a final `aria-current="page"` item; or the compound parts as children. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator = "slash", maxItems, itemsBefore = 1, itemsAfter = 2, ellipsisLabel, children, className, "aria-label": ariaLabel = "Breadcrumb", ...rest },
  ref,
) {
  const last = (items?.length ?? 0) - 1;
  const one = (item: BreadcrumbItemData, i: number) =>
    item.href && i < last ? (
      <a key={i} className="oc-breadcrumb-item" href={item.href}>{webiconNode(item.icon)}{item.label}</a>
    ) : (
      <span key={i} className="oc-breadcrumb-item" aria-current={i === last ? "page" : undefined}>{webiconNode(item.icon)}{item.label}</span>
    );
  const folded = items ? collapseBreadcrumb(items, maxItems, itemsBefore, itemsAfter) : null;
  return (
    <BreadcrumbContext.Provider value={{ separator, inList: false }}>
      <nav ref={ref} className={cx("oc-breadcrumb", separator === "chevron" && "oc-breadcrumb--chevron", className)} aria-label={ariaLabel} {...rest}>
        {folded ? (
          <>
            {folded[0].map((item, i) => one(item, i))}
            <span className="oc-breadcrumb-item"><BreadcrumbEllipsis items={folded[1]} label={ellipsisLabel} /></span>
            {folded[2].map((item, i) => one(item, last - folded[2].length + 1 + i))}
          </>
        ) : (
          items?.map(one)
        )}
        {children}
      </nav>
    </BreadcrumbContext.Provider>
  );
});

/** 0.17.1: `<ol>` of the compound breadcrumb; its items become `<li>`. Optional: items also work straight in Breadcrumb. */
export const BreadcrumbList = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(function BreadcrumbList({ children, className, ...rest }, ref) {
  const ctx = useContext(BreadcrumbContext);
  return (
    <BreadcrumbContext.Provider value={{ ...ctx, inList: true }}>
      <ol ref={ref} className={cx("oc-breadcrumb-list", className)} {...rest}>{children}</ol>
    </BreadcrumbContext.Provider>
  );
});

/** 0.17.1: one level (`.oc-breadcrumb-item`): `<li>` inside BreadcrumbList, else `<span>`. Holds a link, the page or the ellipsis. */
export const BreadcrumbItem = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function BreadcrumbItem({ className, ...rest }, ref) {
  const { inList } = useContext(BreadcrumbContext);
  const Tag = (inList ? "li" : "span") as "span";
  return <Tag ref={ref as never} className={cx("oc-breadcrumb-item", className)} {...rest} />;
});

export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** A webicon name before the label, or any node. */
  icon?: ReactNode;
  /** Render the only child (a router link) with these props instead of an `<a>`. */
  asChild?: boolean;
}

/** 0.17.1: a level you can go back to: `<a>` (or your router link with `asChild`). */
export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(function BreadcrumbLink({ icon, asChild, children, className, ...rest }, ref) {
  if (asChild) {
    const merged = mergeIntoChild(children, { ...rest, className: cx("oc-breadcrumb-link", className) }, ref);
    if (merged) return merged;
  }
  return <a ref={ref} className={cx("oc-breadcrumb-link", className)} {...rest}>{webiconNode(icon)}{children}</a>;
});

export interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
}

/** 0.17.1: the current page (`aria-current="page"`), not a link. */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(function BreadcrumbPage({ icon, children, className, ...rest }, ref) {
  return <span ref={ref} className={cx("oc-breadcrumb-page", className)} aria-current="page" {...rest}>{webiconNode(icon)}{children}</span>;
});

/** 0.17.1: an explicit separator (`.oc-breadcrumb-separator`), e.g. your own icon. Without it the items get "/" or › by CSS. */
export const BreadcrumbSeparator = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function BreadcrumbSeparator({ className, children, ...rest }, ref) {
  const { inList, separator } = useContext(BreadcrumbContext);
  const Tag = (inList ? "li" : "span") as "span";
  return (
    <Tag ref={ref as never} role="presentation" aria-hidden="true" className={cx("oc-breadcrumb-separator", className)} {...rest}>
      {children ?? (separator === "chevron" ? <Webicon name="mdi:chevron-right" bare fallback="iconify" /> : "/")}
    </Tag>
  );
});

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLElement> {
  /** The hidden levels: shown in a menu under the "…" button (a native popover). Without items it is only a "…" mark. */
  items?: BreadcrumbItemData[];
  /** Accessible name of the button; `{count}` is the number of hidden levels. Default "Show {count} more levels". */
  label?: string;
  /** Your own menu content (e.g. router links with `.oc-dropdown-item`) instead of `items`. */
  children?: ReactNode;
}

/** 0.17.1: the folded middle of a long trail: `.oc-breadcrumb-ellipsis` with a menu of the hidden levels. Put it in a BreadcrumbItem. */
export const BreadcrumbEllipsis = forwardRef<HTMLElement, BreadcrumbEllipsisProps>(function BreadcrumbEllipsis({ items, label, children, className, id, ...rest }, ref) {
  const auto = useId();
  const menuId = id ?? `oc-bc-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const count = items?.length ?? 0;
  const name = (label ?? (count ? "Show {count} more levels" : "More levels")).replace("{count}", String(count));
  if (!items && children == null) {
    return (
      <span ref={ref as never} className={cx("oc-breadcrumb-ellipsis", className)} role="img" aria-label={name} {...rest}>
        <Webicon name="mdi:dots-horizontal" bare fallback="iconify" />
      </span>
    );
  }
  return (
    <>
      <button ref={ref as never} type="button" className={cx("oc-breadcrumb-ellipsis", className)} popoverTarget={menuId} aria-label={name} {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        <Webicon name="mdi:dots-horizontal" bare fallback="iconify" />
      </button>
      <div className="oc-dropdown-menu" id={menuId} popover="auto" role="menu">
        {children ?? items?.map((item, i) => (
          <a key={i} className="oc-dropdown-item" role="menuitem" href={item.href}>{webiconNode(item.icon)}{item.label}</a>
        ))}
      </div>
    </>
  );
});
