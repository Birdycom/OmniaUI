// File: packages/react/src/components/Combobox.tsx
// Map: types -> icon helpers -> Combobox (state: text, open, active, picked) -> rows (clear, options, custom) -> server search
//      (debounce) -> portal position -> keyboard -> markup (.oc-combobox, optional icons, catalog extras)
// Same markup as packages/ui/snippets/combobox.html: an input with a listbox. Typing filters, the arrow keys move the
// active option, Enter or a click chooses, Escape closes. With icons: an icon in front of every option and in front of the
// chosen value in the field; options without an icon line up with the others (CSS).
// Catalog mode (0.17.0, all optional): numeric values (valueType), server search (onSearch + searchDelay + loading +
// selected), a clear row (clearLabel), a manage link in a footer (manageHref / onManage), a "use what I typed" row
// (allowCustomFromSearch), a list in document.body (portal) and options with a description, an image or an emoji.
"use client";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, InputHTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { webiconNode } from "./Webicon";

export type ComboboxValue = string | number;

export interface ComboboxOption {
  value: ComboboxValue;
  label: string;
  /** Icon in front of the label: a webicon name ("mdi:github", "flag:nl-4x3") or any node (an <svg>, an <img>). */
  icon?: ReactNode;
  /** Muted second line under the label (`.oc-combobox-option-description`). */
  description?: ReactNode;
  /** Image URL in front of the label (`.oc-combobox-option-image`, decorative). */
  image?: string;
  /** Emoji in front of the label (`.oc-combobox-option-emoji`). */
  emoji?: string;
  disabled?: boolean;
}

interface ComboboxBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  options: ComboboxOption[];
  /** Accessible name of the field and the list (default "Choose"). */
  label?: string;
  /** Icon in the field while nothing is chosen (only drawn when the options have icons or this is set). */
  icon?: ReactNode;
  /** Text when nothing matches (default "No results"). */
  emptyText?: ReactNode;
  /** Class for the wrapper (`className` goes to the input). */
  wrapperClassName?: string;
  /** Server search: called (debounced) with what is typed; the list is not filtered locally, pass the results as `options`. */
  onSearch?: (query: string) => void;
  /** Delay before onSearch in ms (default 250). */
  searchDelay?: number;
  /** Results are on their way: a loading row and aria-busy on the list. */
  loading?: boolean;
  /** Text of the loading row (default "Loading..."). */
  loadingText?: ReactNode;
  /** The chosen option when it is not in `options` (server search): gives the field its label and icon. */
  selected?: ComboboxOption | null;
  /** A first row that clears the choice (`.oc-combobox-clear`), with this text. */
  clearLabel?: string;
  /** A manage link in a footer under the list (`.oc-combobox-footer`). */
  manageHref?: string;
  /** Text of the manage link (default "Manage"). */
  manageLabel?: ReactNode;
  /** Called when the manage link is used (with or without manageHref). */
  onManage?: () => void;
  /** Offer what was typed as a choice when no option matches exactly (`.oc-combobox-custom`). */
  allowCustomFromSearch?: boolean;
  /** Text of that row; {query} is replaced (default 'Use "{query}"'). */
  customLabel?: string;
  /** Called with the typed text when the custom row is chosen (in string mode onChange gets it too). */
  onCustom?: (query: string) => void;
  /** Render the list in document.body (fixed under the field) so a scrolling or clipping parent cannot cut it off. */
  portal?: boolean;
  /** Compact bookkeeping look (`oc-combobox--ledger`). */
  variant?: "ledger";
  /** Module colour name: sets `data-module`. */
  module?: string;
}

/** String values (the default): onChange gives strings; the clear row gives "". */
export interface ComboboxStringProps extends ComboboxBaseProps {
  valueType?: "string";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/**
 * Numeric values (catalog ids): onChange gives numbers, the clear row gives null. The custom row only calls onCustom
 * (create the record, then set its id). The hidden input and data-value stay strings.
 */
export interface ComboboxNumberProps extends ComboboxBaseProps {
  valueType: "number";
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
}

export type ComboboxProps = ComboboxStringProps | ComboboxNumberProps;

/** A webicon name becomes an inline SVG (<Webicon>; <iconify-icon> for a name only the Iconify runtime knows); anything else is drawn as it is. */
export function renderIcon(icon: ReactNode): ReactNode {
  return webiconNode(icon);
}

/** The visual of an option or of the field: icon, else image, else emoji. */
function optionVisual(o: ComboboxOption | undefined, inField = false): ReactNode {
  if (!o) return null;
  if (o.icon != null) return inField ? renderIcon(o.icon) : <span className="oc-combobox-option-icon" aria-hidden="true">{renderIcon(o.icon)}</span>;
  if (o.image) return <img className="oc-combobox-option-image" src={o.image} alt="" />;
  if (o.emoji) return <span className="oc-combobox-option-emoji" aria-hidden="true">{o.emoji}</span>;
  return null;
}
const hasVisual = (o?: ComboboxOption | null) => !!o && (o.icon != null || !!o.image || !!o.emoji);

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const same = (a: ComboboxValue | null | undefined, b: ComboboxValue | null | undefined) => a != null && b != null && String(a) === String(b);
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Row = { key: string; kind: "clear" | "option" | "custom"; option?: ComboboxOption; disabled?: boolean };

/** `.oc-combobox`: a field with a filtered list of options, optionally with an icon per option. */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options, value, defaultValue, onChange, valueType = "string", label = "Choose", icon, emptyText = "No results", wrapperClassName,
    onSearch, searchDelay = 250, loading, loadingText = "Loading...", selected, clearLabel, manageHref, manageLabel = "Manage", onManage,
    allowCustomFromSearch, customLabel = 'Use "{query}"', onCustom, portal, variant, module,
    className, name, placeholder, id, ...rest
  },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const listId = `oc-combobox-${auto}`;
  const [current, setCurrent] = useControllable<ComboboxValue | null>(
    value,
    defaultValue ?? (valueType === "number" ? null : ""),
    onChange as ((v: ComboboxValue | null) => void) | undefined,
  );
  // The last option chosen from a server result, so its label stays when the results change.
  const [picked, setPicked] = useState<ComboboxOption | null>(null);
  const chosen = options.find((o) => same(o.value, current))
    ?? (selected && same(selected.value, current) ? selected : undefined)
    ?? (picked && same(picked.value, current) ? picked : undefined);
  const [text, setText] = useState<string | null>(null); // null = not typing: the field shows the chosen label
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const remote = onSearch != null;
  const query = (text ?? "").trim();

  const shown = useMemo(
    () => (text && !remote ? options.filter((o) => fold(o.label).includes(fold(text).trim())) : options),
    [options, text, remote],
  );
  const showCustom = !!allowCustomFromSearch && query !== "" && !options.some((o) => fold(o.label) === fold(query));
  const rows: Row[] = [
    ...(clearLabel ? [{ key: "clear", kind: "clear" as const }] : []),
    ...shown.map((o) => ({ key: `o:${String(o.value)}`, kind: "option" as const, option: o, disabled: o.disabled })),
    ...(showCustom ? [{ key: "custom", kind: "custom" as const }] : []),
  ];
  const enabled = rows.filter((r) => !r.disabled);
  const withIcons = icon != null || options.some(hasVisual) || hasVisual(selected) || hasVisual(chosen);
  const rowId = (r: Row) => (r.kind === "option" ? `${listId}-${options.findIndex((o) => same(o.value, r.option!.value))}` : `${listId}-${r.kind}`);
  const activeRow = rows.find((r) => r.key === active);

  // Server search: debounced call with what is typed.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const search = (q: string) => {
    if (!onSearch) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(q), searchDelay);
  };

  // Portal: the list is fixed under the field and follows scrolling and resizing while open.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [place, setPlace] = useState<CSSProperties>({});
  useEffect(() => setMounted(true), []);
  const measure = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setPlace({ position: "fixed", top: r.bottom + 4, left: r.left, width: r.width });
  }, []);
  useIsoLayoutEffect(() => {
    if (!portal || !open) return;
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [portal, open, measure]);

  const close = () => { setOpen(false); setText(null); setActive(null); };
  const emit = (v: ComboboxValue | null) => setCurrent(v);
  const choose = (r?: Row) => {
    if (!r || r.disabled) return;
    if (r.kind === "clear") { setPicked(null); emit(valueType === "number" ? null : ""); }
    else if (r.kind === "custom") {
      const q = query;
      if (valueType !== "number") { setPicked({ value: q, label: q }); emit(q); }
      onCustom?.(q);
    }
    else {
      const o = r.option!;
      setPicked(o);
      emit(valueType === "number" ? Number(o.value) : String(o.value));
    }
    close();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    rest.onKeyDown?.(e);
    const at = enabled.findIndex((r) => r.key === active);
    const move = (i: number) => { e.preventDefault(); setOpen(true); setActive(enabled[(i + enabled.length) % enabled.length]?.key ?? null); };
    if (e.key === "ArrowDown") move(open ? at + 1 : Math.max(at, 0));
    else if (e.key === "ArrowUp") move(at <= 0 ? enabled.length - 1 : at - 1);
    else if (e.key === "Home" && open) move(0);
    else if (e.key === "End" && open) move(enabled.length - 1);
    else if (e.key === "Enter" && open && at >= 0) { e.preventDefault(); choose(enabled[at]); }
    else if (e.key === "Escape" && open) { e.preventDefault(); close(); }
  };
  const onType = (next: string) => {
    setText(next);
    setOpen(true);
    if (remote) { search(next); setActive(null); return; }
    const first = options.find((o) => !o.disabled && fold(o.label).includes(fold(next).trim()));
    setActive(first ? `o:${String(first.value)}` : null);
  };

  const footer = manageHref != null || onManage != null;
  const optionRows = rows.map((r) => {
    const common = {
      key: r.key,
      id: rowId(r),
      role: "option",
      tabIndex: -1,
      "data-active": r.key === active ? "" : undefined,
      onClick: () => choose(r),
    } as const;
    if (r.kind === "clear") return <li {...common} className="oc-combobox-option oc-combobox-clear" aria-selected={false}>{clearLabel}</li>;
    if (r.kind === "custom") return <li {...common} className="oc-combobox-option oc-combobox-custom" aria-selected={false}>{customLabel.replace("{query}", query)}</li>;
    const o = r.option!;
    return (
      <li {...common} className="oc-combobox-option" aria-selected={same(o.value, current)} aria-disabled={o.disabled || undefined} data-value={String(o.value)}>
        {optionVisual(o)}
        {o.description != null ? (
          <span className="oc-combobox-option-text">
            <span className="oc-combobox-option-label">{o.label}</span>
            <span className="oc-combobox-option-description">{o.description}</span>
          </span>
        ) : o.label}
      </li>
    );
  });
  const status = loading
    ? <li className="oc-combobox-loading" role="presentation">{loadingText}</li>
    : shown.length === 0 && !showCustom && <li className="oc-combobox-empty" role="presentation">{emptyText}</li>;

  const listbox = (
    <ul
      className={footer ? "oc-combobox-options" : cx("oc-combobox-list", portal && "oc-combobox-list--portal")}
      id={listId}
      role="listbox"
      aria-label={label}
      aria-busy={loading || undefined}
      {...(!footer ? { onMouseDown: (e: ReactMouseEvent) => e.preventDefault(), style: portal ? place : undefined, "data-open": portal ? (open ? "" : "false") : undefined, "data-module": portal ? module : undefined } : {})}
    >
      {optionRows}
      {status}
    </ul>
  );
  const list = footer ? (
    <div
      className={cx("oc-combobox-list oc-combobox-list--panel", portal && "oc-combobox-list--portal")}
      onMouseDown={(e) => { if (!(e.target as Element).closest?.("a, button")) e.preventDefault(); }}
      style={portal ? place : undefined}
      data-open={portal ? (open ? "" : "false") : undefined}
      data-module={portal ? module : undefined}
    >
      {listbox}
      <div className="oc-combobox-footer">
        <a
          href={manageHref ?? "#"}
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { if (!manageHref) e.preventDefault(); onManage?.(); close(); }}
        >
          {manageLabel}
        </a>
      </div>
    </div>
  ) : listbox;

  return (
    <div
      ref={wrapRef}
      className={cx("oc-combobox", variant === "ledger" && "oc-combobox--ledger", wrapperClassName)}
      data-open={open ? "" : "false"}
      data-module={module}
    >
      {withIcons && <span className="oc-combobox-icon" aria-hidden="true">{chosen && hasVisual(chosen) ? optionVisual(chosen, true) : renderIcon(icon)}</span>}
      <input
        ref={ref}
        id={id}
        className={cx("oc-input oc-combobox-input", variant === "ledger" && "oc-input--ledger", className)}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && activeRow ? rowId(activeRow) : undefined}
        aria-label={label}
        aria-busy={loading || undefined}
        placeholder={placeholder}
        value={text ?? chosen?.label ?? ""}
        {...rest}
        onChange={(e) => onType(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={(e) => { rest.onFocus?.(e); setOpen(true); }}
        onClick={(e) => { rest.onClick?.(e); setOpen(true); }}
        onBlur={(e) => { rest.onBlur?.(e); close(); }}
      />
      {name != null && <input type="hidden" name={name} value={current == null ? "" : String(current)} />}
      {portal ? (mounted ? createPortal(list, document.body) : null) : list}
    </div>
  );
});
