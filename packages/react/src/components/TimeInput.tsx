// File: packages/react/src/components/TimeInput.tsx
// Map: helper (digits -> HH:mm) -> component (text field + datalist of slots, 0.18.0: or the slots in a popover)
// Same markup as packages/ui/snippets/time-input.html. JS only adds the colon while typing ("0930" -> "09:30").
"use client";

import { forwardRef, useId, useRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "list"> {
  /** "HH:mm" or "" (empty). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Suggested times shown by the browser while typing (datalist). */
  slots?: string[];
  /**
   * 0.18.0: show `slots` in a popover under a clock button (`.oc-time-picker`: native popover, radio chips) instead of
   * the datalist; picking one fills the field and closes it. Typing keeps working.
   */
  slotsPopover?: boolean;
  /** 0.18.0: accessible name of the clock button (default "Choose a time"). */
  slotsLabel?: string;
  error?: boolean;
}

// mdi:clock-outline (webicons) as inline SVG: no icon runtime needed.
const CLOCK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:clock-outline">
    <path d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" />
  </svg>
);

/** Keep up to 4 digits and put a colon after the first two: "0930" -> "09:30". Short input is completed on blur. */
export function formatTime24h(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** On blur: "9" -> "09:00", "930" -> "09:30". Leaves other text alone (pattern marks it invalid). */
export function completeTime(text: string): string {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 1 || digits.length === 2) return `${digits.padStart(2, "0")}:00`;
  if (digits.length === 3) return `0${digits[0]}:${digits.slice(1)}`;
  return text;
}

/** `.oc-time-input`: 24h text field (pattern HH:mm) with optional datalist suggestions. */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(
  { value, defaultValue, onChange, slots, slotsPopover, slotsLabel = "Choose a time", error, className, onBlur, placeholder = "hh:mm", ...rest },
  ref,
) {
  const listId = `oc-time-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? "", onChange);
  const panel = useRef<HTMLDivElement>(null);
  const popover = !!(slotsPopover && slots?.length);
  const field = (
    <input
      ref={ref}
      className={cx("oc-input", "oc-time-input", className)}
      type="text"
      inputMode="numeric"
      maxLength={5}
      pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
      placeholder={placeholder}
      list={slots?.length && !popover ? listId : undefined}
      aria-invalid={error ? true : undefined}
      value={current}
      onChange={(e) => {
        // A picked datalist option already has the colon; typed digits get one.
        const v = e.target.value;
        setCurrent(/^\d{2}:\d{2}$/.test(v) ? v : formatTime24h(v));
      }}
      onBlur={(e) => {
        const done = completeTime(current);
        if (done !== current) setCurrent(done);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
  if (popover) {
    const panelId = `${listId}-slots`;
    return (
      <div className="oc-time-picker">
        {field}
        <button type="button" className="oc-btn oc-btn--outline oc-btn--icon" popoverTarget={panelId} aria-label={slotsLabel} disabled={rest.disabled}>
          {CLOCK_ICON}
        </button>
        <div ref={panel} className="oc-popover" id={panelId} popover="auto" role="dialog" aria-label={slotsLabel}>
          <div className="oc-time-slots" role="radiogroup" aria-label={slotsLabel}>
            {slots!.map((s) => (
              <label key={s} className="oc-time-slot">
                <input
                  type="radio"
                  name={panelId}
                  value={s}
                  checked={current === s}
                  onChange={() => {
                    setCurrent(s);
                    const el = panel.current as (HTMLDivElement & { hidePopover?: () => void }) | null;
                    try {
                      if (el?.matches(":popover-open")) el.hidePopover?.();
                    } catch {
                      // No popover support (old browser, test DOM): the panel stays as it is.
                    }
                  }}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {field}
      {slots?.length ? (
        <datalist id={listId}>
          {slots.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      ) : null}
    </>
  );
});
