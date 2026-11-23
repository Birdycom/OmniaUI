// File: packages/react/src/blocks/BlockForgotPassword.tsx | Map: re-exported types -> BlockForgotPassword (card: e-mail, send link, back link)
// Snippet: packages/blocks/blocks/forgot-password.html.
import { forwardRef } from "react";
import { ForgotForm } from "../blockParts/authForms";
import type { BlockForgotPasswordProps } from "../blockParts/authForms";

export type { BlockForgotPasswordProps, ForgotPasswordValues } from "../blockParts/authForms";

/** `.oc-block-authpage` + `.oc-block-authcard`: request a reset link with an e-mail field, submit and a back link. */
export const BlockForgotPassword = forwardRef<HTMLDivElement, BlockForgotPasswordProps>(function BlockForgotPassword(props, ref) {
  return (
    <ForgotForm
      ref={ref}
      defaults={{
        title: "Forgot your password?",
        text: "Enter your e-mail and we will send you a reset link",
        submitLabel: "Send reset link",
        footer: <a href="#">Back to sign in</a>,
      }}
      {...props}
    />
  );
});
