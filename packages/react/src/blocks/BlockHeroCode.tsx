import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface HeroTile {
  glyph: ReactNode;
  accent: string;
  style: CSSProperties;
}

const DEFAULT_TILES: HeroTile[] = [
  { glyph: "◆", accent: "green", style: { inset: "-0.5rem auto auto 8%" } },
  { glyph: "◉", accent: "violet", style: { inset: "0 6% auto auto", animationDelay: "-2s" } },
  { glyph: "▲", accent: "orange", style: { inset: "auto 10% -0.5rem auto", animationDelay: "-4s" } },
];

export interface BlockHeroCodeProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  lead?: ReactNode;
  /** Buttons (usually two `oc-btn--gradient` / `oc-btn--glass` links). */
  actions?: ReactNode;
  /** File name in the code window bar. */
  codeTitle?: ReactNode;
  /** Code shown in the window. */
  code: string;
  /** Floating icon tiles (accent name from the accent palette + position style). */
  tiles?: HeroTile[];
}

/** Landing hero: eyebrow, display title, lead, buttons and a code window with floating icon tiles. */
export const BlockHeroCode = forwardRef<HTMLElement, BlockHeroCodeProps>(function BlockHeroCode(
  { eyebrow, title, lead, actions, codeTitle, code, tiles = DEFAULT_TILES, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container oc-split">
        <div>
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <h1 className="oc-display">{title}</h1>
          {lead != null && <p className="oc-lead">{lead}</p>}
          {actions != null && <div className="flex flex-wrap gap-1 mt-2">{actions}</div>}
        </div>
        <div className="relative p-2">
          {tiles.map((tile, i) => (
            <span key={i} className={`oc-icon-tile oc-icon-tile--float oc-accent--${tile.accent} absolute`} style={tile.style} aria-hidden="true">
              {tile.glyph}
            </span>
          ))}
          <div className="oc-code-window">
            <div className="oc-code-window__bar">
              <i /><i /><i />
              {codeTitle != null && <span className="oc-code-window__title">{codeTitle}</span>}
            </div>
            <pre className="oc-code-window__body">{code}</pre>
          </div>
        </div>
      </div>
    </section>
  );
});
