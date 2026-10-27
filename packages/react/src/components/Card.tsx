import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
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

/** `.oc-card` */
export const Card = part<HTMLDivElement>("div", "oc-card", "Card");
/** `.oc-card-header` */
export const CardHeader = part<HTMLDivElement>("div", "oc-card-header", "CardHeader");
/** `h3.oc-card-title` */
export const CardTitle = part<HTMLHeadingElement>("h3", "oc-card-title", "CardTitle");
/** `p.oc-card-description` */
export const CardDescription = part<HTMLParagraphElement>("p", "oc-card-description", "CardDescription");
/** `.oc-card-content` */
export const CardContent = part<HTMLDivElement>("div", "oc-card-content", "CardContent");
/** `.oc-card-footer` */
export const CardFooter = part<HTMLDivElement>("div", "oc-card-footer", "CardFooter");
