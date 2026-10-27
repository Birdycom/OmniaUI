import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ProcessStep {
  title: ReactNode;
  text?: ReactNode;
}

export interface BlockProcessProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  steps: ProcessStep[];
  /** Items of the endless marquee (strings). The list is repeated once for the seamless loop. */
  marquee?: string[];
  marqueeLabel?: string;
}

/** Numbered steps (CSS counter) plus an optional marquee of technologies. */
export const BlockProcess = forwardRef<HTMLElement, BlockProcessProps>(function BlockProcess(
  { eyebrow, title, steps, marquee, marqueeLabel = "Technologies", className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container">
        {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
        <h2 className="oc-display oc-display--md">{title}</h2>
        <ol className="oc-steps">
          {steps.map((s, i) => (
            <li key={i}>
              <h3>{s.title}</h3>
              {s.text != null && <p>{s.text}</p>}
            </li>
          ))}
        </ol>
        {marquee && marquee.length > 0 && (
          <div className="oc-marquee mt-4" aria-label={marqueeLabel}>
            <div className="oc-marquee__track">
              {marquee.map((m) => <span className="oc-marquee__item" key={m}>{m}</span>)}
              {marquee.map((m) => <span className="oc-marquee__item" aria-hidden="true" key={`dup-${m}`}>{m}</span>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

