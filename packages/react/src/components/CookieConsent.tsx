// File: packages/react/src/components/CookieConsent.tsx
// Map: types + demo categories -> storage helpers -> CookieConsent (reopen button, popover: title, text, categories, actions) -> effect
// Same markup as packages/ui/snippets/cookie-consent.html on popover="manual". The effect does what the snippet script does:
// show the banner when no choice is stored, save the choice in localStorage and fire "oc-consent" on document.
"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, callAll, cx } from "../utils";
import { useMergedRef } from "../hooks";

export interface CookieCategory {
  /** Input name and key in the stored choice (e.g. "statistics"). */
  name: string;
  label: string;
  text?: ReactNode;
  /** Always on (checked + disabled), e.g. necessary cookies. */
  required?: boolean;
}

/** Stored choice: `{ necessary: true, statistics, marketing, date }`. */
export type ConsentChoice = { necessary: boolean; date: string } & Record<string, boolean | string>;

export interface CookieConsentProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  categories?: CookieCategory[];
  title?: ReactNode;
  /** Replaces the whole text paragraph (put your policy link in it). */
  text?: ReactNode;
  policyHref?: string;
  customizeLabel?: ReactNode;
  necessaryLabel?: ReactNode;
  selectedLabel?: ReactNode;
  allLabel?: ReactNode;
  /** Text of the "Cookie settings" button that opens the banner again; null hides it. */
  openLabel?: ReactNode;
  /** Full-width bar at the bottom (`--bar`). */
  bar?: boolean;
  /** Never open by itself (`data-oc-consent-manual`). */
  manual?: boolean;
  storageKey?: string;
  /** Called with the stored choice on load and after every choice. */
  onConsent?: (choice: ConsentChoice) => void;
}

const DEMO: CookieCategory[] = [
  { name: "necessary", label: "Necessary", text: "Session, security and your cookie choice. Always on.", required: true },
  { name: "statistics", label: "Statistics", text: "Anonymous visit counts." },
  { name: "marketing", label: "Marketing", text: "Embedded videos and ads that track you." },
];

const read = (key: string): ConsentChoice | null => {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
};

/** `aside.oc-cookie-consent[popover=manual]` plus an optional `[data-oc-consent-open]` button. */
export const CookieConsent = forwardRef<HTMLElement, CookieConsentProps>(function CookieConsent(
  {
    categories = DEMO, title = "We use cookies", text, policyHref = "#cookie-policy", customizeLabel = "Customize",
    necessaryLabel = "Only necessary", selectedLabel = "Save choice", allLabel = "Accept all", openLabel = "Cookie settings",
    bar, manual, storageKey = "oc-consent", onConsent, id = "oc-cookie-consent", className, onClick, ...rest
  },
  forwardedRef,
) {
  const box = useRef<HTMLElement>(null);
  const ref = useMergedRef(box, forwardedRef);
  const cb = useRef(onConsent);
  cb.current = onConsent;
  const inputs = () => Array.from(box.current?.querySelectorAll<HTMLInputElement>("input[name]") ?? []);
  const tell = (choice: ConsentChoice) => {
    document.dispatchEvent(new CustomEvent("oc-consent", { detail: choice }));
    cb.current?.(choice);
  };

  // On load: report a stored choice or show the banner; any [data-oc-consent-open] opens it again.
  useEffect(() => {
    const stored = read(storageKey);
    if (stored) tell(stored);
    else if (!manual) box.current?.showPopover?.();
    const reopen = (e: Event) => {
      if (!(e.target as Element | null)?.closest?.("[data-oc-consent-open]")) return;
      const choice = read(storageKey);
      for (const i of inputs()) if (!i.disabled) i.checked = !!choice?.[i.name];
      box.current?.showPopover?.();
    };
    document.addEventListener("click", reopen);
    return () => document.removeEventListener("click", reopen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, manual]);

  const choose = (e: MouseEvent<HTMLElement>) => {
    const mode = (e.target as HTMLElement).closest<HTMLElement>("[data-oc-consent]")?.dataset.ocConsent;
    if (!mode) return;
    const choice: ConsentChoice = { necessary: true, date: new Date().toISOString() };
    for (const i of inputs()) if (!i.disabled) choice[i.name] = mode === "all" || (mode === "selected" && i.checked);
    try { localStorage.setItem(storageKey, JSON.stringify(choice)); } catch { /* storage blocked */ }
    box.current?.hidePopover?.();
    tell(choice);
  };

  return (
    <>
      {openLabel != null && <button type="button" className="oc-btn oc-btn--outline oc-btn--sm" data-oc-consent-open="">{openLabel}</button>}
      <aside
        ref={ref}
        className={cx("oc-cookie-consent", bar && "oc-cookie-consent--bar", className)}
        id={id}
        {...attrs({ popover: "manual", "data-oc-consent-manual": manual ? "" : undefined })}
        aria-labelledby={`${id}-title`}
        onClick={callAll(choose, onClick)}
        {...rest}
      >
        <h2 className="oc-cookie-consent__title" id={`${id}-title`}><span aria-hidden="true">&#127850;</span> {title}</h2>
        <p className="oc-cookie-consent__text">
          {text ?? <>Necessary cookies keep the site working. With your permission we also measure visits to improve the site. Read the <a href={policyHref}>cookie policy</a>.</>}
        </p>
        <details className="oc-cookie-consent__prefs">
          <summary>{customizeLabel}</summary>
          {categories.map((c) => (
            <div key={c.name} className="oc-cookie-consent__category">
              <span className="oc-cookie-consent__category-name">{c.label}</span>
              {c.text != null && <span className="oc-cookie-consent__category-text">{c.text}</span>}
              <label className="oc-switch">
                <input type="checkbox" role="switch" name={c.name} defaultChecked={c.required} disabled={c.required} aria-label={`${c.label} cookies`} />
                <span className="oc-switch-track" />
              </label>
            </div>
          ))}
        </details>
        <div className="oc-cookie-consent__actions">
          <button type="button" className="oc-btn oc-btn--outline" data-oc-consent="necessary">{necessaryLabel}</button>
          <button type="button" className="oc-btn oc-btn--secondary" data-oc-consent="selected">{selectedLabel}</button>
          <button type="button" className="oc-btn" data-oc-consent="all">{allLabel}</button>
        </div>
      </aside>
    </>
  );
});
