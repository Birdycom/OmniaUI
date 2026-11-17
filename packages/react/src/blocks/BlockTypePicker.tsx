// File: packages/react/src/blocks/BlockTypePicker.tsx | Map: types -> BlockTypePicker (head -> tools: search + category chips -> radio cards -> empty -> foot)
import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { textOf } from "../utils";
import { Webicon } from "../components/Webicon";

export interface TypePickerOption {
  value: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Small real preview of the block (markup at a small size; it is hidden from screen readers). */
  preview?: ReactNode;
  /** Category value, matched by the category chips. */
  category?: string;
  disabled?: boolean;
}

export interface TypePickerCategory {
  value: string;
  label: ReactNode;
}

export interface BlockTypePickerProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "onChange" | "defaultValue"> {
  title?: ReactNode;
  text?: ReactNode;
  options: TypePickerOption[];
  /** Category chips; an "All" chip comes first (label: `allLabel`). Leave empty for no chips. */
  categories?: TypePickerCategory[];
  /** Picked value (controlled) or the first pick (uncontrolled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Show the search field (default true). */
  search?: boolean;
  searchLabel?: string;
  allLabel?: ReactNode;
  categoryLabel?: string;
  typeLabel?: string;
  emptyText?: ReactNode;
  /** Buttons at the bottom (Cancel / Add). */
  footer?: ReactNode;
  /** Name of the radio group (generated when empty). */
  name?: string;
}

const icon = (name: string) => <Webicon name={name} bare fallback="iconify" />;

/** `.oc-block-type-picker`: gallery of content types with a small preview each, picked like radios (click or arrow keys). */
export const BlockTypePicker = forwardRef<HTMLElement, BlockTypePickerProps>(function BlockTypePicker(
  {
    title = "Add a block", text, options, categories = [], value, defaultValue, onValueChange, search = true,
    searchLabel = "Search blocks", allLabel = "All", categoryLabel = "Category", typeLabel = "Block type",
    emptyText = "No block matches your search.", footer, name, className, ...rest
  },
  ref,
) {
  const auto = useId().replace(/[^\w-]/g, "");
  const group = name ?? `oc-picker-${auto}`;
  const titleId = `oc-picker-title-${auto}`;
  const [own, setOwn] = useState(defaultValue ?? options.find((o) => !o.disabled)?.value);
  const picked = value ?? own;
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const q = query.trim().toLowerCase();
  const shown = options.filter((o) => (cat === "all" || o.category === cat) && (!q || `${textOf(o.label)} ${textOf(o.hint)}`.toLowerCase().includes(q)));
  const pick = (v: string) => { setOwn(v); onValueChange?.(v); };
  return (
    <section ref={ref} className={cx("oc-block-type-picker", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-type-picker-head">
        <h2 className="oc-block-type-picker-title" id={titleId}>{title}</h2>
        {text != null && <p className="oc-block-type-picker-text">{text}</p>}
      </div>
      {(search || categories.length > 0) && (
        <div className="oc-block-type-picker-tools">
          {search && (
            <div className="oc-input-group oc-input-group--affix">
              <span className="oc-input-addon" aria-hidden="true">{icon("mdi:magnify")}</span>
              <input className="oc-input oc-block-type-picker-search" type="search" placeholder={searchLabel} aria-label={searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          )}
          {categories.length > 0 && (
            <fieldset className="oc-chip-filter oc-chip-filter--sm oc-block-type-picker-cats" aria-label={categoryLabel}>
              {[{ value: "all", label: allLabel }, ...categories].map((c) => (
                <label key={c.value} className="oc-chip-filter-item">
                  <input type="radio" name={`${group}-cat`} value={c.value} checked={cat === c.value} onChange={() => setCat(c.value)} /> {c.label}
                </label>
              ))}
            </fieldset>
          )}
        </div>
      )}
      <fieldset className="oc-block-type-picker-grid">
        <legend className="oc-visually-hidden">{typeLabel}</legend>
        {shown.map((o) => (
          <label key={o.value} className="oc-block-type-picker-item" data-category={o.category}>
            <input className="oc-block-type-picker-input" type="radio" name={group} value={o.value} disabled={o.disabled} checked={picked === o.value} onChange={() => pick(o.value)} />
            {o.preview != null && <span className="oc-block-type-picker-preview" aria-hidden="true">{o.preview}</span>}
            <span className="oc-block-type-picker-name">{o.label}</span>
            {o.hint != null && <span className="oc-block-type-picker-hint">{o.hint}</span>}
          </label>
        ))}
        {shown.length === 0 && <p className="oc-block-type-picker-empty">{emptyText}</p>}
      </fieldset>
      {footer != null && <div className="oc-block-type-picker-foot">{footer}</div>}
    </section>
  );
});
