// File: packages/react/src/components/TableActions.tsx
// Map: TableActionIcon (square icon action) -> TableActionsMenu (three dots trigger + popover menu)
// The cell itself (`td.oc-table-actions`) is the existing `TableActions` in Table.tsx.
// This file only adds the new parts, so the export names do not collide with it.
import { forwardRef, useId } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export type TableActionTone = "default" | "primary" | "success" | "destructive";

type IconActionProps = {
  /** Accessible name; also used as the hover title. */
  label: string;
  tone?: TableActionTone;
  /** Show the label next to the icon; a narrow table (or a compact cell) shows the icon only. */
  showLabel?: boolean;
  children: ReactNode;
} & (
  | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & { href: string })
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { href?: undefined })
);

/** `.oc-table-actions-icon`: a link (with `href`) or a button showing only an icon. */
export function TableActionIcon({ label, tone = "default", showLabel, className, children: icon, ...props }: IconActionProps) {
  const children = showLabel ? <>{icon}<span className="oc-table-action-label">{label}</span></> : icon;
  const cls = cx("oc-table-actions-icon", tone !== "default" && `oc-table-actions-icon--${tone}`, className);
  // aria-label gives the name to screen readers; title shows it on hover.
  const common = { className: cls, "aria-label": label, title: label };
  if (props.href !== undefined) {
    return <a {...common} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
  }
  return <button type="button" {...common} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
}

export interface TableActionsMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the three dots trigger, e.g. "Actions for Ada". */
  label: string;
  /** Menu items: `<a class="oc-dropdown-item">`, `<button class="oc-dropdown-item">`, separators. */
  children: ReactNode;
}

/** `.oc-table-actions-more` trigger + `.oc-dropdown-menu[popover]`; the browser opens and closes it. */
export const TableActionsMenu = forwardRef<HTMLDivElement, TableActionsMenuProps>(function TableActionsMenu(
  { label, id, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const menuId = id ?? `oc-table-actions-menu-${auto.replace(/:/g, "")}`;
  return (
    <>
      <button className="oc-table-actions-more" type="button" aria-label={label} popoverTarget={menuId} />
      <div ref={ref} id={menuId} className={cx("oc-dropdown-menu", className)} {...attrs({ popover: "" })} {...rest}>
        {children}
      </div>
    </>
  );
});
