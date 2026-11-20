// File: packages/react/src/blocks/BlockOtp02.tsx | Map: BlockOtp02 (muted brand panel + verification form)
// Snippet: packages/blocks/blocks/otp-02.html. Same form as BlockOtp01; only the defaults differ.
import { forwardRef } from "react";
import { OtpForm, panel } from "../blockParts/authForms";
import type { BlockOtpProps } from "../blockParts/authForms";

export type BlockOtp02Props = BlockOtpProps;

/** `.oc-block-authduo`: verification form beside a brand panel (container-query split). */
export const BlockOtp02 = forwardRef<HTMLDivElement, BlockOtp02Props>(function BlockOtp02(props, ref) {
  return (
    <OtpForm
      ref={ref}
      defaults={{
        layout: "split",
        panel: panel("“Two-step verification keeps our client data where it belongs.”", "Security team", "muted"),
        title: "Verify your login",
        text: "Enter the code from your authenticator app",
        description: "Enter the 6-digit code we sent to your authenticator app.",
        submitLabel: "Verify",
        footer: <>Lost your device? <a href="#">Use a recovery code</a></>,
      }}
      {...props}
    />
  );
});
