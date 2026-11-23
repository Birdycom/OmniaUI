// File: packages/react/src/blocks/BlockHeroCode.tsx | Map: types -> BlockHeroCode (copy: eyebrow, title, lead, actions -> code window with floating tiles)
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
  /** 0.17.0: heading level of the title (default 1; 2 for a block lower on the page, same look). */
  headingLevel?: 1 | 2;
  lead?: ReactNode;
  /** Buttons (usually two `oc-btn--gradient` / `oc-btn--glass` links). */
  actions?: ReactNode;
  /** File name in the code window bar. */
  codeTitle?: ReactNode;
  /** Code shown in the window. */
  code: string;
  /** Floating icon tiles (accent name from the accent palette + position style); `[]` for none. */
  tiles?: HeroTile[];
  /** Dark code window (`oc-code-window--dark`, as in the snippet). */
  codeDark?: boolean;
}

/** Landing hero: eyebrow, display title, lead, buttons and a code window with floating icon tiles. */
export const BlockHeroCode = forwardRef<HTMLElement, BlockHeroCodeProps>(function BlockHeroCode(
  { eyebrow, title, headingLevel = 1, lead, actions, codeTitle, code, tiles = DEFAULT_TILES, codeDark = false, className, ...rest },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container oc-split">
        <div>
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          <Heading className="oc-display">{title}</Heading>
          {lead != null && <p className="oc-lead">{lead}</p>}
          {actions != null && <div className="flex flex-wrap gap-1 mt-2">{actions}</div>}
        </div>
        <div className="relative p-2">
          {tiles.map((tile, i) => (
            <span key={i} className={`oc-icon-tile oc-icon-tile--float oc-accent--${tile.accent} absolute`} style={tile.style} aria-hidden="true">
              {tile.glyph}
            </span>
          ))}
          <div className={cx("oc-code-window", codeDark && "oc-code-window--dark")}>
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
