// File: packages/react/src/blocks/BlockContactForm.tsx | Map: types -> default fields -> BlockContactForm (panel: result | title, intro, alert, form -> cards)
import { forwardRef, useId } from "react";
import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Icon } from "../components/Icon";
import { cx } from "../utils";

/** mdi:check */
const CHECK = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";

export interface ContactFormLine {
  text: ReactNode;
  /** Makes the line a link (mailto:, tel:, https:). */
  href?: string;
}

export interface ContactFormCard {
  title: ReactNode;
  lines: ContactFormLine[];
  /** Icon in the tile: an <iconify-icon icon="mdi:…" />, an <Icon> or any node. */
  icon?: ReactNode;
}

export interface ContactFormSubject {
  value: string;
  label: ReactNode;
}

export interface BlockContactFormProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "onSubmit"> {
  title?: ReactNode;
  intro?: ReactNode;
  /** Where the form posts (no JavaScript needed). */
  action?: string;
  method?: string;
  /** Submit handler (e.g. Inertia's form.post); call preventDefault yourself. */
  onSubmit?: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
  /** Subjects for the default fields; empty = no subject field. */
  subjects?: ContactFormSubject[];
  /** Values of the default fields (after a failed post). */
  values?: Record<string, string>;
  /** Field errors by field name; `form` is the general message above the form. */
  errors?: Record<string, string>;
  /** Shows the result instead of the form. */
  sent?: boolean;
  /** The form is sending: aria-busy and a disabled button. */
  busy?: boolean;
  submitLabel?: ReactNode;
  busyLabel?: ReactNode;
  /** Short text next to the button (privacy). */
  note?: ReactNode;
  successTitle?: ReactNode;
  successText?: ReactNode;
  againLabel?: ReactNode;
  /** Back to the form from the result. */
  onAgain?: () => void;
  /** Message above the fields when there are field errors but no errors.form. */
  errorText?: ReactNode;
  cards?: ContactFormCard[];
  /** Own fields instead of the default ones (name, e-mail, phone, subject, message). */
  children?: ReactNode;
}

/** `.oc-block-contact-form`: contact form in a panel next to a column of contact cards. */
export const BlockContactForm = forwardRef<HTMLElement, BlockContactFormProps>(function BlockContactForm(
  {
    title = "Send us a message", intro, action, method = "post", onSubmit, subjects = [], values = {}, errors = {}, sent = false,
    busy = false, submitLabel = "Send message", busyLabel = "Sending…", note, successTitle = "Thank you, your message was sent",
    successText, againLabel = "Send another message", onAgain, errorText = "Please check the fields in red.", cards = [], children,
    className, ...rest
  },
  ref,
) {
  const id = useId().replace(/[^\w-]/g, "");
  const fid = (name: string) => `oc-contact-${id}-${name}`;
  const invalid = (name: string) =>
    errors[name] ? { "aria-invalid": true as const, "aria-describedby": `err-${name}` } : {};
  const error = (name: string) => errors[name] && <p className="oc-field-error" id={`err-${name}`}>{errors[name]}</p>;
  const fieldErrors = Object.keys(errors).some((k) => k !== "form");
  const alertText = errors.form ?? (fieldErrors ? errorText : null);

  const defaultFields = (
    <>
      <div className="oc-field-group oc-field-group--row">
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={fid("name")}>Name</label>
          <input className="oc-input" type="text" id={fid("name")} name="name" required maxLength={100} autoComplete="name" defaultValue={values.name} {...invalid("name")} />
          {error("name")}
        </div>
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={fid("email")}>E-mail</label>
          <input className="oc-input" type="email" id={fid("email")} name="email" required maxLength={254} autoComplete="email" defaultValue={values.email} {...invalid("email")} />
          {error("email")}
        </div>
      </div>
      <div className={cx("oc-field-group", subjects.length > 0 && "oc-field-group--row")}>
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={fid("phone")}>Phone <span className="oc-field-label__hint">(optional)</span></label>
          <input className="oc-input" type="tel" id={fid("phone")} name="phone" maxLength={40} autoComplete="tel" inputMode="tel" defaultValue={values.phone} {...invalid("phone")} />
          {error("phone")}
        </div>
        {subjects.length > 0 && (
          <div className="oc-field">
            <label className="oc-field-label" htmlFor={fid("subject")}>What is it about?</label>
            <select className="oc-select" id={fid("subject")} name="subject" required defaultValue={values.subject ?? ""} {...invalid("subject")}>
              <option value="">Choose a subject</option>
              {subjects.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {error("subject")}
          </div>
        )}
      </div>
      <div className="oc-field">
        <label className="oc-field-label" htmlFor={fid("message")}>Your message</label>
        <textarea className="oc-input oc-textarea" id={fid("message")} name="message" rows={6} required maxLength={5000} defaultValue={values.message} {...invalid("message")} />
        {error("message")}
      </div>
    </>
  );

  return (
    <section ref={ref} className={cx("oc-block-contact-form", className)} aria-label="Contact" {...rest}>
      <div className="oc-block-contact-form-layout">
        <div className="oc-panel oc-panel--glow" id={`oc-contact-${id}`}>
          {sent ? (
            <div className="oc-result" role="status" tabIndex={-1}>
              <span className="oc-icon-tile oc-icon-tile--sm oc-accent--green" aria-hidden="true"><Icon d={CHECK} /></span>
              <h2 className="oc-result__title">{successTitle}</h2>
              {successText != null && <p className="oc-result__text">{successText}</p>}
              {onAgain && (
                <div className="oc-result__actions">
                  <button type="button" className="oc-btn oc-btn--outline" onClick={onAgain}>{againLabel}</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {title != null && <h2 className="oc-block-contact-form-title">{title}</h2>}
              {intro != null && <p className="oc-block-contact-form-intro">{intro}</p>}
              {alertText != null && <p className="oc-alert oc-alert--danger" role="alert">{alertText}</p>}
              <form className="oc-form oc-form--filled" action={action} method={method} noValidate onSubmit={onSubmit} aria-busy={busy || undefined}>
                <div className="oc-honeypot" aria-hidden="true">
                  <label htmlFor={fid("website")}>Leave this field empty</label>
                  <input type="text" id={fid("website")} name="website" tabIndex={-1} autoComplete="off" />
                </div>
                {children ?? defaultFields}
                <div className="oc-form-actions">
                  <button className="oc-btn oc-btn--lg" type="submit" disabled={busy}>{busy ? busyLabel : submitLabel}</button>
                  {note != null && <p className="oc-form-note">{note}</p>}
                </div>
              </form>
            </div>
          )}
        </div>
        {cards.length > 0 && (
          <div className="oc-block-contact-form-cards">
            {cards.map((card, i) => (
              <article className="oc-block-contact-card" key={i}>
                {card.icon != null && <span className="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">{card.icon}</span>}
                <h3 className="oc-block-contact-title">{card.title}</h3>
                {card.lines.map((line, j) =>
                  line.href ? (
                    <a className="oc-block-contact-line" href={line.href} key={j}>{line.text}</a>
                  ) : (
                    <p className="oc-block-contact-line" key={j}>{line.text}</p>
                  ),
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
