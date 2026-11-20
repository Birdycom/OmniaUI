// File: packages/react/src/blocks/BlockSignup01.tsx | Map: re-exported types -> BlockSignup01 (card: name, e-mail, password, confirmation)
// Snippet: packages/blocks/blocks/signup-01.html. Same form as BlockSignup02; only the defaults differ.
import { forwardRef } from "react";
import { SignupForm } from "../blockParts/authForms";
import type { BlockSignupProps } from "../blockParts/authForms";

export type { BlockSignupProps, SignupValues } from "../blockParts/authForms";
export type BlockSignup01Props = BlockSignupProps;

/** `.oc-block-authpage` + `.oc-block-authcard`: create-account card with name, e-mail, password and confirmation. */
export const BlockSignup01 = forwardRef<HTMLDivElement, BlockSignup01Props>(function BlockSignup01(props, ref) {
  return (
    <SignupForm
      ref={ref}
      defaults={{
        title: "Create an account",
        text: "Enter your information to get started",
        confirmLabel: "Confirm password",
        hint: "Must be at least 8 characters long.",
        submitLabel: "Create account",
        footer: <>Already have an account? <a href="#">Sign in</a></>,
      }}
      {...props}
    />
  );
});
