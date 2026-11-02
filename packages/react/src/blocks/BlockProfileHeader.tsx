// File: packages/react/src/blocks/BlockProfileHeader.tsx | Map: types -> BlockProfileHeader (banner -> bar (avatar, info, actions) -> tabs)
import { forwardRef, useId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ProfileHeaderTab {
  label: ReactNode;
  /** A link per tab (a route in your app); leave out and give content for tabs on the page itself. */
  href?: string;
  /** The open tab (aria-current for links, checked for tabs with content). */
  current?: boolean;
  /** Panel content: with content the tabs switch on the page itself (radios + panels, CSS only). */
  content?: ReactNode;
}

export interface BlockProfileHeaderProps extends HTMLAttributes<HTMLElement> {
  name: ReactNode;
  meta?: ReactNode;
  bio?: ReactNode;
  /** Initials, or an <img> for the avatar. */
  avatar: ReactNode;
  /** Banner image URL; without it the banner is an accent gradient. */
  banner?: string;
  actions?: ReactNode;
  tabs?: ProfileHeaderTab[];
  tabsLabel?: string;
  compact?: boolean;
  /** Heading level of the name (h1 on a profile page, h2 inside a page). */
  headingLevel?: 1 | 2;
}

/** `.oc-block-profile`: banner, overhanging avatar, name, meta, actions and tabs (links, or panels on the page). */
export const BlockProfileHeader = forwardRef<HTMLElement, BlockProfileHeaderProps>(function BlockProfileHeader(
  { name, meta, bio, avatar, banner, actions, tabs = [], tabsLabel = "Profile sections", compact = false, headingLevel = 1, className, ...rest },
  ref,
) {
  const nameId = `oc-profile-name-${useId().replace(/[^\w-]/g, "")}`;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const panels = tabs.some((tab) => tab.content != null);
  const bannerStyle = banner ? ({ "--oc-profile-banner": `url("${banner}")` } as CSSProperties) : undefined;
  return (
    <section ref={ref} className={cx("oc-block-profile", compact && "oc-block-profile--compact", className)} aria-labelledby={nameId} {...rest}>
      <div className="oc-block-profile-banner" style={bannerStyle} aria-hidden="true" />
      <div className="oc-block-profile-bar">
        <span className="oc-avatar oc-block-profile-avatar" aria-hidden="true">{avatar}</span>
        <div className="oc-block-profile-info">
          <Heading className="oc-block-profile-name" id={nameId}>{name}</Heading>
          {meta != null && <p className="oc-block-profile-meta">{meta}</p>}
          {bio != null && <p className="oc-block-profile-bio">{bio}</p>}
        </div>
        {actions != null && <div className="oc-block-profile-actions">{actions}</div>}
      </div>
      {tabs.length > 0 && panels && (
        <>
          <div className="oc-block-profile-tabs" role="radiogroup" aria-label={tabsLabel}>
            {tabs.map((tab, i) => (
              <label key={i} className="oc-block-profile-tab"><input type="radio" name={`${nameId}-tab`} defaultChecked={tab.current ?? i === 0} />{tab.label}</label>
            ))}
          </div>
          <div className="oc-block-profile-panels">
            {tabs.map((tab, i) => <div key={i} className="oc-block-profile-panel">{tab.content}</div>)}
          </div>
        </>
      )}
      {tabs.length > 0 && !panels && (
        <nav className="oc-block-profile-tabs" aria-label={tabsLabel}>
          {tabs.map((tab, i) => (
            <a key={i} className="oc-block-profile-tab" href={tab.href} aria-current={tab.current ? "page" : undefined}>{tab.label}</a>
          ))}
        </nav>
      )}
    </section>
  );
});
