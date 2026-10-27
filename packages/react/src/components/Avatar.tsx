import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  /** Image URL; when set the avatar renders an <img>. Otherwise `children` (initials) are shown. */
  src?: string;
  alt?: string;
}

/** `<span class="oc-avatar oc-avatar--{size}">SC</span>` */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = "md", src, alt = "", className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx("oc-avatar", size !== "md" && `oc-avatar--${size}`, className)} {...rest}>
      {src ? <img src={src} alt={alt} /> : children}
    </span>
  );
});

/** `<div class="oc-avatar-group">` */
export const AvatarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AvatarGroup(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("oc-avatar-group", className)} {...rest} />;
});
