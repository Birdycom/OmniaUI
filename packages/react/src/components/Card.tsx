import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
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
