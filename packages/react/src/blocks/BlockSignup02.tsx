// File: packages/react/src/blocks/BlockSignup02.tsx | Map: BlockSignup02 (form first, brand panel with quote, terms checkbox)
// Snippet: packages/blocks/blocks/signup-02.html. Same form as BlockSignup01; only the defaults differ.
import { forwardRef } from "react";
import { SignupForm, panel } from "../blockParts/authForms";
import type { BlockSignupProps } from "../blockParts/authForms";

export type BlockSignup02Props = BlockSignupProps;

/** `.oc-block-authduo--reverse`: registration form next to a brand panel with a quote; the panel hides when narrow. */
export const BlockSignup02 = forwardRef<HTMLDivElement, BlockSignup02Props>(function BlockSignup02(props, ref) {
  return (
    <SignupForm
      ref={ref}
      defaults={{
        layout: "split",
        reverse: true,
        panel: panel("“Setup took ten minutes and the whole team was on board by lunch.”", "Customer 3, product manager"),
        title: "Create your account",
        text: "Free for 14 days, no card needed",
        terms: <>I agree to the <a className="oc-link" href="#">terms</a></>,
        submitLabel: "Create account",
        footer: <>Already registered? <a href="#">Sign in</a></>,
      }}
      {...props}
    />
  );
});
