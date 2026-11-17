// File: packages/react/src/components/LanguageMenu.tsx
// Map: types -> globe -> LanguageMenu (trigger: flag + code or name, or icon only with a tooltip) -> menu (flag, native
//      name with lang, code, check at the current language; links with hreflang or buttons)
// The language select as a menu (packages/ui/snippets/language-select.html, "menu"): a button.oc-language-select that opens
// a .oc-dropdown-menu.oc-language-menu with the popover API. Links (href) switch pages without script; without href every
// item is a button and onChange gets the value.
"use client";

import { forwardRef, useId } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { useControllable } from "../hooks";
import { closeMenu } from "./Dropdown";
import { webiconNode } from "./Webicon";

export interface LanguageMenuOption {
  /** Language code ("nl", "en-GB"); also the lang/hreflang of the item. */
  value: string;
  /** Name of the language in that language ("Nederlands", "Français"). */
  label: string;
  /** Short code shown in the trigger and at the end of the item (default: the value, upper case). */
  code?: string;
  /** Flag: a webicon name ("flag:nl-4x3", drawn as inline SVG; nl, be, fr, de, gb, it and us are built in) or any node. */
  flag?: ReactNode;
  /** Address of the page in this language: the item becomes a link with hreflang. */
  href?: string;
}

export interface LanguageMenuProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange"> {
  options: LanguageMenuOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** What the trigger shows next to the flag: the code ("NL", default) or the name. */
  show?: "code" | "name";
  /** Round icon-only trigger (the current flag, or a globe without flags); the name goes in a tooltip. */
  compact?: boolean;
  /** No frame until hover or focus. */
  ghost?: boolean;
  /** Word for "Language" in the accessible name, the tooltip and the menu (default "Language"). */
  label?: string;
  /** Class for the menu. */
  menuClassName?: string;
}

const flagNode = (flag: ReactNode) => webiconNode(flag);
const codeOf = (o: LanguageMenuOption) => o.code ?? o.value.toUpperCase();

/** Small globe in currentColor (mdi:web). */
const Globe = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2s.06-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.92 7.92 0 0 1 9.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8 8 0 0 1 5.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.7 15.7 0 0 0-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" /></svg>
);

/** `button.oc-language-select` + `.oc-dropdown-menu.oc-language-menu`: a language menu with flags, native names and a check. */
export const LanguageMenu = forwardRef<HTMLButtonElement, LanguageMenuProps>(function LanguageMenu(
  { options, value, defaultValue, onChange, show = "code", compact, ghost, label = "Language", menuClassName, className, id, ...rest },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const menuId = id ? `${id}-menu` : `oc-language-menu-${auto}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  const cur = options.find((o) => o.value === current) ?? options[0];
  const name = `${label}: ${cur?.label ?? ""}`;
  const pick = (o: LanguageMenuOption) => (e: MouseEvent<HTMLElement>) => { setCurrent(o.value); closeMenu(e); };

  return (
    <>
      <button
        ref={ref}
        id={id}
        type="button"
        className={cx("oc-language-select", ghost && "oc-language-select--ghost", compact && "oc-language-select--icon oc-tooltip oc-tooltip--bottom", className)}
        aria-label={name}
        data-tooltip={compact ? name : undefined}
        popoverTarget={menuId}
        {...rest}
      >
        {compact ? (
          cur?.flag != null ? <span className="oc-language-flag" aria-hidden="true">{flagNode(cur.flag)}</span> : <span className="oc-language-select-icon" aria-hidden="true"><Globe /></span>
        ) : (
          <>
            {cur?.flag != null && <span className="oc-language-flag" aria-hidden="true">{flagNode(cur.flag)}</span>}
            {show === "name" ? <span lang={cur?.value}>{cur?.label}</span> : <span className="oc-language-select-code">{cur && codeOf(cur)}</span>}
          </>
        )}
      </button>
      <div className={cx("oc-dropdown-menu oc-language-menu", menuClassName)} id={menuId} aria-label={label} {...attrs({ popover: "" })}>
        {options.map((o) => {
          const inner = (
            <>
              {o.flag != null && <span className="oc-language-flag" aria-hidden="true">{flagNode(o.flag)}</span>}
              <span>{o.label}</span>
              <span className="oc-language-menu-code" aria-hidden="true">{codeOf(o)}</span>
            </>
          );
          const common = { className: "oc-dropdown-item", lang: o.value, "aria-current": o.value === current ? ("true" as const) : undefined, onClick: pick(o) };
          return o.href != null
            ? <a key={o.value} {...common} href={o.href} hrefLang={o.value}>{inner}</a>
            : <button key={o.value} type="button" {...common}>{inner}</button>;
        })}
      </div>
    </>
  );
});
