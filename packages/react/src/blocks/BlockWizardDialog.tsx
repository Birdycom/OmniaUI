"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useControllable, useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";
import { Stepper } from "../components/Stepper";

export interface WizardStep {
  label: ReactNode;
  /** Step content (only the active step is rendered). */
  content: ReactNode;
}

export interface BlockWizardDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title">, DialogState {
  steps: WizardStep[];
  /** Active step (0-based, controlled). */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called when "Finish" is pressed on the last step. */
  onFinish?: () => void;
  backLabel?: ReactNode;
  nextLabel?: ReactNode;
  finishLabel?: ReactNode;
  /** Text under the title; defaults to `Step {n} of {total}`. */
  description?: ReactNode;
  stepperLabel?: string;
}

/** `dialog.oc-modal` wizard: stepper rail on the left, step content and Back / Next footer. */
export const BlockWizardDialog = forwardRef<HTMLDialogElement, BlockWizardDialogProps>(function BlockWizardDialog(
  {
    open,
    defaultOpen,
    onOpenChange,
    steps,
    step,
    defaultStep = 0,
    onStepChange,
    onFinish,
    backLabel = "Back",
    nextLabel = "Next",
    finishLabel = "Finish",
    description,
    stepperLabel = "Setup steps",
    className,
    ...rest
  },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const titleId = `oc-wizard-${useId().replace(/:/g, "")}-title`;
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const [current, setCurrent] = useControllable<number>(step, defaultStep, onStepChange);
  const last = current >= steps.length - 1;
  const active = steps[current];

  return (
    <dialog
      ref={ref}
      className={cx("oc-modal", className)}
      aria-labelledby={titleId}
      {...attrs({ closedby: "closerequest" })}
      {...rest}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className="oc-modal-content oc-modal-content--xl">
          <div className="oc-block-wizard">
            <div className="oc-block-wizard-rail">
              <Stepper steps={steps.map((s) => ({ label: s.label }))} current={current} onStepChange={setCurrent} aria-label={stepperLabel} />
            </div>
            <div className="oc-block-wizard-main">
              <div className="oc-modal-header">
                <h2 className="oc-modal-title" id={titleId}>{active?.label}</h2>
                <p className="oc-modal-description">{description ?? `Step ${current + 1} of ${steps.length}`}</p>
              </div>
              <div className="oc-block-wizard-step">{active?.content}</div>
              <div className="oc-modal-footer">
                <button className="oc-btn oc-btn--outline" type="button" disabled={current === 0} onClick={() => setCurrent(current - 1)}>{backLabel}</button>
                <button
                  className="oc-btn"
                  type="button"
                  onClick={() => {
                    if (last) onFinish?.();
                    else setCurrent(current + 1);
                  }}
                >
                  {last ? finishLabel : nextLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});
