// File: packages/react/src/components/HeaderSettings.tsx
// Map: ThemeToggle (one button, light <-> dark, aria-pressed, tooltip) -> HeaderSettings (group: language menu compact +
//      theme toggle + your own buttons)
// The settings of an app header in one small group (0.17.0): the language as a round flag button and the theme as one
// button, both ghost, with their name in a tooltip under the button (also in a glass header).
"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";
import { LanguageMenu } from "./LanguageMenu";
import type { LanguageMenuOption } from "./LanguageMenu";

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  /** The theme now. */
  value: "light" | "dark";
  onChange?: (theme: "light" | "dark") => void;
  /** No frame until hover or focus. */
  ghost?: boolean;
  /** Tooltip and accessible name: what a click does (default "Dark theme" / "Light theme"). */
  labels?: { toDark?: string; toLight?: string };
}

/** `button.oc-btn--icon` that switches between light and dark (`aria-pressed` is true in dark); the name in a tooltip. */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { value, onChange, ghost = true, labels, className, onClick, ...rest },
  ref,
) {
  const name = value === "dark" ? labels?.toLight ?? "Light theme" : labels?.toDark ?? "Dark theme";
  return (
    <button
      ref={ref}
      type="button"
      className={cx("oc-btn oc-btn--icon oc-tooltip oc-tooltip--bottom", ghost ? "oc-btn--ghost" : "oc-btn--outline", className)}
      aria-label={name}
      aria-pressed={value === "dark"}
      data-tooltip={name}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) onChange?.(value === "dark" ? "light" : "dark"); }}
      {...rest}
    >
      {webiconNode(value === "dark" ? "mdi:white-balance-sunny" : "mdi:weather-night")}
    </button>
  );
});

export interface HeaderSettingsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The languages (leave out for no language menu); flags come from the codes. */
  languages?: LanguageMenuOption[];
  language?: string;
  onLanguageChange?: (value: string) => void;
  /** Word for "Language" (tooltip and menu). */
  languageLabel?: string;
  /** The theme (leave out for no theme button). */
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  themeLabels?: ThemeToggleProps["labels"];
  /** Name of the group for a screen reader (default "Settings"). */
  label?: string;
  /** More buttons after the two (help, account). */
  children?: ReactNode;
}

/** `.oc-header-settings`: language and theme together in the header, ghost buttons with tooltips under them. */
export const HeaderSettings = forwardRef<HTMLDivElement, HeaderSettingsProps>(function HeaderSettings(
  { languages, language, onLanguageChange, languageLabel, theme, onThemeChange, themeLabels, label = "Settings", className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="group" aria-label={label} className={cx("oc-header-settings", className)} {...rest}>
      {languages && languages.length > 0 && (
        <LanguageMenu options={languages} value={language} onChange={onLanguageChange} label={languageLabel} compact ghost flags="auto" />
      )}
      {theme && <ThemeToggle value={theme} onChange={onThemeChange} labels={themeLabels} />}
      {children}
    </div>
  );
});
