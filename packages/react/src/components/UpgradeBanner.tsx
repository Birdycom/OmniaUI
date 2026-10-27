// File: packages/react/src/components/UpgradeBanner.tsx
// Map: UpgradeBanner = aside -> icon -> body (title + plan pill, text, usage meter) -> actions -> dismiss button
// The dismiss button only shows when `onDismiss` is given; your app then hides or removes the banner.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface UpgradeBannerUsage {
  label: ReactNode;
  value: number;
  max: number;
}

export interface UpgradeBannerProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Plan pill next to the title, e.g. "Free". */
  plan?: ReactNode;
  /** Explanation; also accepted as children. */
  text?: ReactNode;
  usage?: UpgradeBannerUsage;
  icon?: ReactNode;
  actions?: ReactNode;
  premium?: boolean;
  compact?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
}

/** `.oc-upgrade-banner`: free-plan limits callout with an upgrade action. */
export const UpgradeBanner = forwardRef<HTMLElement, UpgradeBannerProps>(function UpgradeBanner(
  { title, plan, text, usage, icon, actions, premium, compact, onDismiss, dismissLabel = "Dismiss", className, children, ...rest },
  ref,
) {
  const cls = cx("oc-upgrade-banner", premium && "oc-upgrade-banner--premium", compact && "oc-upgrade-banner--compact", className);
  const body = text ?? children;
  return (
    <aside ref={ref} className={cls} {...rest}>
      {icon != null && <span className="oc-upgrade-banner-icon" aria-hidden="true">{icon}</span>}
      <div className="oc-upgrade-banner-body">
        <p className="oc-upgrade-banner-title">
          {title}
          {plan != null && <> <span className="oc-upgrade-banner-plan">{plan}</span></>}
        </p>
        {body != null && <p className="oc-upgrade-banner-text">{body}</p>}
        {usage && (
          <div className="oc-upgrade-banner-usage">
            <span>{usage.label}</span>
            {/* low / high make the meter turn "less good" near the limit. */}
            <meter className="oc-upgrade-banner-meter" min={0} max={usage.max} low={usage.max * 0.6} high={usage.max * 0.8} optimum={0} value={usage.value}>
              {usage.value} of {usage.max}
            </meter>
            <span>{usage.value} / {usage.max}</span>
          </div>
        )}
      </div>
      {actions != null && <div className="oc-upgrade-banner-actions">{actions}</div>}
      {onDismiss && (
        <button className="oc-upgrade-banner-dismiss" type="button" aria-label={dismissLabel} onClick={onDismiss}>×</button>
      )}
    </aside>
  );
});
