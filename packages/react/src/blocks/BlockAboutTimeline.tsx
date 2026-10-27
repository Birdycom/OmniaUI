// File: packages/react/src/blocks/BlockAboutTimeline.tsx | Map: props -> BlockAboutTimeline (media + badge -> copy -> timeline)
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Timeline } from "../components/Timeline";
import type { TimelineEntry } from "../components/Timeline";

export interface BlockAboutTimelineProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Heading; wrap a part in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  /** Paragraphs (or any content) below the title. */
  children?: ReactNode;
  timeline?: TimelineEntry[];
  /** Picture URL; without it the media is an accent gradient. */
  image?: string;
  imageAlt?: string;
  /** Badge on the picture (e.g. <><strong>12+</strong>years</>). */
  badge?: ReactNode;
  /** Picture on the right. */
  reverse?: boolean;
}

/** `.oc-block-about`: picture next to the company story with a year timeline. */
export const BlockAboutTimeline = forwardRef<HTMLElement, BlockAboutTimelineProps>(function BlockAboutTimeline(
  { eyebrow, title, children, timeline = [], image, imageAlt = "", badge, reverse = false, className, ...rest },
  ref,
) {
  const titleId = `oc-about-title-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <section ref={ref} className={cx("oc-block-about", reverse && "oc-block-about--reverse", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-about-inner">
        <figure className="oc-block-about-media" aria-hidden={image ? undefined : true}>
          {image && <img src={image} alt={imageAlt} loading="lazy" />}
          {badge != null && <span className="oc-block-about-badge">{badge}</span>}
        </figure>
        <div className="oc-block-about-copy">
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <h2 className="oc-block-about-title" id={titleId}>{title}</h2>
          {children}
          {timeline.length > 0 && <Timeline items={timeline} />}
        </div>
      </div>
    </section>
  );
});
