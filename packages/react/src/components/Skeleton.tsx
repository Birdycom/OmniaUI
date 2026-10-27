import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "circle" | "title" | "text" | "rect";
}

/** `<div class="oc-skeleton oc-skeleton--{variant}">` */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton({ variant, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-skeleton", variant && `oc-skeleton--${variant}`, className)} {...rest} />;
});
