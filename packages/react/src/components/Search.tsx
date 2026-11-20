// Same markup as packages/ui/snippets/search.html.
import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Key hint on the right (`.oc-search-hint`, e.g. "/"); hidden while the field has focus. */
  hint?: ReactNode;
  /** Class of the label wrapper (`className` goes to the input). */
  labelClassName?: string;
}

/** Search field (`label.oc-search` > icon + `input.oc-search-input[type=search]` + optional hint). */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search({ hint, labelClassName, className, placeholder, ...rest }, ref) {
  return (
    <label className={cx("oc-search", labelClassName)}>
      <svg className="oc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={ref} className={cx("oc-search-input", className)} type="search" placeholder={placeholder} aria-label={typeof placeholder === "string" ? placeholder : undefined} {...rest} />
      {hint != null && <kbd className="oc-search-hint">{hint}</kbd>}
    </label>
  );
});
