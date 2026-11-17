"use client";

import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { contrastRatio, pickOnColor } from "../color";

export { contrastRatio, pickOnColor, toRgb, luminance } from "../color";

export interface ColorFieldContrastLabels {
  /** Line for text on the picked color. */
  text: string;
  /** "{name}": a background from contrastAgainst. */
  against: string;
  ok: string;
  low: string;
}

const CONTRAST_EN: ColorFieldContrastLabels = { text: "Text on this color", against: "On {name}", ok: "OK", low: "Too low" };

export interface ColorFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Hex value, e.g. `#3366cc` (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Id of the text input (so a <label for> can point at it). */
  id?: string;
  name?: string;
  disabled?: boolean;
  /** Check the color: text on it (4.5:1, light or dark text) and the color on these backgrounds (3:1). Any CSS color,
   *  also a theme token: [{ name: "the light page", color: "#ffffff" }, { name: "the dark page", color: "#0b1020" }]. */
  contrastAgainst?: { name: string; color: string }[];
  /** Show the report also without backgrounds (only the text line). */
  contrast?: boolean;
  contrastLabels?: Partial<ColorFieldContrastLabels>;
}

interface Check { key: string; label: string; ratio: number; ok: boolean; bg: string; fg?: string; dot?: string }

const HEX = /^#[0-9a-f]{6}$/i;

/** Native color picker + monospaced hex text input, kept in sync. */
export const ColorField = forwardRef<HTMLDivElement, ColorFieldProps>(function ColorField(
  { value, defaultValue = "#000000", onChange, id, name, disabled, contrastAgainst, contrast, contrastLabels, className, ...rest },
  ref,
) {
  const [color, setColor] = useControllable<string>(value, defaultValue, onChange);
  const [lastValid, setLastValid] = useState(HEX.test(color) ? color : "#000000");
  const picker = HEX.test(color) ? color : lastValid;
  const L = { ...CONTRAST_EN, ...contrastLabels };
  const report = contrast || (contrastAgainst?.length ?? 0) > 0;
  // Measured after the first paint: theme tokens resolve in the browser only (no difference between server and client).
  const [checks, setChecks] = useState<Check[]>([]);
  useEffect(() => {
    if (!report) return;
    const on = pickOnColor(picker);
    const list: Check[] = [];
    const text = contrastRatio(picker, on);
    if (text) list.push({ key: "text", label: L.text, ratio: text, ok: text >= 4.5, bg: picker, fg: on });
    for (const b of contrastAgainst ?? []) {
      const r = contrastRatio(picker, b.color);
      if (r) list.push({ key: b.name, label: L.against.replace("{name}", b.name), ratio: r, ok: r >= 3, bg: b.color, dot: picker });
    }
    setChecks(list);
  }, [picker, report, JSON.stringify(contrastAgainst), L.text, L.against]);
  const update = (next: string) => {
    if (HEX.test(next)) setLastValid(next);
    setColor(next);
  };
  return (
    <div ref={ref} className={cx("oc-color-field", className)} {...rest}>
      <input type="color" aria-label="Pick a color" value={picker} disabled={disabled} onChange={(e) => update(e.target.value)} />
      <input
        className="oc-input"
        type="text"
        id={id}
        name={name}
        aria-label="Color value"
        value={color}
        disabled={disabled}
        onChange={(e) => update(e.target.value)}
      />
      {report && checks.length > 0 && (
        <ul className="oc-color-field-report" aria-live="polite">
          {checks.map((c) => (
            <li key={c.key} className="oc-color-field-check" data-ok={c.ok ? "true" : "false"}>
              <span className="oc-color-field-sample" aria-hidden="true" style={{ background: c.bg, color: c.fg }}>{c.dot ? <i style={{ background: c.dot }} /> : "Aa"}</span>
              <span>{c.label}</span>
              <span className="oc-color-field-ratio">{c.ratio.toFixed(1)}:1 · {c.ok ? L.ok : L.low}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
