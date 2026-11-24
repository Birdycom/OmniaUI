"use client";

import { Children, Fragment, forwardRef, isValidElement, useId, useMemo, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from "react";
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

export interface CommandItemProps {
  /** Id reported to `onSelect` (default: the label). */
  value?: string;
  /** Text that is searched (default: the text of the children). */
  label?: string;
  /** Right-aligned keyboard hint. */
  shortcut?: string;
  disabled?: boolean;
  /** Extra search terms. */
  keywords?: string[];
  /** Called with the item when this row is chosen (before the `onSelect` of the Command). */
  onSelect?: (item: CommandItemData) => void;
  /** What the row shows (text, an icon and text …). */
  children?: ReactNode;
}

export interface CommandGroupProps {
  /** Heading above the rows of this group. */
  label?: string;
  children?: ReactNode;
}

/**
 * 0.18.0: one row of a `<Command>` written as JSX (`<CommandItem value="new" shortcut="Ctrl N">New invoice</CommandItem>`).
 * The Command reads it and renders the `li.oc-command-item`; on its own it renders nothing.
 */
export function CommandItem(_props: CommandItemProps): ReactElement | null {
  return null;
}

/** 0.18.0: a group of `<CommandItem>`s with an optional heading, inside `<Command>`. On its own it renders nothing. */
export function CommandGroup(_props: CommandGroupProps): ReactElement | null {
  return null;
}

type Row = CommandItemData & { content?: ReactNode; onPick?: (item: CommandItemData) => void };
type Section = { label?: string; items: Row[] };

/** The plain text of a node (for the search label of a JSX row). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/** Reads the CommandGroup / CommandItem children (also inside fragments and arrays) into sections. */
function collect(children: ReactNode): Section[] {
  const sections: Section[] = [];
  let loose: Section | null = null;
  const row = (props: CommandItemProps): Row => {
    const label = props.label ?? textOf(props.children).trim();
    const data: CommandItemData = { id: props.value ?? label, label };
    if (props.shortcut !== undefined) data.shortcut = props.shortcut;
    if (props.disabled) data.disabled = true;
    if (props.keywords) data.keywords = props.keywords;
    return { ...data, content: props.children, onPick: props.onSelect };
  };
  const items = (nodes: ReactNode, into: Row[]) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) items((child.props as { children?: ReactNode }).children, into);
      else if (child.type === CommandItem) into.push(row(child.props as CommandItemProps));
    });
  };
  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) walk((child.props as { children?: ReactNode }).children);
      else if (child.type === CommandGroup) {
        const props = child.props as CommandGroupProps;
        const group: Section = { label: props.label, items: [] };
        items(props.children, group.items);
        sections.push(group);
        loose = null;
      } else if (child.type === CommandItem) {
        if (!loose) {
          loose = { items: [] };
          sections.push(loose);
        }
        loose.items.push(row(child.props as CommandItemProps));
      }
    });
  };
  walk(children);
  return sections;
}

export interface CommandProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The rows as data. 0.18.0: optional; `<CommandGroup>` / `<CommandItem>` children work too (after these groups). */
  groups?: CommandGroupData[];
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
 * Rows come from `groups` and/or `<CommandGroup>` / `<CommandItem>` children (0.18.0).
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(function Command(
  { groups: groupData, children, placeholder = "Type a command or search...", emptyText = "No results found.", query, onQueryChange, onSelect, className, ...rest },
  ref,
) {
  const listId = useId();
  const [innerQuery, setInnerQuery] = useState("");
  const q = (query ?? innerQuery).trim().toLowerCase();
  const [activeId, setActiveId] = useState<string | null>(null);
  const groups: Section[] = useMemo(() => [...(groupData ?? []), ...collect(children)], [groupData, children]);
  const choose = (item: Row) => {
    // Data rows go out as they came in (same object); JSX rows without their render-only fields.
    if (!("onPick" in item)) return onSelect?.(item);
    const { content: _content, onPick, ...data } = item;
    onPick?.(data);
    onSelect?.(data);
  };

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
    else if (e.key === "Enter" && active) { e.preventDefault(); choose(active); }
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
                onClick={() => !item.disabled && choose(item)}
              >
                {item.content ?? item.label}
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
