import { createContext, forwardRef, useContext } from "react";
import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "../utils";

const GroupName = createContext<string | undefined>(undefined);

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** No outer border or radius (`oc-accordion--flush`): edge to edge with the parent, for inside a card or a panel. */
  flush?: boolean;
  /** Group name for all items: one open at a time (native exclusive details). Without it (and without a `name` on the
   *  items) several items can be open together. */
  name?: string;
}

/** `<div class="oc-accordion">` */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { flush, name, className, ...rest },
  ref,
) {
  return (
    <GroupName.Provider value={name}>
      <div ref={ref} className={cx("oc-accordion", flush && "oc-accordion--flush", className)} {...rest} />
    </GroupName.Provider>
  );
});

export interface AccordionItemProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  /** Trigger text (`summary.oc-accordion-trigger`). */
  title: ReactNode;
  /** Items with the same `name` open one at a time (native exclusive details). */
  name?: string;
  /** Script-controlled item: true or false renders `div.oc-accordion-item` with a `<button>` trigger and `.is-open` when
   *  true, for state in your own code (one open at a time, opened from elsewhere). Pair with `onExpandedChange`. */
  expanded?: boolean;
  /** Script-controlled item: called with the new state when the trigger is clicked. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Script-controlled item: a disabled trigger (muted, no click). */
  disabled?: boolean;
}

/** `<details class="oc-accordion-item" name>`; with `expanded`: `div.oc-accordion-item(.is-open)` + `button.oc-accordion-trigger`. */
export const AccordionItem = forwardRef<HTMLDetailsElement, AccordionItemProps>(function AccordionItem(
  { title, name, expanded, onExpandedChange, disabled, className, children, ...rest },
  ref,
) {
  const group = useContext(GroupName);
  if (expanded !== undefined) {
    const { open: _open, onToggle: _toggle, ...divRest } = rest;
    return (
      <div ref={ref as unknown as Ref<HTMLDivElement>} className={cx("oc-accordion-item", expanded && "is-open", className)} {...(divRest as HTMLAttributes<HTMLDivElement>)}>
        <button type="button" className="oc-accordion-trigger" disabled={disabled} aria-expanded={disabled ? undefined : expanded} onClick={() => onExpandedChange?.(!expanded)}>
          {title}
        </button>
        <div className="oc-accordion-content">{children}</div>
      </div>
    );
  }
  return (
    <details ref={ref} className={cx("oc-accordion-item", className)} name={name ?? group} {...(rest as object)}>
      <summary className="oc-accordion-trigger">{title}</summary>
      <div className="oc-accordion-content">{children}</div>
    </details>
  );
});
