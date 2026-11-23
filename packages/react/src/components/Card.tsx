import { forwardRef } from "react";
import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

type Tag = "div" | "h3" | "p";

function part<E extends HTMLElement>(tag: Tag, base: string, displayName: string) {
  const Comp = forwardRef<E, HTMLAttributes<E>>(function Part({ className, ...rest }, ref) {
    const Element = tag as "div";
    return <Element ref={ref as React.Ref<HTMLDivElement>} className={cx(base, className)} {...(rest as HTMLAttributes<HTMLDivElement>)} />;
  });
  Comp.displayName = displayName;
  return Comp;
}

export type CardTone = "primary" | "info" | "success" | "warning" | "destructive" | "test" | "live";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** A 2px border in this tone or mode (`oc-card--accent` + data-tone); pair with `<CardBand>` for a band at the top. */
  accent?: CardTone;
  /** With `accent`: a set that is not in use now (dashed border, calm band). */
  inactive?: boolean;
  /** As high as its grid or flex cell, content grows, footer at the bottom (`oc-card--fill`): equal cards in a row. */
  fill?: boolean;
}

/** `.oc-card` (with `accent`: `.oc-card--accent[data-tone]`) */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ accent, inactive, fill, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cx("oc-card", accent && "oc-card--accent", fill && "oc-card--fill", className)}
      data-tone={accent}
      data-active={accent && inactive ? "false" : undefined}
      {...rest}
    />
  );
});

export interface CardBandProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Title of the band; `description` goes under it in smaller text. */
  title?: ReactNode;
  description?: ReactNode;
  /** Before the title (a ModeBadge, an icon). */
  start?: ReactNode;
}

/** `.oc-card-band`: the colored band at the top of an accent card: start (badge), title + description, then children (status). */
export const CardBand = forwardRef<HTMLDivElement, CardBandProps>(function CardBand({ title, description, start, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("oc-card-band", className)} {...rest}>
      {start}
      {(title != null || description != null) && (
        <p className="oc-card-band__title">{title}{description != null && <small>{description}</small>}</p>
      )}
      {children}
    </div>
  );
});
/** `.oc-card-header` */
export const CardHeader = part<HTMLDivElement>("div", "oc-card-header", "CardHeader");
/** `h3.oc-card-title` */
export const CardTitle = part<HTMLHeadingElement>("h3", "oc-card-title", "CardTitle");
/** `p.oc-card-description` */
export const CardDescription = part<HTMLParagraphElement>("p", "oc-card-description", "CardDescription");
/** `.oc-card-content` */
export const CardContent = part<HTMLDivElement>("div", "oc-card-content", "CardContent");
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** A line above the footer (`oc-card-footer--divider`). */
  divider?: boolean;
  /** The actions on the end side (`oc-card-footer--end`). */
  end?: boolean;
}

/** `.oc-card-footer` (`divider`: a line above it, `end`: actions on the end side) */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter({ divider, end, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-card-footer", divider && "oc-card-footer--divider", end && "oc-card-footer--end", className)} {...rest} />;
});
/** `.oc-card-action`: in the CardHeader, sits in the top-right corner (a menu, a badge, a close button). */
export const CardAction = part<HTMLDivElement>("div", "oc-card-action", "CardAction");
/** `p.oc-card-text`: body text in the muted color. */
export const CardText = part<HTMLParagraphElement>("p", "oc-card-text", "CardText");

/** `a.oc-card-link`: a small link in the primary color (in the footer: "Manage members"). */
export const CardLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function CardLink({ className, ...rest }, ref) {
  return <a ref={ref} className={cx("oc-card-link", className)} {...rest} />;
});

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Smallest card width before the grid wraps (`--oc-card-min`, default 17rem). A number is read as rem. */
  min?: string | number;
  /** Space between the cards (`--oc-card-gap`, default 1.25rem). A number is read as rem. */
  gap?: string | number;
  /** The cards share their rows (`oc-card-grid--bands`, subgrid): bands, content and footers line up side by side. */
  bands?: boolean;
  /** Wide cards from 32rem, three in a row on a wide screen (`oc-card-grid--wide`). */
  wide?: boolean;
  /** Fewer cards than fit in a row stretch over the full width (`oc-card-grid--fit`). */
  fit?: boolean;
}

const rem = (v: string | number | undefined) => (typeof v === "number" ? `${v}rem` : v);

/** `.oc-card-grid`: a responsive grid of cards (auto-fill columns of at least `min`). */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(function CardGrid({ min, gap, bands, wide, fit, className, style, ...rest }, ref) {
  const vars = { ...(min != null && { "--oc-card-min": rem(min) }), ...(gap != null && { "--oc-card-gap": rem(gap) }) };
  return (
    <div
      ref={ref}
      className={cx("oc-card-grid", bands && "oc-card-grid--bands", wide && "oc-card-grid--wide", fit && "oc-card-grid--fit", className)}
      style={Object.keys(vars).length ? ({ ...vars, ...style } as CSSProperties) : style}
      {...rest}
    />
  );
});
