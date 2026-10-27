import { forwardRef } from "react";
import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

/** `<div class="oc-accordion">` */
export const Accordion = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Accordion(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("oc-accordion", className)} {...rest} />;
});

export interface AccordionItemProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  /** Trigger text (`summary.oc-accordion-trigger`). */
  title: ReactNode;
  /** Items with the same `name` open one at a time (native exclusive details). */
  name?: string;
}

/** `<details class="oc-accordion-item" name>` */
export const AccordionItem = forwardRef<HTMLDetailsElement, AccordionItemProps>(function AccordionItem(
  { title, className, children, ...rest },
  ref,
) {
  return (
    <details ref={ref} className={cx("oc-accordion-item", className)} {...(rest as object)}>
      <summary className="oc-accordion-trigger">{title}</summary>
      <div className="oc-accordion-content">{children}</div>
    </details>
  );
});
