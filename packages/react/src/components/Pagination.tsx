import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page (1-based). */
  page: number;
  pageCount: number;
  /** Called with the new page; when set, link navigation is prevented. */
  onPageChange?: (page: number) => void;
  /** Builds the href of a page (default `?page=n`). */
  hrefFor?: (page: number) => string;
}

/** `<nav class="oc-pagination">` with numbered links and `aria-current="page"`. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, hrefFor = (n) => `?page=${n}`, className, "aria-label": ariaLabel = "Pagination", ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx("oc-pagination", className)} aria-label={ariaLabel} {...rest}>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <a
          key={n}
          className="oc-pagination-item"
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          onClick={
            onPageChange
              ? (e) => {
                  e.preventDefault();
                  onPageChange(n);
                }
              : undefined
          }
        >
          {n}
        </a>
      ))}
    </nav>
  );
});
