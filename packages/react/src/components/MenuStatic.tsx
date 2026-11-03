// Same markup as packages/ui/snippets/menu-static.html. Items: <DropdownItem checked hint>, <DropdownLabel>, <DropdownSeparator>.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface MenuStaticProps extends HTMLAttributes<HTMLDivElement> {
  /** No border, radius or shadow: the window around it is the frame (a tray menu). */
  flat?: boolean;
}

/** The dropdown menu as a surface of its own, without a popover (`.oc-dropdown-menu--static`). */
export const MenuStatic = forwardRef<HTMLDivElement, MenuStaticProps>(function MenuStatic({ flat, className, ...rest }, ref) {
  return <div ref={ref} role="menu" className={cx("oc-dropdown-menu oc-dropdown-menu--static", flat && "oc-dropdown-menu--flat", className)} {...rest} />;
});
