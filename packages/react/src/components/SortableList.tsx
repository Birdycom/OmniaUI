// File: packages/react/src/components/SortableList.tsx
// Map: props -> ul/ol.oc-sortable-list -> li.oc-sortable-item[data-id] (grip, body, optional arrows) -> bindSortableList (move: false)
//      -> onReorder(new items, { from, to })
// Sortable list (0.18.0): reorder with a finger, pen or mouse (pointer events, works on a tablet), or the keyboard (Space to pick up,
// arrows to move, Space to drop, Escape to cancel), announced in a live region. Controlled: React renders the new order you give back.
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { bindSortableList } from "../../../ui/src/sortable-list.js";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

/** Move one entry of an array from `from` to `to` (a new array). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export interface SortableListMessages {
  grabbed?: string;
  moved?: string;
  dropped?: string;
  cancelled?: string;
}

export interface SortableListProps<T> extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> {
  items: readonly T[];
  /** Stable key per item (default `item.id`, else the string of the item). */
  getKey?: (item: T, index: number) => string;
  /** Content of a row (default the string of the item). */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Text for the grip and the announcements (default the string of the item, or `item.label`). */
  getLabel?: (item: T) => string;
  /** The new order, after a drag, a keyboard move or an arrow button. */
  onReorder: (items: T[], move: { from: number; to: number }) => void;
  /** `ol` with positions (1., 2., ...) instead of `ul`. */
  ordered?: boolean;
  /** Up / down buttons in every row, for people who do not drag. */
  arrows?: boolean;
  /** Grip name; default "Move {label}". */
  gripLabel?: (label: string) => string;
  /** Texts of the live region; {label}, {pos} and {count} are filled in. */
  messages?: SortableListMessages;
  /** Names of the arrow buttons. */
  upLabel?: string;
  downLabel?: string;
}

const defaultKey = (item: unknown, index: number) =>
  item && typeof item === "object" && "id" in item ? String((item as { id: unknown }).id) : typeof item === "string" || typeof item === "number" ? String(item) : String(index);
const defaultLabel = (item: unknown) =>
  item && typeof item === "object" && "label" in item ? String((item as { label: unknown }).label) : String(item);

function SortableListInner<T>(
  { items, getKey = defaultKey, renderItem, getLabel = defaultLabel, onReorder, ordered, arrows, gripLabel, messages, upLabel = "Move up", downLabel = "Move down", className, ...rest }: SortableListProps<T>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const list = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => list.current as HTMLElement);
  const latest = useRef({ items, onReorder });
  latest.current = { items, onReorder };

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const api = bindSortableList(el, {
      move: false,
      messages,
      onReorder: (from: number, to: number) => {
        const { items: now, onReorder: cb } = latest.current;
        cb(moveItem(now, from, to), { from, to });
      },
    });
    return () => api?.destroy();
    // messages: read once; the list keeps its binding for its life
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Tag = (ordered ? "ol" : "ul") as "ul";
  return (
    <Tag ref={list as React.Ref<HTMLUListElement>} className={cx("oc-sortable-list", className)} {...rest}>
      {items.map((item, i) => {
        const label = getLabel(item);
        return (
          <li key={getKey(item, i)} className="oc-sortable-item" data-id={getKey(item, i)} data-label={label}>
            <button type="button" className="oc-sortable-row-grip" aria-label={gripLabel ? gripLabel(label) : `Move ${label}`} />
            <span className="oc-sortable-item__body">{renderItem ? renderItem(item, i) : label}</span>
            {arrows && (
              <span className="oc-sortable-item__arrows">
                <button type="button" data-oc-move="up" aria-label={`${upLabel}: ${label}`} disabled={i === 0}>
                  <Webicon name="mdi:chevron-up" />
                </button>
                <button type="button" data-oc-move="down" aria-label={`${downLabel}: ${label}`} disabled={i === items.length - 1}>
                  <Webicon name="mdi:chevron-down" />
                </button>
              </span>
            )}
          </li>
        );
      })}
    </Tag>
  );
}

/** `ul|ol.oc-sortable-list`: reorder by drag (pointer events, touch) or keyboard (Space + arrows); controlled through `onReorder`. */
export const SortableList = forwardRef(SortableListInner) as <T>(
  props: SortableListProps<T> & { ref?: React.Ref<HTMLElement> },
) => ReturnType<typeof SortableListInner>;
