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
  /** Called when an enabled step is clicked. */
  onStepChange?: (index: number) => void;
  /**
   * 0.18.0: which steps can be clicked (default: the done ones and the active one, `index <= current`). Return true for a
   * later step the visitor may already open (a wizard where the steps do not depend on each other).
   */
  isStepEnabled?: (index: number) => boolean;
}

/** `<ol class="oc-stepper">`: done, active and upcoming steps. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, horizontal, onStepChange, isStepEnabled, className, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx("oc-stepper", horizontal && "oc-stepper--horizontal", className)} {...rest}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const enabled = isStepEnabled ? isStepEnabled(i) : i <= current;
        const label = <span className="oc-stepper-label">{step.label}</span>;
        return (
          <li key={i}>
            <button
              className={cx("oc-stepper-item", done && "oc-stepper-item--done", active && "oc-stepper-item--active")}
              type="button"
              aria-current={active ? "step" : undefined}
              disabled={!enabled}
              onClick={() => enabled && onStepChange?.(i)}
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
