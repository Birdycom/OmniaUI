"use client";

import { forwardRef, useId, useState } from "react";
import type { FormEvent, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { CopyField } from "../components/CopyField";
import { Heading } from "../components/Heading";
import { OtpInput } from "../components/OtpInput";
import { RecoveryCodes } from "../components/RecoveryCodes";

export interface BlockTwoFactorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** QR code image / svg; a labelled placeholder box is rendered when omitted. */
  qr?: ReactNode;
  setupKey: string;
  recoveryCodes?: string[];
  codeLength?: number;
  /** Called with the entered code when the form is submitted. */
  onSubmit?: (code: string) => void;
  submitLabel?: ReactNode;
}

/** `.oc-block-twofactor`: authenticator setup with QR, copyable key, OTP input and recovery codes. */
export const BlockTwoFactor = forwardRef<HTMLDivElement, BlockTwoFactorProps>(function BlockTwoFactor(
  { qr, setupKey, recoveryCodes, codeLength = 6, onSubmit, submitLabel = "Enable two-factor", className, ...rest },
  ref,
) {
  const id = `oc-twofactor-${useId().replace(/:/g, "")}`;
  const [code, setCode] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(code);
  };
  return (
    <div ref={ref} className={cx("oc-block-twofactor", className)} {...rest}>
      <section className="oc-block-twofactor-step">
        <Heading size="sm" title="1. Scan the QR code" description="Use an authenticator app, or enter the key manually." />
        <div className="oc-block-twofactor-center">
          {qr ?? <div className="oc-block-twofactor-qr" role="img" aria-label="QR code">QR code</div>}
          <CopyField value={setupKey} label="Setup key" />
        </div>
      </section>
      <form className="oc-block-twofactor-step" onSubmit={submit}>
        <Heading size="sm" title="2. Confirm with a code" />
        <div className="oc-field">
          <label className="oc-field-label" htmlFor={id}>Authentication code</label>
          <OtpInput id={id} name="code" length={codeLength} value={code} onChange={setCode} />
        </div>
        <button className="oc-btn" type="submit">{submitLabel}</button>
      </form>
      {recoveryCodes && (
        <section className="oc-block-twofactor-step">
          <RecoveryCodes codes={recoveryCodes} />
        </section>
      )}
    </div>
  );
});
