import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Badge } from "../components/Badge";
import type { BadgeVariant } from "../components/Badge";
import { Dropdown } from "../components/Dropdown";
import { User } from "../components/User";

export interface TeamMember {
  name: ReactNode;
  email?: ReactNode;
  initials?: string;
  avatarSrc?: string;
  /** Role / status badge text. */
  role?: ReactNode;
  roleVariant?: BadgeVariant;
  /** Row action menu content (`DropdownItem`s). Adds a "..." trigger when set. */
  menu?: ReactNode;
  menuLabel?: string;
}

export interface BlockTeamListProps extends HTMLAttributes<HTMLDivElement> {
  members: TeamMember[];
}

/** `.oc-block-team`: member rows with avatar, role badge and a row action menu. */
export const BlockTeamList = forwardRef<HTMLDivElement, BlockTeamListProps>(function BlockTeamList(
  { members, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-team", className)} {...rest}>
      {members.map((m, i) => (
        <div className="oc-block-team-row" key={i}>
          <User name={m.name} email={m.email} initials={m.initials} avatarSrc={m.avatarSrc} />
          <div className="oc-block-team-meta">
            {m.role != null && <Badge variant={m.roleVariant}>{m.role}</Badge>}
            {m.menu != null && (
              <Dropdown trigger={<>&hellip;</>} triggerProps={{ variant: "ghost", icon: true, size: "sm", type: "button", "aria-label": m.menuLabel ?? "Member actions" }}>
                {m.menu}
              </Dropdown>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
