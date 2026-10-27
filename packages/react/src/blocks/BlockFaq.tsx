// File: packages/react/src/blocks/BlockFaq.tsx | Map: types -> BlockFaq (head -> accordion on details name -> more line)
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FaqItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface BlockFaqProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  items: FaqItem[];
  /** Index of the item that starts open (default 0, -1 = none). */
  openIndex?: number;
  /** Closing line, e.g. "Still have questions?" + a link. */
  more?: ReactNode;
  /** Head left, questions right. */
  split?: boolean;
  /** Name of the details group (one open at a time). Generated when empty. */
  name?: string;
}

/** `.oc-block-faq`: title + exclusive accordion on native <details name>. */
export const BlockFaq = forwardRef<HTMLElement, BlockFaqProps>(function BlockFaq(
  { eyebrow, title, lead, items, openIndex = 0, more, split = false, name, className, ...rest },
  ref,
) {
  const auto = useId().replace(/[^\w-]/g, "");
  const group = name ?? `oc-faq-${auto}`;
  const titleId = `oc-faq-title-${auto}`;
  return (
    <section ref={ref} className={cx("oc-block-faq", split && "oc-block-faq--split", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-faq-inner">
        <div className="oc-block-faq-head">
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <h2 className="oc-block-faq-title" id={titleId}>{title}</h2>
          {lead != null && <p className="oc-block-faq-lead">{lead}</p>}
        </div>
        <div className="oc-accordion oc-block-faq-list">
          {items.map((item, i) => (
            // "name" groups the items; React 19 passes it through, older versions too (unknown attribute on details).
            <details key={i} className="oc-accordion-item" {...{ name: group }} open={i === openIndex || undefined}>
              <summary className="oc-accordion-trigger">{item.question}</summary>
              <div className="oc-accordion-content">{item.answer}</div>
            </details>
          ))}
        </div>
        {more != null && <p className="oc-block-faq-more">{more}</p>}
      </div>
    </section>
  );
});
