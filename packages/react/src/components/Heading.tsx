import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface HeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Heading element level (default 2). */
  level?: 1 | 2 | 3 | 4;
  /** `sm` = section heading. */
  size?: "md" | "sm";
  titleId?: string;
}

/** `<div class="oc-heading">` title + muted description. */
export const Heading = forwardRef<HTMLDivElement, HeadingProps>(function Heading(
  { title, description, level = 2, size = "md", titleId, className, ...rest },
  ref,
) {
  const Tag = `h${level}` as "h2";
  return (
    <div ref={ref} className={cx("oc-heading", size === "sm" && "oc-heading--sm", className)} {...rest}>
      <Tag className="oc-heading-title" id={titleId}>{title}</Tag>
      {description != null && <p className="oc-heading-description">{description}</p>}
    </div>
  );
});
