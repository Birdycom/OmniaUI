// File: packages/react/src/components/PasswordRequirements.tsx
// Map: rule type + default rules -> component (live list, --met per rule)
// Same markup as packages/ui/snippets/password-requirements.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface PasswordRule {
  label: ReactNode;
  /** True when the password meets the rule. */
  test: (password: string) => boolean;
}

/** Common rules: length, uppercase, number, symbol. Pass your own list to change them. */
export const defaultPasswordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export interface PasswordRequirementsProps extends HTMLAttributes<HTMLUListElement> {
  password: string;
  rules?: PasswordRule[];
  /** Rules side by side. */
  inline?: boolean;
  /** Render nothing until the user types. */
  hideWhenEmpty?: boolean;
}

/** `.oc-password-requirements`: each rule turns green (--met) as soon as it passes. */
export const PasswordRequirements = forwardRef<HTMLUListElement, PasswordRequirementsProps>(function PasswordRequirements(
  { password, rules = defaultPasswordRules, inline, hideWhenEmpty, className, ...rest },
  ref,
) {
  if (hideWhenEmpty && !password) return null;
  return (
    <ul ref={ref} className={cx("oc-password-requirements", inline && "oc-password-requirements--inline", className)} aria-live="polite" {...rest}>
      {rules.map((rule, i) => (
        <li key={i} className={cx("oc-password-requirement", rule.test(password) && "oc-password-requirement--met")}>
          {rule.label}
        </li>
      ))}
    </ul>
  );
});
