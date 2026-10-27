import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Avatar } from "./Avatar";
import type { AvatarSize } from "./Avatar";

export interface UserProps extends HTMLAttributes<HTMLDivElement> {
  name: ReactNode;
  email?: ReactNode;
  /** Initials shown in the avatar. */
  initials?: string;
  /** Avatar image URL (wins over initials). */
  avatarSrc?: string;
  avatarSize?: AvatarSize;
}

/** `.oc-user`: avatar with name and e-mail. */
export const User = forwardRef<HTMLDivElement, UserProps>(function User(
  { name, email, initials, avatarSrc, avatarSize = "md", className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-user", className)} {...rest}>
      <Avatar size={avatarSize} src={avatarSrc}>{initials}</Avatar>
      <span className="oc-user-text">
        <span className="oc-user-name">{name}</span>
        {email != null && <span className="oc-user-email">{email}</span>}
      </span>
    </div>
  );
});
