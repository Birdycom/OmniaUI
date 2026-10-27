import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cx } from "../utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/** `<textarea class="oc-input">` */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ error, className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx("oc-input", error && "oc-input--error", className)}
      aria-invalid={error ? true : rest["aria-invalid"]}
      {...rest}
    />
  );
});
