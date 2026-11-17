// File: packages/react/src/blocks/BlockContentBlocks.tsx | Map: types -> pinnedKept -> BlockContentBlocks (bar -> ol of cards: grip or pin,
//      details head (+ problem count) + body, tools -> drop from a drawer -> add row -> live status)
import { forwardRef, useId, useRef, useState } from "react";
import type { CSSProperties, DragEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx, textOf } from "../utils";
import { webiconNode } from "../components/Webicon";

export interface ContentBlockItem {
  id: string;
  /** Name of the block type ("Text", "Image", "Question"). */
  type: ReactNode;
  /** Icon in the type label: a webicon name ("mdi:text") or any node. */
  icon?: ReactNode;
  /** Tint of the icon (any color, e.g. "var(--color-teal-60)"). */
  color?: string;
  /** One line shown while the card is closed. */
  peek?: ReactNode;
  /** The fields of the block. */
  content: ReactNode;
  /** Starts open (uncontrolled details). */
  open?: boolean;
  /** No remove button (a block that must stay). */
  locked?: boolean;
  /** A fixed place: a pin instead of the grip, no move buttons, and no move or drop pushes it away. */
  pinned?: boolean;
  /** Your check found something: a red or orange card edge, also while closed. */
  issue?: "error" | "warning";
  /** Number of problems, shown in the head (with `issue`). */
  issues?: number;
}

/**
 * True when every pinned item keeps its place in `next`: pinned items at the start stay first, at the end stay last,
 * in the middle keep their index. Used to refuse a move or a drop that would push a pinned block away.
 */
export function pinnedKept(before: { id: string; pinned?: boolean }[], next: { id: string; pinned?: boolean }[]): boolean {
  const n = before.length;
  let lead = 0;
  while (lead < n && before[lead].pinned) lead++;
  let trail = 0;
  while (trail < n - lead && before[n - 1 - trail].pinned) trail++;
  return before.every((it, i) => {
    if (!it.pinned) return true;
    const j = next.findIndex((x) => x.id === it.id);
    if (i < lead || (i >= lead && i < n - trail)) return j === i;
    return next.length - 1 - j === n - 1 - i;
  });
}

export interface ContentBlocksLabels {
  move: (type: string) => string;
  up: (type: string) => string;
  down: (type: string) => string;
  remove: (type: string) => string;
  moved: (type: string, position: number, total: number) => string;
  pickedUp: (type: string) => string;
  list: string;
  pinned: (type: string) => string;
  issues: (count: number, kind: "error" | "warning") => string;
}

const EN: ContentBlocksLabels = {
  move: (t) => `Move ${t}`,
  up: (t) => `Move ${t} up`,
  down: (t) => `Move ${t} down`,
  remove: (t) => `Remove ${t}`,
  moved: (t, p, n) => `${t}: position ${p} of ${n}`,
  pickedUp: (t) => `${t} picked up. Use the arrow keys, then Enter.`,
  list: "Blocks",
  pinned: (t) => `${t} stays in its place`,
  issues: (c, k) => `${c} ${k}${c === 1 ? "" : "s"}`,
};

export interface BlockContentBlocksProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
  /** Previous / next buttons left of the title. */
  nav?: ReactNode;
  /** Buttons on the right of the bar (Preview, Save). */
  actions?: ReactNode;
  items: ContentBlockItem[];
  /** Called with the new order after a move (buttons, keyboard or drag). Keep `items` in that order. */
  onMove?: (id: string, toIndex: number) => void;
  onRemove?: (id: string) => void;
  /** The add row under the list (e.g. a button that opens a type picker). */
  add?: ReactNode;
  labels?: Partial<ContentBlocksLabels>;
  /** Drag type of new blocks from a drawer ("application/x-block"): such a drag shows the drop line here. */
  acceptDrop?: string;
  /** A new block was dropped: the data of `acceptDrop` and the index where it goes. */
  onDropNew?: (data: string, toIndex: number) => void;
}

const node = (i: ReactNode) => webiconNode(i);

/** `.oc-block-content-blocks`: editor column of content blocks you open, move, drag and remove. */
export const BlockContentBlocks = forwardRef<HTMLElement, BlockContentBlocksProps>(function BlockContentBlocks(
  { title, meta, nav, actions, items, onMove, onRemove, add, labels, acceptDrop, onDropNew, className, ...rest },
  ref,
) {
  const L = { ...EN, ...labels };
  const titleId = `oc-cblocks-${useId().replace(/[^\w-]/g, "")}`;
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  // A move re-inserts the row; the blur that causes must not drop the grip that was picked up with the keyboard.
  const moving = useRef(false);
  const [drag, setDrag] = useState<{ id: string; over?: string; after?: boolean } | null>(null);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [ext, setExt] = useState<{ over?: string; after?: boolean } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const name = (it: ContentBlockItem) => textOf(it.type) || "Block";

  const canMove = (id: string, to: number) => {
    const from = items.findIndex((x) => x.id === id);
    if (from < 0 || to < 0 || to >= items.length || to === from || items[from].pinned) return false;
    const next = [...items];
    next.splice(to, 0, ...next.splice(from, 1));
    return pinnedKept(items, next);
  };
  const canInsert = (to: number) => pinnedKept(items, [...items.slice(0, to), { id: "\u0000new" }, ...items.slice(to)]);
  const move = (id: string, to: number) => {
    const from = items.findIndex((x) => x.id === id);
    if (!canMove(id, to)) return;
    onMove?.(id, to);
    setStatus(L.moved(name(items[from]), to + 1, items.length));
  };
  const focusGrip = (id: string) => requestAnimationFrame(() => { moving.current = false; ([...(listRef.current?.children ?? [])] as HTMLElement[]).find((x) => x.dataset.id === id)?.querySelector<HTMLElement>(".oc-sortable-row-grip")?.focus(); });
  const onGripKey = (e: KeyboardEvent, it: ContentBlockItem, i: number) => {
    if (picked !== it.id) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); moving.current = true; move(it.id, i + (e.key === "ArrowUp" ? -1 : 1)); focusGrip(it.id); }
    else if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setPicked(null); }
  };
  const external = (e: DragEvent) => !drag && !!acceptDrop && [...e.dataTransfer.types].includes(acceptDrop);
  const onDragOver = (e: DragEvent<HTMLLIElement>, it: ContentBlockItem) => {
    if (external(e)) {
      const r = e.currentTarget.getBoundingClientRect();
      const after = e.clientY > r.top + r.height / 2;
      if (!canInsert(items.findIndex((x) => x.id === it.id) + (after ? 1 : 0))) { if (ext?.over) setExt({}); return; }
      e.preventDefault();
      if (ext?.over !== it.id || ext.after !== after) setExt({ over: it.id, after });
      return;
    }
    if (!drag) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    if (drag.over !== it.id || drag.after !== after) setDrag({ ...drag, over: it.id, after });
  };
  const onDrop = (e: DragEvent) => {
    if (ext && acceptDrop) {
      e.preventDefault();
      const to = ext.over ? items.findIndex((x) => x.id === ext.over) + (ext.after ? 1 : 0) : items.length;
      if (ext.over || items.length === 0) onDropNew?.(e.dataTransfer.getData(acceptDrop), to);
      setExt(null);
      return;
    }
    if (!drag?.over || drag.over === drag.id) { setDrag(null); return; }
    e.preventDefault();
    const from = items.findIndex((x) => x.id === drag.id);
    let to = items.findIndex((x) => x.id === drag.over) + (drag.after ? 1 : 0);
    if (to > from) to--;
    move(drag.id, to);
    setDrag(null);
  };

  return (
    <section ref={ref} className={cx("oc-block-content-blocks", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-content-blocks-bar">
        {nav != null && <div className="oc-block-content-blocks-nav">{nav}</div>}
        <div className="oc-block-content-blocks-heading">
          <h2 className="oc-block-content-blocks-title" id={titleId}>{title}</h2>
          {meta != null && <p className="oc-block-content-blocks-meta">{meta}</p>}
        </div>
        {actions != null && <div className="oc-block-content-blocks-actions">{actions}</div>}
      </div>
      <ol
        ref={listRef}
        className={cx("oc-block-content-blocks-list", ext && "is-drop-target")}
        aria-label={L.list}
        onDrop={onDrop}
        onDragOver={(e) => { if (items.length === 0 && external(e)) { e.preventDefault(); if (!ext) setExt({}); } }}
        onDragLeave={(e) => { if (ext && !e.currentTarget.contains(e.relatedTarget as Node | null)) setExt(null); }}
      >
        {items.map((it, i) => {
          const t = name(it);
          return (
            <li
              key={it.id}
              data-id={it.id}
              data-issue={it.issue}
              className={cx("oc-block-content-blocks-item", drag?.id === it.id && "is-dragging", drag?.over === it.id && drag.id !== it.id && (drag.after ? "is-drop-after" : "is-drop-before"), ext?.over === it.id && (ext.after ? "is-drop-after" : "is-drop-before"))}
              draggable={!it.pinned && grabbed === it.id}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", it.id); setDrag({ id: it.id }); }}
              onDragOver={(e) => onDragOver(e, it)}
              onDragEnd={() => { setGrabbed(null); setDrag(null); }}
              onPointerUp={() => { if (!drag) setGrabbed(null); }}
            >
              {it.pinned ? <span className="oc-block-content-blocks-pin" role="img" aria-label={L.pinned(t)} /> : <button
                className="oc-sortable-row-grip"
                type="button"
                aria-label={L.move(t)}
                aria-pressed={picked === it.id}
                onPointerDown={() => setGrabbed(it.id)}
                onClick={() => { const on = picked !== it.id; setPicked(on ? it.id : null); if (on) setStatus(L.pickedUp(t)); }}
                onKeyDown={(e) => onGripKey(e, it, i)}
                onBlur={() => { if (!moving.current && picked === it.id) setPicked(null); }}
              />}
              <details className="oc-block-content-blocks-card" open={it.open}>
                <summary className="oc-block-content-blocks-head">
                  <span className="oc-block-content-blocks-type" style={it.color ? ({ "--oc-block-type-color": it.color } as CSSProperties) : undefined}>{node(it.icon)}{it.type}</span>
                  {it.peek != null && <span className="oc-block-content-blocks-peek">{it.peek}</span>}
                  {it.issue && it.issues != null && it.issues > 0 && <span className="oc-block-content-blocks-count" role="img" aria-label={L.issues(it.issues, it.issue)}>{it.issues}</span>}
                </summary>
                <div className="oc-block-content-blocks-body">{it.content}</div>
              </details>
              <div className="oc-block-content-blocks-tools">
                {!it.pinned && <>
                  <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label={L.up(t)} disabled={!canMove(it.id, i - 1)} onClick={() => move(it.id, i - 1)}>{node("mdi:arrow-up")}</button>
                  <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label={L.down(t)} disabled={!canMove(it.id, i + 1)} onClick={() => move(it.id, i + 1)}>{node("mdi:arrow-down")}</button>
                </>}
                {!it.locked && <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label={L.remove(t)} onClick={() => onRemove?.(it.id)}>{node("mdi:trash-can-outline")}</button>}
              </div>
            </li>
          );
        })}
      </ol>
      {add != null && <div className="oc-block-content-blocks-foot">{add}</div>}
      <p className="oc-block-content-blocks-status oc-visually-hidden" aria-live="polite">{status}</p>
    </section>
  );
});
