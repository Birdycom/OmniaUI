// File: packages/react/src/components/Tree.tsx
// Map: Tree = box -> optional head row -> list -> TreeNode (folder = details/summary, leaf = div row) -> nested list
// Folders open and close natively (<details>), so there is no state here.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";
import { TableActionIcon } from "./TableActions";
import type { TableActionTone } from "./TableActions";

/** One icon action of a row (`button.oc-table-actions-icon`, or a link with `href`). */
export interface TreeAction {
  /** Accessible name and hover title, e.g. "Rename Quote v2.pdf". */
  label: string;
  /** Webicon name ("mdi:pencil-outline") or any node; `text` is shown when there is no icon. */
  icon?: ReactNode;
  text?: ReactNode;
  href?: string;
  tone?: TableActionTone;
  onClick?: () => void;
}

export interface TreeItem {
  label: ReactNode;
  /** Leaf link target (renders the label as `a.oc-tree-label`). */
  href?: string;
  /** Webicon name ("mdi:folder-outline", inline SVG) or any node. */
  icon?: ReactNode;
  count?: ReactNode;
  /** Any node, or a list of icon actions (`button.oc-table-actions-icon`). */
  actions?: ReactNode | TreeAction[];
  /** Child items: makes this item a folder. */
  children?: TreeItem[];
  /** Folder starts open. */
  open?: boolean;
  /** Current / selected item. */
  current?: boolean;
  muted?: boolean;
}

export interface TreeProps extends HTMLAttributes<HTMLDivElement> {
  items: TreeItem[];
  /** Sticky root row content (label), with optional `headActions`. */
  head?: ReactNode;
  headActions?: ReactNode;
  /** Actions only show on hover / focus. */
  quiet?: boolean;
  /** No card frame. */
  flush?: boolean;
  /** Long names end in an ellipsis (full name in the label's title) instead of scrolling sideways. */
  ellipsis?: boolean;
}

/** The row content: icon, label (link or text), count, actions. */
function RowContent({ item }: { item: TreeItem }) {
  const isLink = item.href !== undefined;
  return (
    <>
      {item.icon != null && <span className="oc-tree-icon" aria-hidden="true">{webiconNode(item.icon)}</span>}
      {isLink ? (
        <a className="oc-tree-label" href={item.href} title={labelTitle(item.label)} aria-current={item.current ? "true" : undefined}>{item.label}</a>
      ) : (
        <span className="oc-tree-label" title={labelTitle(item.label)}>{item.label}</span>
      )}
      {item.count != null && <span className="oc-tree-count">{item.count}</span>}
      {item.actions != null && <span className="oc-tree-actions">{isActionList(item.actions) ? <TreeActions actions={item.actions as TreeAction[]} /> : item.actions}</span>}
    </>
  );
}

/** The full name as a title, so a name cut off by .oc-tree--ellipsis (or the box edge) can still be read. */
function labelTitle(label: ReactNode): string | undefined {
  return typeof label === "string" || typeof label === "number" ? String(label) : undefined;
}

/** A TreeAction[] (plain objects with a label), not an array of React nodes. */
function isActionList(value: unknown): value is TreeAction[] {
  return Array.isArray(value) && value.length > 0 && value.every((a) => a != null && typeof a === "object" && !("$$typeof" in a) && typeof (a as TreeAction).label === "string");
}

/** A list of icon actions; a click does not toggle the folder (the button sits inside its summary). */
function TreeActions({ actions }: { actions: TreeAction[] }) {
  return (
    <>
      {actions.map((a, i) =>
        a.href !== undefined ? (
          <TableActionIcon key={i} label={a.label} tone={a.tone} href={a.href}>{a.icon != null ? webiconNode(a.icon) : a.text}</TableActionIcon>
        ) : (
          <TableActionIcon key={i} label={a.label} tone={a.tone} onClick={(e) => { e.preventDefault(); a.onClick?.(); }}>{a.icon != null ? webiconNode(a.icon) : a.text}</TableActionIcon>
        ),
      )}
    </>
  );
}

function TreeNode({ item }: { item: TreeItem }) {
  // aria-current on the row only when the label is not a link (a link carries it itself).
  const rowCurrent = item.current && item.href === undefined ? "true" : undefined;
  const rowCls = cx("oc-tree-row", item.muted && "is-muted");
  if (!item.children?.length) {
    return (
      <li>
        <div className={rowCls} aria-current={rowCurrent}><RowContent item={item} /></div>
      </li>
    );
  }
  return (
    <li>
      <details className="oc-tree-node" open={item.open}>
        <summary className={rowCls} aria-current={rowCurrent}><RowContent item={item} /></summary>
        <TreeList items={item.children} />
      </details>
    </li>
  );
}

function TreeList({ items }: { items: TreeItem[] }) {
  return (
    <ul className="oc-tree-list">
      {items.map((item, i) => <TreeNode item={item} key={i} />)}
    </ul>
  );
}

/** `.oc-tree`: nested tree list with a sticky action column. */
export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  { items, head, headActions, quiet, flush, ellipsis, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-tree", quiet && "oc-tree--quiet", flush && "oc-tree--flush", ellipsis && "oc-tree--ellipsis", className)} {...rest}>
      {head != null && (
        <div className="oc-tree-row oc-tree-head">
          <span className="oc-tree-label">{head}</span>
          {headActions != null && <span className="oc-tree-actions">{headActions}</span>}
        </div>
      )}
      <TreeList items={items} />
    </div>
  );
});
