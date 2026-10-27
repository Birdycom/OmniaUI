// File: packages/react/src/blocks/BlockContactGrid.tsx | Map: types -> BlockContactGrid (head -> grid of cards (mark, title, lines))
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ContactGridLine {
  text: ReactNode;
  /** Makes the line a link (mailto:, tel:, https:). */
  href?: string;
}

export interface ContactGridCard {
  title: ReactNode;
  lines: ContactGridLine[];
  /** Glyph in a soft product mark. */
  icon?: ReactNode;
  /** Accent preset of the mark (green, violet, ...). */
  accent?: string;
  /** Renders the card as <address>. */
  address?: boolean;
}

export interface BlockContactGridProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  cards: ContactGridCard[];
  /** No card frames. */
  plain?: boolean;
}

/** `.oc-block-contact`: contact info cards (e-mail, phone, address, hours). */
export const BlockContactGrid = forwardRef<HTMLElement, BlockContactGridProps>(function BlockContactGrid(
  { eyebrow, title, lead, cards, plain = false, className, ...rest },
  ref,
) {
  const titleId = `oc-contact-title-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <section ref={ref} className={cx("oc-block-contact", plain && "oc-block-contact--plain", className)} aria-labelledby={title != null ? titleId : undefined} {...rest}>
      {(eyebrow != null || title != null || lead != null) && (
        <div className="oc-block-contact-head">
          {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
          {title != null && <h2 className="oc-block-contact-heading" id={titleId}>{title}</h2>}
          {lead != null && <p className="oc-block-contact-lead">{lead}</p>}
        </div>
      )}
      <div className="oc-block-contact-grid">
        {cards.map((card, i) => {
          const Card = card.address ? "address" : "article";
          const Title = card.address ? "span" : "h3";
          const Line = card.address ? "span" : "p";
          return (
            <Card className="oc-block-contact-card" key={i}>
              {card.icon != null && (
                <span className={cx("oc-product-mark oc-product-mark--sm oc-product-mark--soft", card.accent && `oc-accent--${card.accent}`)} aria-hidden="true">{card.icon}</span>
              )}
              <Title className="oc-block-contact-title">{card.title}</Title>
              {card.lines.map((line, j) =>
                line.href ? (
                  <a className="oc-block-contact-line" href={line.href} key={j}>{line.text}</a>
                ) : (
                  <Line className="oc-block-contact-line" key={j}>{line.text}</Line>
                ),
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
});
