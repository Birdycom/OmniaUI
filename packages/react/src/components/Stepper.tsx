import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface StepperStep {
  label: ReactNode;
  /** Small text under the label, e.g. `2/4`. */
  meta?: ReactNode;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, "onChange"> {
  steps: StepperStep[];
  /** Index of the active step (0-based). Earlier steps are done, later ones disabled. */
  current: number;
  horizontal?: boolean;
  /** Called when a done step is clicked. */
  onStepChange?: (index: number) => void;
}

/** `<ol class="oc-stepper">`: done, active and upcoming steps. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, horizontal, onStepChange, className, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx("oc-stepper", horizontal && "oc-stepper--horizontal", className)} {...rest}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const label = <span className="oc-stepper-label">{step.label}</span>;
        return (
          <li key={i}>
            <button
              className={cx("oc-stepper-item", done && "oc-stepper-item--done", active && "oc-stepper-item--active")}
              type="button"
              aria-current={active ? "step" : undefined}
              disabled={i > current}
              onClick={() => onStepChange?.(i)}
            >
              {step.meta != null ? (
                <span>
                  {label}
                  <span className="oc-stepper-meta">{step.meta}</span>
                </span>
              ) : (
                label
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
});
