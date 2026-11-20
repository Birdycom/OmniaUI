// File: packages/react/src/blocks/BlockHeroOrbit.tsx | Map: types + defaults -> BlockHeroOrbit (copy -> visual: ring with marks + center)
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface HeroOrbitMark {
  glyph: ReactNode;
  /** Accent preset (green, violet, orange, cyan, red, yellow, blue). */
  accent: string;
  /** Own angle in degrees (0.17.0); without it the marks are spread evenly from `startAngle`. */
  angle?: number;
}

const DEFAULT_MARKS: HeroOrbitMark[] = [
  { glyph: "◆", accent: "green" },
  { glyph: "◉", accent: "violet" },
  { glyph: "▲", accent: "orange" },
  { glyph: "★", accent: "cyan" },
  { glyph: "♥", accent: "red" },
  { glyph: "☀", accent: "yellow" },
];

export interface BlockHeroOrbitProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Marks on the ring; they are spread evenly. */
  marks?: HeroOrbitMark[];
  codeTitle?: ReactNode;
  code?: string;
  /** Replaces the code window in the center. Give it className="oc-block-orbit-center". */
  center?: ReactNode;
  /** One turn, e.g. "30s" (default 60s). */
  duration?: string;
  /** 0.17.0: heading level of the title; 2 renders an `h2.oc-display--md` (a hero lower on the page). */
  headingLevel?: 1 | 2;
  /** 0.17.0: wider copy column (`.oc-split--lead`). */
  splitLead?: boolean;
  /** 0.17.0: up to eight marks float on fixed places around the window instead of turning (`.oc-block-orbit-visual--float`). */
  float?: boolean;
  /** 0.17.0: angle of the first mark in degrees (default 0). */
  startAngle?: number;
  /** 0.17.0: size of the marks (default "sm"; "md" is the normal product mark). */
  markSize?: "sm" | "md" | "lg";
  /** 0.17.0: soft marks (`.oc-product-mark--soft`). */
  softMarks?: boolean;
  /** 0.17.0: a big product mark in the center instead of the code window (`center` still wins). */
  centerMark?: { glyph: ReactNode; accent?: string };
}

/** Hero with a code window and product marks that orbit around it. */
export const BlockHeroOrbit = forwardRef<HTMLElement, BlockHeroOrbitProps>(function BlockHeroOrbit(
  {
    eyebrow, title, lead, actions, marks = DEFAULT_MARKS, codeTitle, code = "", center, duration,
    headingLevel = 1, splitLead = false, float = false, startAngle = 0, markSize = "sm", softMarks = false, centerMark,
    className, ...rest
  },
  ref,
) {
  const visualStyle = duration ? ({ "--oc-orbit-duration": duration } as CSSProperties) : undefined;
  const Heading = headingLevel === 2 ? "h2" : "h1";
  const markClass = cx("oc-product-mark", markSize !== "md" && `oc-product-mark--${markSize}`, softMarks && "oc-product-mark--soft");
  return (
    <section ref={ref} className={cx("oc-block-orbit oc-section-pad", className)} {...rest}>
      <div className={cx("oc-container oc-split", splitLead && "oc-split--lead")}>
        <div>
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <Heading className={cx("oc-display", headingLevel === 2 && "oc-display--md")}>{title}</Heading>
          {lead != null && <p className="oc-lead">{lead}</p>}
          {actions != null && <div className="flex flex-wrap gap-1 mt-2">{actions}</div>}
        </div>
        <div className={cx("oc-block-orbit-visual", float && "oc-block-orbit-visual--float")} style={visualStyle}>
          <div className="oc-block-orbit-ring" aria-hidden="true">
            {marks.map((mark, i) => (
              <span key={i} className="oc-block-orbit-mark"
                style={float ? undefined : ({ "--oc-orbit-angle": `${mark.angle ?? startAngle + (360 / marks.length) * i}deg` } as CSSProperties)}>
                <span className={cx(markClass, `oc-accent--${mark.accent}`)}>{mark.glyph}</span>
              </span>
            ))}
          </div>
          {center ?? (centerMark ? (
            <span className={cx("oc-block-orbit-center oc-product-mark oc-product-mark--xl", centerMark.accent && `oc-accent--${centerMark.accent}`)}
              style={{ inlineSize: "var(--oc-mark-size)" }} aria-hidden="true">{centerMark.glyph}</span>
          ) : (
            <div className="oc-code-window oc-block-orbit-center">
              <div className="oc-code-window__bar">
                <i /><i /><i />
                {codeTitle != null && <span className="oc-code-window__title">{codeTitle}</span>}
              </div>
              <pre className="oc-code-window__body">{code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
