import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface SpotlightModule {
  icon?: ReactNode;
  label: ReactNode;
}

export interface BlockSpotlightProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Accent name (`green`, `violet`...), applied as `oc-accent--{accent}`. */
  accent?: string;
  /** Pill text (with a status dot). */
  badge?: ReactNode;
  /** Glyph or SVG in the big icon tile. */
  icon?: ReactNode;
  title: ReactNode;
  tagline?: ReactNode;
  lead?: ReactNode;
  /** Call to action (e.g. a `ButtonLink` with `variant="gradient" size="lg"`). */
  action?: ReactNode;
  modules?: SpotlightModule[];
}

/** `.oc-spotlight`: highlighted flagship product with a module list. */
export const BlockSpotlight = forwardRef<HTMLElement, BlockSpotlightProps>(function BlockSpotlight(
  { accent, badge, icon, title, tagline, lead, action, modules, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container">
        <div className={cx("oc-spotlight", accent && `oc-accent--${accent}`)}>
          <div>
            {badge != null && <span className="oc-pill oc-pill--accent"><span className="oc-status-dot" />{badge}</span>}
            <h2 className="oc-spotlight__title">
              {icon != null && <span className="oc-icon-tile oc-icon-tile--lg" aria-hidden="true">{icon}</span>}
              {title}
            </h2>
            {tagline != null && <p className="oc-spotlight__tagline">{tagline}</p>}
            {lead != null && <p className="oc-lead">{lead}</p>}
            {action}
          </div>
          {modules && (
            <ul className="oc-spotlight__modules">
              {modules.map((m, i) => (
                <li key={i}>
                  {m.icon != null && <span className="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">{m.icon}</span>}
                  {m.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
});
