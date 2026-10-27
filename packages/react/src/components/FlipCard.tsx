// File: packages/react/src/components/FlipCard.tsx
// Map: props -> FlipCard (optional checkbox -> inner -> front face + flip label -> back face + flip label)
// Same markup as packages/ui/snippets/flip-card.html. trigger="toggle" uses the CSS checkbox, "hover" the --hover
// modifier, "manual" only the `flipped` prop (.is-flipped).
"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface FlipCardProps extends HTMLAttributes<HTMLDivElement> {
  front: ReactNode;
  back: ReactNode;
  /** How the card flips. Default "toggle" (click / Space). */
  trigger?: "toggle" | "hover" | "manual";
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** Turn top over bottom instead of left over right. */
  vertical?: boolean;
  /** Text of the flip labels (toggle mode). */
  frontLabel?: ReactNode;
  backLabel?: ReactNode;
}

/** `.oc-flip-card`: front / back card that turns in 3D (cross-fades with reduced motion). */
export const FlipCard = forwardRef<HTMLDivElement, FlipCardProps>(function FlipCard(
  { front, back, trigger = "toggle", flipped, defaultFlipped = false, onFlippedChange, vertical, frontLabel = "Show answer", backLabel = "Back", className, ...rest },
  ref,
) {
  const id = `oc-flip-${useId().replace(/:/g, "")}`;
  const [isFlipped, setFlipped] = useControllable(flipped, defaultFlipped, onFlippedChange);
  const toggle = trigger === "toggle";
  return (
    <div
      ref={ref}
      className={cx("oc-flip-card", trigger === "hover" && "oc-flip-card--hover", vertical && "oc-flip-card--vertical", !toggle && isFlipped && "is-flipped", className)}
      tabIndex={trigger === "hover" ? 0 : undefined}
      {...rest}
    >
      {toggle && <input type="checkbox" className="oc-flip-card__toggle" id={id} checked={isFlipped} onChange={(e) => setFlipped(e.target.checked)} />}
      <div className="oc-flip-card__inner">
        <div className="oc-flip-card__face oc-flip-card__face--front">
          {front}
          {toggle && <label className="oc-flip-card__flip" htmlFor={id}>{frontLabel}</label>}
        </div>
        <div className="oc-flip-card__face oc-flip-card__face--back">
          {back}
          {toggle && <label className="oc-flip-card__flip" htmlFor={id}>{backLabel}</label>}
        </div>
      </div>
    </div>
  );
});
