// Same markup as packages/ui/snippets/search.html.
import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

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
      <Webicon name="mdi:magnify" bare className="oc-search-icon" />
      <input ref={ref} className={cx("oc-search-input", className)} type="search" placeholder={placeholder} aria-label={typeof placeholder === "string" ? placeholder : undefined} {...rest} />
      {hint != null && <kbd className="oc-search-hint">{hint}</kbd>}
    </label>
  );
});
