// File: packages/react/src/blocks/BlockLogin02.tsx | Map: BlockLogin02 (brand panel with quote + sign-in form, remember me / forgot password)
// Snippet: packages/blocks/blocks/login-02.html. Same form as BlockLogin01/03; only the defaults differ.
import { forwardRef } from "react";
import { LoginForm, panel } from "../blockParts/authForms";
import type { BlockLoginProps } from "../blockParts/authForms";

export type BlockLogin02Props = BlockLoginProps;

/** `.oc-block-authduo`: brand panel with a quote next to the sign-in form; the panel hides when the block is narrow. */
export const BlockLogin02 = forwardRef<HTMLDivElement, BlockLogin02Props>(function BlockLogin02(props, ref) {
  return (
    <LoginForm
      ref={ref}
      defaults={{
        layout: "split",
        panel: panel("“This workspace saved me hours of admin every week.”", "Customer 1, operations lead"),
        title: "Welcome back",
        text: "Sign in to your workspace",
        rememberLabel: "Remember me",
        forgot: { label: "Forgot password?", href: "#" },
        submitLabel: "Sign in",
        footer: <>No account yet? <a href="#">Create one</a></>,
      }}
      {...props}
    />
  );
});
