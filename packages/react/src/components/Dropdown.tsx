import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useId, useRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, MouseEvent, ReactElement, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { mergeIntoChild } from "../asChild";
import { useControllable } from "../hooks";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { webiconNode } from "./Webicon";

export interface DropdownTriggerArgs {
  /** Id of the menu: put it on your trigger as `popoverTarget` (already in `props`). */
  id: string;
  /** Props for your trigger element: `{ popoverTarget }` (popover mode) or `{ onClick, aria-expanded, aria-controls }`
   *  (toggle mode). Spread them on your trigger. */
  props: { popoverTarget?: string; onClick?: () => void; "aria-expanded"?: boolean; "aria-controls"?: string };
  /** Toggle mode: is the menu open now. */
  open?: boolean;
}

/** Closes the menu of a toggle-mode Dropdown (items call it after a click). */
const ToggleClose = createContext<(() => void) | null>(null);

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Content of the trigger button. */
  trigger?: ReactNode;
  /** Props for the trigger button (default variant `outline`). */
  triggerProps?: ButtonProps;
  /** Your own trigger instead of the outline button (an icon button, a breadcrumb ellipsis, an avatar):
   *  `renderTrigger={({ props }) => <button className="oc-breadcrumb-ellipsis" {...props}>…</button>}`. */
  renderTrigger?: (args: DropdownTriggerArgs) => ReactNode;
  /** `popover` (default): native popover in the top layer, no state. `toggle`: your own open state on a wrapper
   *  (`.oc-dropdown.is-open`), the menu stays in the page; it closes on an item click, an outside click and Esc. */
  mode?: "popover" | "toggle";
  /** Toggle mode: open state (controlled); with `onOpenChange`. */
  open?: boolean;
  /** Toggle mode: open on the first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Toggle mode: called with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Toggle mode: class of the `.oc-dropdown` wrapper (`className` goes to the menu). */
  wrapperClassName?: string;
  /** 0.18.0: merge the trigger props (`popoverTarget`, or the toggle props) into the `trigger` element itself (an icon
   *  button, an avatar button) instead of wrapping it in an outline Button. `trigger` must then be one element. */
  triggerAsChild?: boolean;
  /** 0.18.0: side of the trigger the menu opens on (`data-side`; default bottom, flips when there is no room). */
  side?: "top" | "right" | "bottom" | "left";
  /** 0.18.0: alignment along that side (`data-align`; default start). */
  align?: "start" | "center" | "end";
}

/**
 * Trigger button + `<div class="oc-dropdown-menu" popover>`, wired with `popoverTarget`
 * (native popover and anchor positioning, no state needed). `mode="toggle"`: `.oc-dropdown` + `.is-open` with state.
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { trigger, triggerProps, renderTrigger, mode = "popover", open, defaultOpen = false, onOpenChange, wrapperClassName, triggerAsChild, side, align, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const menuId = id ?? `oc-menu-${auto.replace(/:/g, "")}`;
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen, onOpenChange);
  const wrap = useRef<HTMLDivElement>(null);
  const toggle = mode === "toggle";
  useEffect(() => {
    if (!toggle || !isOpen) return;
    const outside = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", esc); };
  }, [toggle, isOpen, setOpen]);
  // side / align: data-side (default bottom once either is set) and data-align on the menu.
  const place = side || align ? { "data-side": side ?? "bottom", "data-align": align ?? "start" } : {};
  const asChildTrigger = (props: Record<string, unknown>) => (triggerAsChild ? mergeIntoChild(trigger, { ...triggerProps, ...props }) : null);
  if (toggle) {
    const props = { onClick: () => setOpen(!isOpen), "aria-expanded": isOpen, "aria-controls": menuId };
    return (
      <div ref={wrap} className={cx("oc-dropdown", isOpen && "is-open", wrapperClassName)}>
        {renderTrigger ? renderTrigger({ id: menuId, props, open: isOpen }) : asChildTrigger(props) ?? <Button variant="outline" {...triggerProps} {...props}>{trigger}</Button>}
        <ToggleClose.Provider value={() => setOpen(false)}>
          <div ref={ref} className={cx("oc-dropdown-menu", className)} id={menuId} {...place} {...rest}>
            {children}
          </div>
        </ToggleClose.Provider>
      </div>
    );
  }
  return (
    <>
      {renderTrigger ? renderTrigger({ id: menuId, props: { popoverTarget: menuId } }) : asChildTrigger({ popoverTarget: menuId }) ?? <Button variant="outline" {...triggerProps} popoverTarget={menuId}>{trigger}</Button>}
      <div ref={ref} className={cx("oc-dropdown-menu", className)} id={menuId} {...attrs({ popover: "" })} {...place} {...rest}>
        <ToggleClose.Provider value={null}>{children}</ToggleClose.Provider>
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
  /** Icon in front of the label: a webicon name ("mdi:pencil") or any node. Items without one line up with the others. */
  icon?: ReactNode;
  /** Keep the menu open after a click. Default: a check item stays open, every other item closes the menu. */
  keepOpen?: boolean;
  /** Muted second line under the label (may wrap): what the choice does. */
  description?: ReactNode;
  /** The icon in a soft tinted square of this color. */
  iconTone?: DropdownIconTone;
  /** A red item for a destructive action (`oc-dropdown-item--destructive`). */
  destructive?: boolean;
  /** With `checked`: a radio item (role menuitemradio) instead of a check item. */
  radio?: boolean;
  /** 0.18.0: render the only child (a router `<Link>`, your own `<a>`) as the item: it gets the item class, the icon,
   *  hint and check column around its own text, and a click closes the menu. */
  asChild?: boolean;
}

export type DropdownIconTone = "primary" | "success" | "warning" | "destructive" | "muted";
type ItemProps = ItemExtras & ((AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }));

/** Closes the popover menu around the clicked item (unless the click handler called preventDefault). */
export function closeMenu(event: MouseEvent<HTMLElement>) {
  if (event.defaultPrevented) return;
  // hidePopover is a no-op on a closed popover in current browsers; older ones throw, so ignore that.
  try { event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover?.(); } catch { /* already closed */ }
}

/** `.oc-dropdown-item`: an anchor when `href` is set, otherwise a button. A click closes the menu (`keepOpen` to stop that).
 *  `checked` makes a check item (`radio`: a radio item), `destructive` a red one. */
export function DropdownItem({ className, checked, hint, icon, keepOpen, description, iconTone, destructive, radio, asChild, children, ...props }: ItemProps) {
  const check = checked !== undefined;
  const closeToggle = useContext(ToggleClose);
  const userClick = props.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined;
  const onClick = (e: MouseEvent<HTMLElement>) => {
    userClick?.(e);
    if (keepOpen ?? check) return;
    if (closeToggle) { if (!e.defaultPrevented) closeToggle(); }
    else closeMenu(e);
  };
  const body = (label: ReactNode) => (
    <>
      {check && <span className="oc-dropdown-check" aria-hidden="true" />}
      {icon != null && <span className={cx("oc-dropdown-icon", iconTone && `oc-dropdown-icon--${iconTone}`)} aria-hidden="true">{webiconNode(icon)}</span>}
      {description != null ? <span className="oc-dropdown-text"><span>{label}</span><span className="oc-dropdown-desc">{description}</span></span> : label}
      {hint != null && <span className="oc-dropdown-hint">{hint}</span>}
    </>
  );
  const extra = check ? { role: radio ? "menuitemradio" : "menuitemcheckbox", "aria-checked": checked } : {};
  const cls = cx("oc-dropdown-item", destructive && "oc-dropdown-item--destructive", className);
  if (asChild) {
    const only = Children.toArray(children).filter(isValidElement);
    if (only.length === 1) {
      const child = only[0] as ReactElement<{ children?: ReactNode }>;
      const filled = cloneElement(child, undefined, body(child.props.children));
      const own: Record<string, unknown> = { ...(props as Record<string, unknown>) };
      delete own.href;
      const merged = mergeIntoChild(filled, { ...own, ...extra, className: cls, onClick });
      if (merged) return merged;
    }
  }
  const content = body(children);
  if (props.href !== undefined) {
    return <a className={cls} {...extra} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} onClick={onClick}>{content}</a>;
  }
  return <button type="button" className={cls} {...extra} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} onClick={onClick}>{content}</button>;
}

interface RadioContext { value: string | undefined; select: (value: string) => void }
const RadioGroupContext = createContext<RadioContext | null>(null);

export interface DropdownRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** The chosen value (controlled); with `onValueChange`. */
  value?: string;
  /** The chosen value on the first render (uncontrolled). */
  defaultValue?: string;
  /** Called with the value of the clicked `DropdownRadioItem`. */
  onValueChange?: (value: string) => void;
}

/** `.oc-dropdown-radio-group[role="group"]` around `DropdownRadioItem`s: one of them is checked (role menuitemradio). 0.17.2 */
export function DropdownRadioGroup({ value, defaultValue, onValueChange, className, children, ...rest }: DropdownRadioGroupProps) {
  const [current, setCurrent] = useControllable<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined);
  return (
    <div role="group" className={cx("oc-dropdown-radio-group", className)} {...rest}>
      <RadioGroupContext.Provider value={{ value: current, select: (v) => setCurrent(v) }}>{children}</RadioGroupContext.Provider>
    </div>
  );
}

export type DropdownRadioItemProps = Omit<ItemProps, "checked" | "radio"> & {
  /** The value this item stands for; checked when it matches the group's value. */
  value: string;
};

/** A radio item inside `DropdownRadioGroup` (a `DropdownItem radio` with `checked` from the group).
 *  Like every check item it keeps the menu open, unless `keepOpen={false}`. 0.17.2 */
export function DropdownRadioItem({ value, ...props }: DropdownRadioItemProps) {
  const group = useContext(RadioGroupContext);
  const userClick = props.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined;
  const onClick = (e: MouseEvent<HTMLElement>) => {
    userClick?.(e);
    if (!e.defaultPrevented) group?.select(value);
  };
  return <DropdownItem {...(props as ItemProps)} radio checked={group?.value === value} data-value={value} onClick={onClick as never} />;
}

export interface DropdownSubProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Text of the item that opens the sub-menu. */
  label: ReactNode;
  /** Icon in front of the label: a webicon name ("mdi:share-variant") or any node. */
  icon?: ReactNode;
  /** Props for the sub-menu panel (`.oc-dropdown-submenu`). */
  menuProps?: HTMLAttributes<HTMLDivElement>;
}

/** `.oc-dropdown-sub`: an item that opens a nested menu on hover and focus (children = the items of the sub-menu). */
export function DropdownSub({ label, icon, menuProps, className, children, ...rest }: DropdownSubProps) {
  return (
    <div className={cx("oc-dropdown-sub", className)} {...rest}>
      <button type="button" className="oc-dropdown-item" role="menuitem" aria-haspopup="menu">
        {icon != null && <span className="oc-dropdown-icon" aria-hidden="true">{webiconNode(icon)}</span>}
        {label}
      </button>
      <div role="menu" {...menuProps} className={cx("oc-dropdown-submenu", menuProps?.className)}>{children}</div>
    </div>
  );
}
