"use client";

import { forwardRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface TagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  /** Suggestion buttons below the control (already used tags are hidden). */
  suggestions?: string[];
  placeholder?: string;
  /** Accessible name of the text input. */
  label?: string;
  disabled?: boolean;
}

/** `.oc-tag-input`: chips with remove buttons and a free-text input (Enter or comma adds, Backspace removes). */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(function TagInput(
  { value, defaultValue = [], onChange, suggestions, placeholder = "Add tag...", label = "Add tag", disabled, className, ...rest },
  ref,
) {
  const [tags, setTags] = useControllable<string[]>(value, defaultValue, onChange);
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setDraft("");
  };
  const remove = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };
  const open = suggestions?.filter((s) => !tags.includes(s)) ?? [];

  return (
    <>
      <div ref={ref} className={cx("oc-tag-input", className)} {...rest}>
        {tags.map((tag) => (
          <span className="oc-tag" key={tag}>
            {tag}{" "}
            <button className="oc-tag-remove" type="button" aria-label={`Remove ${tag}`} disabled={disabled} onClick={() => remove(tag)}>&times;</button>
          </span>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          aria-label={label}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
        />
      </div>
      {open.length > 0 && (
        <div className="oc-tag-suggestions">
          {open.map((s) => (
            <button type="button" key={s} disabled={disabled} onClick={() => add(s)}>{s}</button>
          ))}
        </div>
      )}
    </>
  );
});
