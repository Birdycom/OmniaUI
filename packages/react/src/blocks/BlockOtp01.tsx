// File: packages/react/src/blocks/BlockOtp01.tsx | Map: re-exported types -> BlockOtp01 (card: code cells, verify, resend link)
// Snippet: packages/blocks/blocks/otp-01.html. Same form as BlockOtp02; only the defaults differ.
import { forwardRef } from "react";
import { OtpForm } from "../blockParts/authForms";
import type { BlockOtpProps } from "../blockParts/authForms";

export type { BlockOtpProps, OtpValues } from "../blockParts/authForms";
export type BlockOtp01Props = BlockOtpProps;

/** `.oc-block-authpage` + `.oc-otp`: verification card with a six-digit code, verify button and a resend link. */
export const BlockOtp01 = forwardRef<HTMLDivElement, BlockOtp01Props>(function BlockOtp01(props, ref) {
  return (
    <OtpForm
      ref={ref}
      defaults={{
        title: "Enter verification code",
        text: "We sent a 6-digit code to your e-mail",
        description: "Enter the 6-digit code we sent to name@company1.example.",
        submitLabel: "Verify",
        footer: <>Didn&apos;t receive the code? <a href="#">Resend</a></>,
      }}
      {...props}
    />
  );
});
