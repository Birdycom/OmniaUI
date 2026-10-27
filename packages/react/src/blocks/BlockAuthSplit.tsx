import { forwardRef, useId } from "react";
import type { FormEvent, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { PasswordInput } from "../components/PasswordInput";

export interface BlockAuthSplitProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> {
  /** Brand link content (icon + name). */
  logo?: ReactNode;
  logoHref?: string;
  quote?: ReactNode;
  quoteAuthor?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  submitLabel?: ReactNode;
  forgotHref?: string;
  forgotLabel?: ReactNode;
  rememberLabel?: ReactNode;
  onSubmit?: (values: { email: string; password: string; remember: boolean }) => void;
}

/** `.oc-block-authsplit`: brand panel (logo, quote) next to the sign-in form. */
export const BlockAuthSplit = forwardRef<HTMLDivElement, BlockAuthSplitProps>(function BlockAuthSplit(
  {
    logo,
    logoHref = "#",
    quote,
    quoteAuthor,
    title = "Welcome back",
    subtitle,
    submitLabel = "Sign in",
    forgotHref = "#",
    forgotLabel = "Forgot password?",
    rememberLabel = "Remember me",
    onSubmit,
    className,
    ...rest
  },
  ref,
) {
  const id = useId().replace(/:/g, "");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit?.({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: data.get("remember") != null,
    });
  };
  return (
    <div ref={ref} className={cx("oc-block-authsplit", className)} {...rest}>
      <aside className="oc-block-authsplit-brand">
        {logo != null && <a className="oc-block-authsplit-logo" href={logoHref}>{logo}</a>}
        {quote != null && (
          <blockquote className="oc-block-authsplit-quote">
            <p>{quote}</p>
            {quoteAuthor != null && <footer>{quoteAuthor}</footer>}
          </blockquote>
        )}
      </aside>
      <div className="oc-block-authsplit-form">
        <form className="oc-block-authsplit-card" onSubmit={submit}>
          <h1 className="oc-block-authsplit-title">{title}</h1>
          {subtitle != null && <p className="oc-block-authsplit-subtitle">{subtitle}</p>}
          <div className="oc-block-authsplit-fields">
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-email`}>E-mail</label>
              <input className="oc-input" id={`${id}-email`} name="email" type="email" autoComplete="username" placeholder="name@company.com" required />
            </div>
            <div className="oc-field">
              <label className="oc-field-label" htmlFor={`${id}-password`}>Password</label>
              <PasswordInput id={`${id}-password`} name="password" required />
            </div>
            <div className="oc-block-authsplit-row">
              <label><input className="oc-checkbox" type="checkbox" name="remember" /> {rememberLabel}</label>
              <a className="oc-link" href={forgotHref}>{forgotLabel}</a>
            </div>
            <button className="oc-btn" type="submit" style={{ width: "100%" }}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
});
