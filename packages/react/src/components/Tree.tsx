// File: packages/react/src/components/Tree.tsx
// Map: Tree = box -> optional head row -> list -> TreeNode (folder = details/summary, leaf = div row) -> nested list
// Folders open and close natively (<details>), so there is no state here.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TreeItem {
  label: ReactNode;
  /** Leaf link target (renders the label as `a.oc-tree-label`). */
  href?: string;
  icon?: ReactNode;
  count?: ReactNode;
  actions?: ReactNode;
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
}

/** The row content: icon, label (link or text), count, actions. */
function RowContent({ item }: { item: TreeItem }) {
  const isLink = item.href !== undefined;
  return (
    <>
      {item.icon != null && <span className="oc-tree-icon" aria-hidden="true">{item.icon}</span>}
      {isLink ? (
        <a className="oc-tree-label" href={item.href} aria-current={item.current ? "true" : undefined}>{item.label}</a>
      ) : (
        <span className="oc-tree-label">{item.label}</span>
      )}
      {item.count != null && <span className="oc-tree-count">{item.count}</span>}
      {item.actions != null && <span className="oc-tree-actions">{item.actions}</span>}
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
  { items, head, headActions, quiet, flush, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-tree", quiet && "oc-tree--quiet", flush && "oc-tree--flush", className)} {...rest}>
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
