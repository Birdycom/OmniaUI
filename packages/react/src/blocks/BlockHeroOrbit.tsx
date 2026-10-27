// File: packages/react/src/blocks/BlockHeroOrbit.tsx | Map: types + defaults -> BlockHeroOrbit (copy -> visual: ring with marks + center)
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface HeroOrbitMark {
  glyph: ReactNode;
  /** Accent preset (green, violet, orange, cyan, red, yellow, blue). */
  accent: string;
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
}

/** Hero with a code window and product marks that orbit around it. */
export const BlockHeroOrbit = forwardRef<HTMLElement, BlockHeroOrbitProps>(function BlockHeroOrbit(
  { eyebrow, title, lead, actions, marks = DEFAULT_MARKS, codeTitle, code = "", center, duration, className, ...rest },
  ref,
) {
  const visualStyle = duration ? ({ "--oc-orbit-duration": duration } as CSSProperties) : undefined;
  return (
    <section ref={ref} className={cx("oc-block-orbit oc-section-pad", className)} {...rest}>
      <div className="oc-container oc-split">
        <div>
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <h1 className="oc-display">{title}</h1>
          {lead != null && <p className="oc-lead">{lead}</p>}
          {actions != null && <div className="flex flex-wrap gap-1 mt-2">{actions}</div>}
        </div>
        <div className="oc-block-orbit-visual" style={visualStyle}>
          <div className="oc-block-orbit-ring" aria-hidden="true">
            {marks.map((mark, i) => (
              <span key={i} className="oc-block-orbit-mark" style={{ "--oc-orbit-angle": `${(360 / marks.length) * i}deg` } as CSSProperties}>
                <span className={`oc-product-mark oc-product-mark--sm oc-accent--${mark.accent}`}>{mark.glyph}</span>
              </span>
            ))}
          </div>
          {center ?? (
            <div className="oc-code-window oc-block-orbit-center">
              <div className="oc-code-window__bar">
                <i /><i /><i />
                {codeTitle != null && <span className="oc-code-window__title">{codeTitle}</span>}
              </div>
              <pre className="oc-code-window__body">{code}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
