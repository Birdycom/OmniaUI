// Same markup as packages/ui/snippets/item.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ItemProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  variant?: "default" | "outline" | "muted";
  size?: "sm" | "md";
  /** Hover and focus styles (`oc-item--interactive`). */
  interactive?: boolean;
  /** Renders an `<a>`. */
  href?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Left column (`.oc-item-media`): an icon, avatar or image. */
  media?: ReactNode;
  /** Box the media as an icon (`oc-item-media--icon`). */
  icon?: boolean;
  /** The media is an image (`oc-item-media--image`). */
  image?: boolean;
  /** Right column (`.oc-item-actions`): buttons, a badge. */
  actions?: ReactNode;
  /** Full-width row above (`.oc-item-header`). */
  header?: ReactNode;
  /** Full-width row below (`.oc-item-footer`). */
  footer?: ReactNode;
}

/** List row (`.oc-item`): media, content (title + description, or children instead), actions. */
export const Item = forwardRef<HTMLElement, ItemProps>(function Item(
  { variant = "default", size = "md", interactive, href, title, description, media, icon, image, actions, header, footer, className, children, ...rest },
  ref,
) {
  const Tag = (href ? "a" : "div") as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      {...(href ? { href } : {})}
      className={cx("oc-item", variant !== "default" && `oc-item--${variant}`, size === "sm" && "oc-item--sm", interactive && "oc-item--interactive", className)}
      {...rest}
    >
      {header != null && <div className="oc-item-header">{header}</div>}
      {media != null && <div className={cx("oc-item-media", icon && "oc-item-media--icon", image && "oc-item-media--image")}>{media}</div>}
      <div className="oc-item-content">
        {children ?? (
          <>
            {title != null && <p className="oc-item-title">{title}</p>}
            {description != null && <p className="oc-item-description">{description}</p>}
          </>
        )}
      </div>
      {actions != null && <div className="oc-item-actions">{actions}</div>}
      {footer != null && <div className="oc-item-footer">{footer}</div>}
    </Tag>
  );
});

/** Vertical list of items (`.oc-item-group`); put `<ItemSeparator>` between them for lines. */
export const ItemGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ItemGroup({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-item-group", className)} {...rest} />;
});

/** Divider between items: `<hr class="oc-item-separator">`. */
export const ItemSeparator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(function ItemSeparator({ className, ...rest }, ref) {
  return <hr ref={ref} className={cx("oc-item-separator", className)} {...rest} />;
});
