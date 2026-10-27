import { forwardRef, useId } from "react";
import type { FormEvent, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockAuthProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  submitLabel?: ReactNode;
  /** Label of the secondary (social) button; omit to hide it together with the divider. */
  socialLabel?: ReactNode;
  dividerLabel?: ReactNode;
  /** Text under the card, e.g. `Don't have an account? <a href="#">Sign up</a>`. */
  footer?: ReactNode;
  onSubmit?: (values: { email: string; password: string }) => void;
  onSocial?: () => void;
}

/** `.oc-block-auth`: sign-in card with e-mail, password and an optional social button. */
export const BlockAuth = forwardRef<HTMLDivElement, BlockAuthProps>(function BlockAuth(
  { title = "Sign in", subtitle, submitLabel = "Sign in", socialLabel, dividerLabel = "or continue with", footer, onSubmit, onSocial, className, ...rest },
  ref,
) {
  const id = useId().replace(/:/g, "");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit?.({ email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") });
  };
  return (
    <div ref={ref} className={cx("oc-block-auth", className)} {...rest}>
      <form className="oc-block-auth-card" onSubmit={submit}>
        <h2>{title}</h2>
        {subtitle != null && <p className="oc-block-subtitle">{subtitle}</p>}
        <div className="oc-form-group">
          <label className="oc-label" htmlFor={`${id}-email`}>Email</label>
          <input className="oc-input" id={`${id}-email`} name="email" type="email" placeholder="name@company.com" />
        </div>
        <div className="oc-form-group">
          <label className="oc-label" htmlFor={`${id}-password`}>Password</label>
          <input className="oc-input" id={`${id}-password`} name="password" type="password" placeholder="********" />
        </div>
        <button className="oc-btn" type="submit" style={{ width: "100%" }}>{submitLabel}</button>
        {socialLabel != null && (
          <>
            <div className="oc-block-auth-divider">{dividerLabel}</div>
            <button className="oc-btn oc-btn--outline" type="button" style={{ width: "100%" }} onClick={onSocial}>{socialLabel}</button>
          </>
        )}
      </form>
      {footer != null && <div className="oc-block-auth-footer">{footer}</div>}
    </div>
  );
});
