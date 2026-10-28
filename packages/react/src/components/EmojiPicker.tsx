// File: packages/react/src/components/EmojiPicker.tsx
// Map: default groups -> props -> EmojiPicker (trigger button -> popover panel -> groups: label + grid of buttons)
// Same markup as packages/ui/snippets/emoji-picker.html. React calls onSelect and closes the popover.
"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface EmojiGroup {
  label?: string;
  emojis: string[];
}

const defaultGroups: EmojiGroup[] = [
  { label: "Smileys", emojis: ["😀", "😃", "😄", "😁", "😂", "🙂", "😉", "😍", "🤔", "😎", "😢", "😴", "😯", "🥳", "😤", "🤗"] },
  { label: "Gestures", emojis: ["👍", "👎", "👏", "🙌", "👋", "🙏", "✌️", "💪"] },
  { label: "Objects", emojis: ["❤️", "⭐", "🔥", "🎉", "✅", "🚀", "💡", "☕"] },
];

export interface EmojiPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  groups?: EmojiGroup[];
  /** Called with the picked emoji. */
  onSelect?: (emoji: string) => void;
  /** Always-visible panel without trigger / popover. */
  inline?: boolean;
  /** Trigger content (default 🙂) and its accessible name. */
  trigger?: ReactNode;
  triggerLabel?: string;
}

/** `.oc-emoji-picker`: popover grid of emoji buttons, anchored to its trigger. */
export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(function EmojiPicker(
  { groups = defaultGroups, onSelect, inline, trigger = "🙂", triggerLabel = "Insert emoji", className, id, "aria-label": label = "Emoji", ...rest },
  ref,
) {
  const auto = useId();
  const panelId = id ?? `oc-emoji-${auto.replace(/:/g, "")}`;
  const pick = (e: MouseEvent<HTMLButtonElement>, emoji: string) => {
    onSelect?.(emoji);
    (e.currentTarget.closest("[popover]") as (HTMLElement & { hidePopover?: () => void }) | null)?.hidePopover?.();
  };
  const panel = (
    <div
      ref={ref}
      id={panelId}
      className={cx("oc-emoji-picker", inline && "oc-emoji-picker--inline", className)}
      role={inline ? "group" : undefined}
      aria-label={label}
      {...(inline ? {} : attrs({ popover: "" }))}
      {...rest}
    >
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.label && <p className="oc-emoji-picker__label">{g.label}</p>}
          <div className="oc-emoji-picker__grid">
            {g.emojis.map((emoji) => (
              <button key={emoji} type="button" className="oc-emoji-picker__item" onClick={(e) => pick(e, emoji)}>{emoji}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  if (inline) return panel;
  return (
    <>
      <button type="button" className="oc-emoji-picker__trigger" aria-label={triggerLabel} popoverTarget={panelId}>{trigger}</button>
      {panel}
    </>
  );
});
