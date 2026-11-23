// File: packages/react/src/blockParts/authForms.tsx | Map: value types -> props per form (login, signup, otp, forgot, reset) -> form bodies on AuthBlockFrame
// The auth page blocks (BlockLogin01..03, BlockSignup01..02, BlockOtp01..02, BlockForgotPassword, BlockResetPassword)
// are these forms with the defaults of their snippet (packages/blocks/blocks/<name>.html).
import { forwardRef, useId } from "react";
import type { FormEvent, ReactNode } from "react";
import { PasswordInput } from "../components/PasswordInput";
import { OtpInput } from "../components/OtpInput";
import { AuthBlockFrame, formValue } from "./AuthBlockFrame";
import type { AuthBlockBaseProps, AuthBlockPanel } from "./AuthBlockFrame";

/** Props with a value that is not undefined win over the defaults. */
export function withDefined<T extends object>(defaults: Partial<T>, props: T): T {
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(props)) if (v !== undefined) out[k] = v;
  return out as T;
}

const handler = <V,>(onSubmit: ((values: V) => void) | undefined, read: (data: FormData) => V) =>
  onSubmit
    ? (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(read(new FormData(e.currentTarget)));
      }
    : undefined;

const useAuthId = () => useId().replace(/[^\w-]/g, "");

/* ---------------------------------------------------------------- login */

export interface LoginValues { email: string; password: string; remember: boolean }

export interface BlockLoginProps extends AuthBlockBaseProps {
  emailLabel?: ReactNode;
  emailPlaceholder?: string;
  passwordLabel?: ReactNode;
  /** false: magic-link form without a password field. */
  password?: boolean;
  /** "Remember me" checkbox label; false hides it. */
  rememberLabel?: ReactNode | false;
  /** "Forgot password?" link; false hides it. */
  forgot?: { label: ReactNode; href: string } | false;
  /** Replaces the default fields (the submit button stays). */
  fields?: ReactNode;
  onSubmit?: (values: LoginValues) => void;
}

export const LoginForm = forwardRef<HTMLDivElement, BlockLoginProps & { defaults: Partial<BlockLoginProps> }>(function LoginForm(
  { defaults, ...props },
  ref,
) {
  const id = useAuthId();
  const {
    emailLabel = "E-mail",
    emailPlaceholder = "name@company1.example",
    passwordLabel = "Password",
    password = true,
    rememberLabel = false,
    forgot = false,
    fields,
    onSubmit,
    ...frame
  } = withDefined(defaults, props);
  return (
    <AuthBlockFrame defaultPanel={defaults.panel}
      ref={ref}
      defaultIcon="mdi:layers-outline"
      onFormSubmit={handler(onSubmit, (d) => ({ email: formValue(d, "email"), password: formValue(d, "password"), remember: d.get("remember") != null }))}
      {...frame}
    >
      {fields ?? (
        <>
          <div className="oc-field">
            <label className="oc-field-label" htmlFor={`${id}-email`}>{emailLabel}</label>
            <input className="oc-input" id={`${id}-email`} name="email" type="email" autoComplete="username" required placeholder={emailPlaceholder} />
          </div>
          {password && (
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-password`}>{passwordLabel}</label>
              <PasswordInput id={`${id}-password`} name="password" autoComplete="current-password" required />
            </div>
          )}
          {(rememberLabel !== false || forgot !== false) && (
            <div className="oc-block-authcard-row">
              {rememberLabel !== false && <label><input className="oc-checkbox" type="checkbox" name="remember" /> {rememberLabel}</label>}
              {forgot !== false && <a className="oc-link" href={forgot.href}>{forgot.label}</a>}
            </div>
          )}
        </>
      )}
    </AuthBlockFrame>
  );
});

/* --------------------------------------------------------------- signup */

export interface SignupValues { name: string; email: string; password: string; confirm: string; terms: boolean }

export interface BlockSignupProps extends AuthBlockBaseProps {
  /** Full-name field label; false hides the field. */
  nameLabel?: ReactNode | false;
  namePlaceholder?: string;
  emailLabel?: ReactNode;
  emailPlaceholder?: string;
  passwordLabel?: ReactNode;
  /** Confirm-password field label; false hides the field. */
  confirmLabel?: ReactNode | false;
  /** Terms checkbox content (e.g. `<>I agree to the <a href="/terms">terms</a></>`); false hides it. */
  terms?: ReactNode | false;
  fields?: ReactNode;
  onSubmit?: (values: SignupValues) => void;
}

export const SignupForm = forwardRef<HTMLDivElement, BlockSignupProps & { defaults: Partial<BlockSignupProps> }>(function SignupForm(
  { defaults, ...props },
  ref,
) {
  const id = useAuthId();
  const {
    nameLabel = "Full name",
    namePlaceholder = "Contact 1",
    emailLabel = "E-mail",
    emailPlaceholder = "name@company1.example",
    passwordLabel = "Password",
    confirmLabel = false,
    terms = false,
    fields,
    onSubmit,
    ...frame
  } = withDefined(defaults, props);
  return (
    <AuthBlockFrame defaultPanel={defaults.panel}
      ref={ref}
      defaultIcon="mdi:layers-outline"
      onFormSubmit={handler(onSubmit, (d) => ({
        name: formValue(d, "name"),
        email: formValue(d, "email"),
        password: formValue(d, "password"),
        confirm: formValue(d, "password_confirmation"),
        terms: d.get("terms") != null,
      }))}
      {...frame}
    >
      {fields ?? (
        <>
          {nameLabel !== false && (
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-name`}>{nameLabel}</label>
              <input className="oc-input" id={`${id}-name`} name="name" type="text" autoComplete="name" required placeholder={namePlaceholder} />
            </div>
          )}
          <div className="oc-field">
            <label className="oc-field-label" htmlFor={`${id}-email`}>{emailLabel}</label>
            <input className="oc-input" id={`${id}-email`} name="email" type="email" autoComplete="email" required placeholder={emailPlaceholder} />
          </div>
          <div className="oc-field">
            <label className="oc-field-label" htmlFor={`${id}-password`}>{passwordLabel}</label>
            <PasswordInput id={`${id}-password`} name="password" autoComplete="new-password" required />
          </div>
          {confirmLabel !== false && (
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-confirm`}>{confirmLabel}</label>
              <PasswordInput id={`${id}-confirm`} name="password_confirmation" autoComplete="new-password" required />
            </div>
          )}
          {terms !== false && <label><input className="oc-checkbox" type="checkbox" name="terms" required /> {terms}</label>}
        </>
      )}
    </AuthBlockFrame>
  );
});

/* ------------------------------------------------------------------ otp */

export interface OtpValues { code: string }

export interface BlockOtpProps extends AuthBlockBaseProps {
  codeLabel?: ReactNode;
  /** Help text under the code (`.oc-field-description`). */
  description?: ReactNode;
  /** Code length (default 6). */
  length?: number;
  defaultValue?: string;
  fields?: ReactNode;
  onSubmit?: (values: OtpValues) => void;
  /** Called once the code is complete. */
  onComplete?: (code: string) => void;
}

export const OtpForm = forwardRef<HTMLDivElement, BlockOtpProps & { defaults: Partial<BlockOtpProps> }>(function OtpForm(
  { defaults, ...props },
  ref,
) {
  const id = useAuthId();
  const { codeLabel = "Verification code", description, length = 6, defaultValue, fields, onSubmit, onComplete, ...frame } = withDefined(defaults, props);
  return (
    <AuthBlockFrame ref={ref} defaultPanel={defaults.panel} defaultIcon="mdi:shield-outline" onFormSubmit={handler(onSubmit, (d) => ({ code: formValue(d, "code") }))} {...frame}>
      {fields ?? (
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={`${id}-code`}>{codeLabel}</label>
          <OtpInput id={`${id}-code`} name="code" length={length} defaultValue={defaultValue} onComplete={onComplete} />
          {description != null && <p className="oc-field-description">{description}</p>}
        </div>
      )}
    </AuthBlockFrame>
  );
});

/* ------------------------------------------------------ forgot password */

export interface ForgotPasswordValues { email: string }

export interface BlockForgotPasswordProps extends AuthBlockBaseProps {
  emailLabel?: ReactNode;
  emailPlaceholder?: string;
  fields?: ReactNode;
  onSubmit?: (values: ForgotPasswordValues) => void;
}

export const ForgotForm = forwardRef<HTMLDivElement, BlockForgotPasswordProps & { defaults: Partial<BlockForgotPasswordProps> }>(function ForgotForm(
  { defaults, ...props },
  ref,
) {
  const id = useAuthId();
  const { emailLabel = "E-mail", emailPlaceholder = "name@company1.example", fields, onSubmit, ...frame } = withDefined(defaults, props);
  return (
    <AuthBlockFrame ref={ref} defaultPanel={defaults.panel} defaultIcon="mdi:email-outline" onFormSubmit={handler(onSubmit, (d) => ({ email: formValue(d, "email") }))} {...frame}>
      {fields ?? (
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={`${id}-email`}>{emailLabel}</label>
          <input className="oc-input" id={`${id}-email`} name="email" type="email" autoComplete="username" required placeholder={emailPlaceholder} />
        </div>
      )}
    </AuthBlockFrame>
  );
});

/* ------------------------------------------------------- reset password */

export interface ResetPasswordValues { password: string; confirm: string }

export interface BlockResetPasswordProps extends AuthBlockBaseProps {
  passwordLabel?: ReactNode;
  /** Confirm-password label; false hides the field. */
  confirmLabel?: ReactNode | false;
  fields?: ReactNode;
  onSubmit?: (values: ResetPasswordValues) => void;
}

export const ResetForm = forwardRef<HTMLDivElement, BlockResetPasswordProps & { defaults: Partial<BlockResetPasswordProps> }>(function ResetForm(
  { defaults, ...props },
  ref,
) {
  const id = useAuthId();
  const { passwordLabel = "New password", confirmLabel = "Confirm password", fields, onSubmit, ...frame } = withDefined(defaults, props);
  return (
    <AuthBlockFrame defaultPanel={defaults.panel}
      ref={ref}
      defaultIcon="mdi:lock-outline"
      onFormSubmit={handler(onSubmit, (d) => ({ password: formValue(d, "password"), confirm: formValue(d, "password_confirmation") }))}
      {...frame}
    >
      {fields ?? (
        <>
          <div className="oc-field">
            <label className="oc-field-label" htmlFor={`${id}-password`}>{passwordLabel}</label>
            <PasswordInput id={`${id}-password`} name="password" autoComplete="new-password" required />
          </div>
          {confirmLabel !== false && (
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-confirm`}>{confirmLabel}</label>
              <PasswordInput id={`${id}-confirm`} name="password_confirmation" autoComplete="new-password" required />
            </div>
          )}
        </>
      )}
    </AuthBlockFrame>
  );
});

/** Default brand panel quote of the split blocks. */
export const panel = (quote: string, quoteAuthor: string, tone: AuthBlockPanel["tone"] = "image"): AuthBlockPanel => ({ tone, quote, quoteAuthor });
