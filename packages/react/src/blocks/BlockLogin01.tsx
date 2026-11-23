// File: packages/react/src/blocks/BlockLogin01.tsx | Map: re-exported auth types -> BlockLogin01 (centered card, e-mail + password, sign-up link)
// Snippet: packages/blocks/blocks/login-01.html. Same form as BlockLogin02/03; only the defaults differ.
import { forwardRef } from "react";
import { LoginForm } from "../blockParts/authForms";
import type { BlockLoginProps } from "../blockParts/authForms";

export type { AuthBlockBaseProps, AuthBlockLayout, AuthBlockPanel } from "../blockParts/AuthBlockFrame";
export type { BlockLoginProps, LoginValues } from "../blockParts/authForms";
export type BlockLogin01Props = BlockLoginProps;

/** `.oc-block-authpage` + `.oc-block-authcard`: centered sign-in card with e-mail, password and a link to sign up. */
export const BlockLogin01 = forwardRef<HTMLDivElement, BlockLogin01Props>(function BlockLogin01(props, ref) {
  return (
    <LoginForm
      ref={ref}
      defaults={{
        title: "Login to your account",
        text: "Enter your e-mail below to login",
        submitLabel: "Login",
        footer: <>Don&apos;t have an account? <a href="#">Sign up</a></>,
      }}
      {...props}
    />
  );
});
