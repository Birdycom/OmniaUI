import { createContext, forwardRef, useContext } from "react";
import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
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
}

/** `<details class="oc-accordion-item" name>` */
export const AccordionItem = forwardRef<HTMLDetailsElement, AccordionItemProps>(function AccordionItem(
  { title, name, className, children, ...rest },
  ref,
) {
  const group = useContext(GroupName);
  return (
    <details ref={ref} className={cx("oc-accordion-item", className)} name={name ?? group} {...(rest as object)}>
      <summary className="oc-accordion-trigger">{title}</summary>
      <div className="oc-accordion-content">{children}</div>
    </details>
  );
});
