import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface DefinitionItem {
  term: ReactNode;
  detail: ReactNode;
}

export interface DefinitionListProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  items: DefinitionItem[];
  /** Optional footer (actions). */
  footer?: ReactNode;
}

/** `<div class="oc-dl-panel" role="region">` with a `dl` of label / value rows. */
export const DefinitionList = forwardRef<HTMLDivElement, DefinitionListProps>(function DefinitionList(
  { title, description, items, footer, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-dl-panel", className)} role="region" {...rest}>
      {title != null && <h3 className="oc-dl-title">{title}</h3>}
      {description != null && <p className="oc-dl-description">{description}</p>}
      <dl className="oc-dl">
        {items.map((item, i) => (
          <div className="oc-dl-row" key={i}>
            <dt className="oc-dl-term">{item.term}</dt>
            <dd className="oc-dl-detail">{item.detail}</dd>
          </div>
        ))}
      </dl>
      {footer != null && <div className="oc-dl-footer">{footer}</div>}
    </div>
  );
});
