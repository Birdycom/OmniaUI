import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cx } from "../utils";

/** `<a class="oc-back-link">Back to Products</a>` */
export const BackLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function BackLink(
  { className, ...rest },
  ref,
) {
  return <a ref={ref} className={cx("oc-back-link", className)} {...rest} />;
});
