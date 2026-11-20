// Same markup as packages/ui/snippets/kbd.html.
import { Fragment, forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

/** One key: `<kbd class="oc-kbd">`. */
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...rest }, ref) {
  return <kbd ref={ref} className={cx("oc-kbd", className)} {...rest} />;
});

export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** ["Ctrl", "K"]: one key per entry. Or put `<Kbd>` children inside. */
  keys?: string[];
  /** A "+" (`.oc-kbd-sep`) between the keys. */
  separator?: boolean;
}

/** Shortcut: `.oc-kbd-group` with one `.oc-kbd` per key. */
export const KbdGroup = forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup({ keys, separator, className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx("oc-kbd-group", className)} {...rest}>
      {children ?? keys?.map((key, i) => (
        <Fragment key={key + i}>
          {separator && i > 0 && <span className="oc-kbd-sep">+</span>}
          <kbd className="oc-kbd">{key}</kbd>
        </Fragment>
      ))}
    </span>
  );
});
