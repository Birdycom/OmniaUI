// File: packages/react/src/components/SortableRow.tsx
// Map: SortableRow = tr.oc-sortable-row -> grip cell (button) -> your cells
// Styling only: your code handles the drag events (they are passed through on the row)
// and sets `dragging` / `drop` to show the states.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface SortableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Accessible name of the grip, e.g. "Move Install". */
  gripLabel: string;
  /** This row is being moved (`.is-dragging`). */
  dragging?: boolean;
  /** Show the drop line above or below this row. */
  drop?: "before" | "after" | null;
  /** Locked row: no dragging, grip disabled. */
  locked?: boolean;
  /** Picked up with the keyboard (grip `aria-pressed`). */
  grabbed?: boolean;
  /** Keyboard handler for the grip (e.g. ArrowUp / ArrowDown to move). */
  onGripKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

/** `tr.oc-sortable-row[draggable]` with a `button.oc-sortable-row-grip` in the first cell. */
export const SortableRow = forwardRef<HTMLTableRowElement, SortableRowProps>(function SortableRow(
  { gripLabel, dragging, drop, locked, grabbed, onGripKeyDown, className, children, ...rest },
  ref,
) {
  const cls = cx("oc-sortable-row", dragging && "is-dragging", drop && `is-drop-${drop}`, className);
  return (
    <tr ref={ref} className={cls} draggable={locked ? undefined : true} {...rest}>
      <td className="oc-sortable-row-grip-cell">
        <button
          className="oc-sortable-row-grip"
          type="button"
          aria-label={gripLabel}
          aria-pressed={grabbed === undefined ? undefined : grabbed}
          disabled={locked}
          onKeyDown={onGripKeyDown}
        />
      </td>
      {children}
    </tr>
  );
});
