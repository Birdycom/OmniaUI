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
 * Trigger button + `<div class="oc-dropdown-menu" popover>`, wired with `popoverTarget`
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
      <Button variant="outline" {...triggerProps} popoverTarget={menuId}>{trigger}</Button>
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

interface ItemExtras {
  /** A check column: true or false makes it a check item (role menuitemcheckbox, ✓ when true). */
  checked?: boolean;
  /** Muted text on the right ("Ctrl+Q", "2 h"). */
  hint?: ReactNode;
}
type ItemProps = ItemExtras & ((AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }));

/** `.oc-dropdown-item`: an anchor when `href` is set, otherwise a button. */
export function DropdownItem({ className, checked, hint, children, ...props }: ItemProps) {
  const check = checked !== undefined;
  const content = (
    <>
      {check && <span className="oc-dropdown-check" aria-hidden="true" />}
      {children}
      {hint != null && <span className="oc-dropdown-hint">{hint}</span>}
    </>
  );
  const extra = check ? { role: "menuitemcheckbox", "aria-checked": checked } : {};
  if (props.href !== undefined) {
    return <a className={cx("oc-dropdown-item", className)} {...extra} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>{content}</a>;
  }
  return <button type="button" className={cx("oc-dropdown-item", className)} {...extra} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>{content}</button>;
}
