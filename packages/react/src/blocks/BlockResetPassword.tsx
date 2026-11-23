// File: packages/react/src/blocks/BlockResetPassword.tsx | Map: re-exported types -> BlockResetPassword (card: new password, confirmation, hint)
// Snippet: packages/blocks/blocks/reset-password.html.
import { forwardRef } from "react";
import { ResetForm } from "../blockParts/authForms";
import type { BlockResetPasswordProps } from "../blockParts/authForms";

export type { BlockResetPasswordProps, ResetPasswordValues } from "../blockParts/authForms";

/** `.oc-block-authpage` + `.oc-block-authcard`: choose a new password with reveal, confirmation, a rules hint and submit. */
export const BlockResetPassword = forwardRef<HTMLDivElement, BlockResetPasswordProps>(function BlockResetPassword(props, ref) {
  return (
    <ResetForm
      ref={ref}
      defaults={{
        title: "Set a new password",
        text: "Your new password must differ from earlier ones",
        hint: "At least 8 characters, with a number and a symbol.",
        submitLabel: "Reset password",
        footer: <a href="#">Back to sign in</a>,
      }}
      {...props}
    />
  );
});
