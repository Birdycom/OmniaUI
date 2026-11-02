// Same markup as packages/ui/snippets/spec-list.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface SpecGroup {
  title: ReactNode;
  icon?: ReactNode;
  rows: { label: ReactNode; value: ReactNode; note?: ReactNode }[];
}

export interface SpecListProps extends HTMLAttributes<HTMLDivElement> {
  groups: SpecGroup[];
  stack?: boolean;
}

/** Technical specifications in named groups (`.oc-spec-list`). */
export const SpecList = forwardRef<HTMLDivElement, SpecListProps>(function SpecList(
  { groups, stack, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-spec-list", stack && "oc-spec-list--stack", className)} {...rest}>
      {groups.map((group, g) => (
        <section key={g} className="oc-spec-group">
          <h3 className="oc-spec-group__title">{group.icon}{group.title}</h3>
          <dl className="oc-spec-group__rows">
            {group.rows.map((row, r) => (
              <div key={r} className="oc-spec-row"><dt>{row.label}</dt><dd>{row.value}{row.note != null && <small>{row.note}</small>}</dd></div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
});
