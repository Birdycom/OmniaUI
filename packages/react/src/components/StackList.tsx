// File: packages/react/src/components/StackList.tsx | Map: types -> StackList (ul.oc-stack-list -> li pills)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface StackListItem {
  label: ReactNode;
  /** Optional glyph or SVG before the label (decorative). */
  icon?: ReactNode;
}

export interface StackListProps extends HTMLAttributes<HTMLUListElement> {
  /** Strings, or objects with an icon. */
  items: Array<ReactNode | StackListItem>;
  neutral?: boolean;
  size?: "default" | "sm";
}

const isItem = (v: unknown): v is StackListItem => typeof v === "object" && v !== null && "label" in v;

/** `<ul class="oc-stack-list">`: technology pills. Set an accent with `className="oc-accent--violet"`. */
export const StackList = forwardRef<HTMLUListElement, StackListProps>(function StackList(
  { items, neutral = false, size = "default", className, ...rest },
  ref,
) {
  return (
    <ul ref={ref} className={cx("oc-stack-list", neutral && "oc-stack-list--neutral", size === "sm" && "oc-stack-list--sm", className)} {...rest}>
      {items.map((item, i) => (
        <li className="oc-stack-list__item" key={i}>
          {isItem(item) ? (
            <>
              {item.icon != null && <span className="oc-stack-list__icon" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          ) : (
            item
          )}
        </li>
      ))}
    </ul>
  );
});
