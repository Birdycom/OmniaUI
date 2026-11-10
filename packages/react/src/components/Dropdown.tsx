import { forwardRef, useId } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from "react";
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
  /** Keep the menu open after a click. Default: a check item stays open, every other item closes the menu. */
  keepOpen?: boolean;
}
type ItemProps = ItemExtras & ((AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }));

/** Closes the popover menu around the clicked item (unless the click handler called preventDefault). */
export function closeMenu(event: MouseEvent<HTMLElement>) {
  if (event.defaultPrevented) return;
  // hidePopover is a no-op on a closed popover in current browsers; older ones throw, so ignore that.
  try { event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover?.(); } catch { /* already closed */ }
}

/** `.oc-dropdown-item`: an anchor when `href` is set, otherwise a button. A click closes the menu (`keepOpen` to stop that). */
export function DropdownItem({ className, checked, hint, keepOpen, children, ...props }: ItemProps) {
  const check = checked !== undefined;
  const userClick = props.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined;
  const onClick = (e: MouseEvent<HTMLElement>) => {
    userClick?.(e);
    if (!(keepOpen ?? check)) closeMenu(e);
  };
  const content = (
    <>
      {check && <span className="oc-dropdown-check" aria-hidden="true" />}
      {children}
      {hint != null && <span className="oc-dropdown-hint">{hint}</span>}
    </>
  );
  const extra = check ? { role: "menuitemcheckbox", "aria-checked": checked } : {};
  if (props.href !== undefined) {
    return <a className={cx("oc-dropdown-item", className)} {...extra} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} onClick={onClick}>{content}</a>;
  }
  return <button type="button" className={cx("oc-dropdown-item", className)} {...extra} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} onClick={onClick}>{content}</button>;
}
