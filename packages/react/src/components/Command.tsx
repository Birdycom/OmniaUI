"use client";

import { forwardRef, useId, useMemo, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../utils";

export interface CommandItemData {
  id: string;
  label: string;
  /** Right-aligned keyboard hint. */
  shortcut?: string;
  disabled?: boolean;
  /** Extra search terms. */
  keywords?: string[];
}

export interface CommandGroupData {
  label?: string;
  items: CommandItemData[];
}

export interface CommandProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  groups: CommandGroupData[];
  placeholder?: string;
  emptyText?: ReactNode;
  /** Search value (controlled). */
  query?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (item: CommandItemData) => void;
}

const matches = (item: CommandItemData, q: string) =>
  !q || [item.label, ...(item.keywords ?? [])].some((s) => s.toLowerCase().includes(q));

/**
 * Command palette. The list is filtered by the search input (non-matching rows get `hidden`),
 * the active row carries `aria-selected="true"`; arrow keys move it and Enter selects.
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(function Command(
  { groups, placeholder = "Type a command or search...", emptyText = "No results found.", query, onQueryChange, onSelect, className, ...rest },
  ref,
) {
  const listId = useId();
  const [innerQuery, setInnerQuery] = useState("");
  const q = (query ?? innerQuery).trim().toLowerCase();
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = useMemo(
    () => groups.flatMap((g) => g.items).filter((i) => !i.disabled && matches(i, q)),
    [groups, q],
  );
  const active = visible.find((i) => i.id === activeId) ?? visible[0];

  const move = (delta: number) => {
    if (!visible.length) return;
    const idx = Math.max(0, visible.findIndex((i) => i.id === active?.id));
    setActiveId(visible[(idx + delta + visible.length) % visible.length].id);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter" && active) { e.preventDefault(); onSelect?.(active); }
  };

  return (
    <div ref={ref} className={cx("oc-command", className)} role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-controls={listId} {...rest}>
      <input
        className="oc-command-input"
        type="search"
        placeholder={placeholder}
        aria-label="Search commands"
        value={query ?? innerQuery}
        onChange={(e) => {
          setInnerQuery(e.target.value);
          setActiveId(null);
          onQueryChange?.(e.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      <ul className="oc-command-list" role="listbox" id={listId}>
        {groups.map((group, gi) => {
          const anyVisible = group.items.some((i) => matches(i, q));
          return [
            gi > 0 && (
              <li key={`sep-${gi}`} className="oc-command-separator" role="separator" hidden={!anyVisible} />
            ),
            group.label && (
              <li key={`label-${gi}`} className="oc-command-group-label" role="presentation" hidden={!anyVisible}>{group.label}</li>
            ),
            ...group.items.map((item) => (
              <li
                key={item.id}
                className="oc-command-item"
                role="option"
                hidden={!matches(item, q)}
                aria-selected={active?.id === item.id ? true : undefined}
                aria-disabled={item.disabled ? true : undefined}
                onMouseMove={() => !item.disabled && setActiveId(item.id)}
                onClick={() => !item.disabled && onSelect?.(item)}
              >
                {item.label}
                {item.shortcut && <> <span className="oc-command-shortcut">{item.shortcut}</span></>}
              </li>
            )),
          ];
        })}
      </ul>
      <div className="oc-command-empty" hidden={groups.some((g) => g.items.some((i) => matches(i, q)))}>
        {emptyText}
      </div>
    </div>
  );
});
