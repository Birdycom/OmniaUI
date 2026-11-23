// File: packages/react/src/blocks/BlockLogin03.tsx | Map: BlockLogin03 (muted page, social buttons, divider, e-mail form, legal line)
// Snippet: packages/blocks/blocks/login-03.html. Same form as BlockLogin01/02; only the defaults differ.
import { forwardRef } from "react";
import { LoginForm } from "../blockParts/authForms";
import type { BlockLoginProps } from "../blockParts/authForms";

export type BlockLogin03Props = BlockLoginProps;

/** `.oc-block-authpage` (muted) + `.oc-block-authsocial`: card with social sign-in buttons above the e-mail form. */
export const BlockLogin03 = forwardRef<HTMLDivElement, BlockLogin03Props>(function BlockLogin03(props, ref) {
  return (
    <LoginForm
      ref={ref}
      defaults={{
        muted: true,
        title: "Welcome back",
        text: "Login with your Apple or Google account",
        social: ["Apple", "Google"],
        dividerLabel: "Or continue with",
        submitLabel: "Login",
        footer: <>Don&apos;t have an account? <a href="#">Sign up</a></>,
        legal: <>By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</>,
      }}
      {...props}
    />
  );
});
