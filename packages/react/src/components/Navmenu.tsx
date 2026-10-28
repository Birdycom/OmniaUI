import { forwardRef, useId } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface NavmenuProps extends HTMLAttributes<HTMLUListElement> {
  /** `aria-label` of the wrapping <nav>. */
  label?: string;
  /** Class for the wrapping <nav> (e.g. `oc-block-appbar-nav`). */
  navClassName?: string;
}

/** `<nav><ul class="oc-navmenu">`: horizontal navigation links. */
export const Navmenu = forwardRef<HTMLUListElement, NavmenuProps>(function Navmenu(
  { label = "Navigation", navClassName, className, ...rest },
  ref,
) {
  return (
    <nav aria-label={label} className={navClassName}>
      <ul ref={ref} className={cx("oc-navmenu", className)} {...rest} />
    </nav>
  );
});

/** `<li>` of a Navmenu. */
export function NavmenuItem(props: LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props} />;
}

export interface NavmenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Current page (`aria-current="page"`). */
  current?: boolean;
}

/** `<a class="oc-navmenu-link">` */
export const NavmenuLink = forwardRef<HTMLAnchorElement, NavmenuLinkProps>(function NavmenuLink(
  { current, className, ...rest },
  ref,
) {
  return <a ref={ref} className={cx("oc-navmenu-link", className)} aria-current={current ? "page" : undefined} {...rest} />;
});

export interface NavmenuDropdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Trigger text (button with a chevron). */
  label: ReactNode;
}

/** `<li>` with a caret trigger button and a `.oc-dropdown-menu[popover]` of children. */
export const NavmenuDropdown = forwardRef<HTMLDivElement, NavmenuDropdownProps>(function NavmenuDropdown(
  { label, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const menuId = id ?? `oc-navmenu-${auto.replace(/:/g, "")}`;
  return (
    <li>
      <button className="oc-navmenu-link oc-navmenu-link--caret" type="button" popoverTarget={menuId}>{label}</button>
      <div ref={ref} className={cx("oc-dropdown-menu", className)} id={menuId} {...attrs({ popover: "" })} {...rest}>
        {children}
      </div>
    </li>
  );
});
