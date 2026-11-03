// Same markup as packages/ui/snippets/group.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface GroupProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Short status on the right ("2 busy"). */
  aside?: ReactNode;
  /** Color of the status. */
  asideTone?: "busy" | "ok" | "warn" | "error";
  /** Muted line under the title. */
  meta?: ReactNode;
  /** Heading level of the title (default 2). */
  headingLevel?: 2 | 3 | 4;
}

/** One section in a panel (`.oc-group`): title, status on the right, a muted line and the content. */
export const Group = forwardRef<HTMLElement, GroupProps>(function Group(
  { title, aside, asideTone, meta, headingLevel = 2, className, children, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as "h2";
  return (
    <section ref={ref} className={cx("oc-group", className)} {...rest}>
      <header className="oc-group__head">
        <H className="oc-group__title">{title}</H>
        {aside != null && <span className="oc-group__aside" data-tone={asideTone}>{aside}</span>}
      </header>
      {meta != null && <p className="oc-group__meta">{meta}</p>}
      {children}
    </section>
  );
});
