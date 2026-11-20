// File: packages/react/src/blockParts/AuthBlockFrame.tsx | Map: types -> AuthBlockFrame (page / split / minimal -> form: logo tile, head, social, fields, foot, legal)
// Shared frame of the auth page blocks (login, signup, otp, forgot / reset password). Not a block of its own: it lives
// outside src/blocks so the index/manifest generator does not list it.
import type { CSSProperties, FormEventHandler, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cx } from "../utils";
import { webiconNode } from "../components/Webicon";

export type AuthBlockLayout = "card" | "split" | "minimal";

export interface AuthBlockPanel {
  /** `.oc-block-authduo-panel--image` (default), `--muted` or `--photo` (with `photo`). */
  tone?: "image" | "muted" | "photo";
  /** Photo url for tone "photo" (`--oc-authduo-photo`). */
  photo?: string;
  /** Brand link content; default the layers icon + "Company 1". */
  logo?: ReactNode;
  logoHref?: string;
  quote?: ReactNode;
  quoteAuthor?: ReactNode;
}

export interface AuthBlockBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> {
  /** card: centered card (`.oc-block-authpage`); split: brand panel + form (`.oc-block-authduo`); minimal: no card (`.oc-block-authmin`). */
  layout?: AuthBlockLayout;
  /** Card layout: muted page instead of the page background (drops `--plain`). */
  muted?: boolean;
  /** Split layout: form first, panel on the other side (`--reverse`). */
  reverse?: boolean;
  /** Split layout: the brand panel. */
  panel?: AuthBlockPanel;
  /** Icon tile above the title: a webicon name or a node; `false` hides it. */
  icon?: ReactNode | false;
  title?: ReactNode;
  /** 0.17.0: heading level of the title (default 1; 2 renders an `h2` when the form sits lower on a page). */
  headingLevel?: 1 | 2;
  text?: ReactNode;
  /** Social buttons (labels); empty hides them with the divider. */
  social?: ReactNode[];
  /** Social buttons above the fields (default) or below the submit button. */
  socialPosition?: "top" | "bottom";
  dividerLabel?: ReactNode;
  onSocial?: (index: number) => void;
  submitLabel?: ReactNode;
  /** Small helper text above the submit button (`.oc-block-authcard-hint`). */
  hint?: ReactNode;
  /** Switch-form line under the form (`.oc-block-authcard-foot`). */
  footer?: ReactNode;
  /** Legal line (`.oc-block-authcard-legal`). */
  legal?: ReactNode;
  /** Native form target when no onSubmit handler is given. */
  action?: string;
  method?: string;
  /** Wider card (`.oc-block-authcard--wide`). */
  wide?: boolean;
}

export const AUTH_LOGO_ICON = "mdi:layers-outline";

interface FrameProps extends Omit<AuthBlockBaseProps, "onSubmit"> {
  defaultIcon: ReactNode;
  defaultPanel?: AuthBlockPanel;
  onFormSubmit?: FormEventHandler<HTMLFormElement>;
}

/** @internal Shared markup of the auth page blocks. */
export const AuthBlockFrame = forwardRef<HTMLDivElement, FrameProps>(function AuthBlockFrame(
  {
    layout = "card",
    muted,
    reverse,
    panel,
    defaultPanel,
    icon,
    defaultIcon,
    title,
    headingLevel = 1,
    text,
    social,
    socialPosition = "top",
    dividerLabel,
    onSocial,
    submitLabel,
    hint,
    footer,
    legal,
    action = "#",
    method = "post",
    wide,
    onFormSubmit,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  const tile = icon === false ? null : icon !== undefined ? icon : layout === "split" ? null : defaultIcon;
  const socialRow = social && social.length > 0 ? (
    <div className="oc-block-authsocial">
      {social.map((label, i) => (
        <button key={i} className="oc-btn oc-btn--outline" type="button" onClick={() => onSocial?.(i)}>{label}</button>
      ))}
    </div>
  ) : null;
  const divider = socialRow && dividerLabel != null ? <div className="oc-separator-text">{dividerLabel}</div> : null;

  const form = (
    <form
      className={cx("oc-block-authcard", layout !== "card" && "oc-block-authcard--flat", wide && "oc-block-authcard--wide")}
      action={action}
      method={method}
      onSubmit={onFormSubmit}
    >
      {tile != null && <span className="oc-block-authcard-logo">{webiconNode(tile)}</span>}
      {(title != null || text != null) && (
        <div className="oc-block-authcard-head">
          {title != null && <Heading className="oc-block-authcard-title">{title}</Heading>}
          {text != null && <p className="oc-block-authcard-text">{text}</p>}
        </div>
      )}
      {socialPosition === "top" && socialRow}
      {socialPosition === "top" && divider}
      <div className="oc-block-authcard-fields">
        {children}
        {hint != null && <p className="oc-block-authcard-hint">{hint}</p>}
        <button className="oc-btn oc-block-authcard-submit" type="submit">{submitLabel}</button>
      </div>
      {socialPosition === "bottom" && divider}
      {socialPosition === "bottom" && socialRow}
      {footer != null && <p className="oc-block-authcard-foot">{footer}</p>}
      {legal != null && <p className="oc-block-authcard-legal">{legal}</p>}
    </form>
  );

  if (layout === "split") {
    const p = { ...defaultPanel, ...panel };
    const tone = p.tone ?? "image";
    return (
      <div ref={ref} className={cx("oc-block-authduo", reverse && "oc-block-authduo--reverse", className)} {...rest}>
        <div className="oc-block-authduo-grid">
          <aside
            className={cx("oc-block-authduo-panel", `oc-block-authduo-panel--${tone}`)}
            style={tone === "photo" && p.photo ? ({ "--oc-authduo-photo": `url('${p.photo}')` } as CSSProperties) : undefined}
          >
            <a className="oc-block-authduo-logo" href={p.logoHref ?? "#"}>
              {p.logo ?? <>{webiconNode(AUTH_LOGO_ICON)} Company 1</>}
            </a>
            {p.quote != null && (
              <blockquote className="oc-block-authduo-quote">
                <p>{p.quote}</p>
                {p.quoteAuthor != null && <footer>{p.quoteAuthor}</footer>}
              </blockquote>
            )}
          </aside>
          <div className="oc-block-authduo-form">{form}</div>
        </div>
      </div>
    );
  }
  if (layout === "minimal") {
    return <div ref={ref} className={cx("oc-block-authmin", className)} {...rest}>{form}</div>;
  }
  return (
    <div ref={ref} className={cx("oc-block-authpage", !muted && "oc-block-authpage--plain", className)} {...rest}>
      {form}
    </div>
  );
});

/** @internal Read a FormData value as a string. */
export const formValue = (data: FormData, name: string) => String(data.get(name) ?? "");
