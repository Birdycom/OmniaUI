import { forwardRef, useId } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Content of the trigger button. */
  trigger: ReactNode;
  /** Props for the trigger button (default variant `outline`). */
  triggerProps?: ButtonProps;
}

/**
 * Trigger button + `<div class="oc-dropdown-menu" popover>`, wired with `popovertarget`
 * (native popover and anchor positioning, no state needed).
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { trigger, triggerProps, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const menuId = id ?? `oc-menu-${auto.replace(/:/g, "")}`;
  return (
    <>
      <Button variant="outline" {...triggerProps} {...attrs({ popovertarget: menuId })}>{trigger}</Button>
      <div ref={ref} className={cx("oc-dropdown-menu", className)} id={menuId} {...attrs({ popover: "" })} {...rest}>
        {children}
      </div>
    </>
  );
});

/** `.oc-dropdown-label` */
export function DropdownLabel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-dropdown-label", className)} {...rest} />;
}

/** `.oc-dropdown-separator` */
export function DropdownSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-dropdown-separator", className)} {...rest} />;
}

type ItemProps = (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined });

/** `.oc-dropdown-item`: an anchor when `href` is set, otherwise a button. */
export function DropdownItem({ className, ...props }: ItemProps) {
  if (props.href !== undefined) {
    return <a className={cx("oc-dropdown-item", className)} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  }
  return <button type="button" className={cx("oc-dropdown-item", className)} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
