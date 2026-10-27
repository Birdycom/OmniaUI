import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Content of the trigger button. */
  trigger: ReactNode;
  triggerProps?: ButtonProps;
  size?: "sm" | "md" | "lg";
  title?: ReactNode;
  /** Short body text (`oc-popover-text`). */
  text?: ReactNode;
}

/** Trigger + `<div class="oc-popover" popover>` floating panel. */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, triggerProps, size = "md", title, text, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const panelId = id ?? `oc-popover-${auto.replace(/:/g, "")}`;
  return (
    <>
      <Button variant="outline" type="button" {...triggerProps} {...attrs({ popovertarget: panelId })}>{trigger}</Button>
      <div ref={ref} className={cx("oc-popover", size !== "md" && `oc-popover--${size}`, className)} id={panelId} {...attrs({ popover: "" })} {...rest}>
        {title != null && <h3 className="oc-popover-title">{title}</h3>}
        {text != null && <p className="oc-popover-text">{text}</p>}
        {children}
      </div>
    </>
  );
});
