// File: packages/react/src/blocks/BlockContentBlocks.tsx | Map: types -> BlockContentBlocks (bar -> ol of cards: grip, details head + body, tools -> add row -> live status)
import { createElement, forwardRef, useId, useRef, useState } from "react";
import type { CSSProperties, DragEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx, textOf } from "../utils";

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
}

export interface ContentBlocksLabels {
  move: (type: string) => string;
  up: (type: string) => string;
  down: (type: string) => string;
  remove: (type: string) => string;
  moved: (type: string, position: number, total: number) => string;
  pickedUp: (type: string) => string;
  list: string;
}

const EN: ContentBlocksLabels = {
  move: (t) => `Move ${t}`,
  up: (t) => `Move ${t} up`,
  down: (t) => `Move ${t} down`,
  remove: (t) => `Remove ${t}`,
  moved: (t, p, n) => `${t}: position ${p} of ${n}`,
  pickedUp: (t) => `${t} picked up. Use the arrow keys, then Enter.`,
  list: "Blocks",
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
}

const node = (i: ReactNode) => (typeof i === "string" && i.includes(":") ? createElement("iconify-icon", { icon: i, "aria-hidden": "true" }) : i);

/** `.oc-block-content-blocks`: editor column of content blocks you open, move, drag and remove. */
export const BlockContentBlocks = forwardRef<HTMLElement, BlockContentBlocksProps>(function BlockContentBlocks(
  { title, meta, nav, actions, items, onMove, onRemove, add, labels, className, ...rest },
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
  const listRef = useRef<HTMLOListElement>(null);
  const name = (it: ContentBlockItem) => textOf(it.type) || "Block";

  const move = (id: string, to: number) => {
    const from = items.findIndex((x) => x.id === id);
    if (from < 0 || to < 0 || to >= items.length || to === from) return;
    onMove?.(id, to);
    setStatus(L.moved(name(items[from]), to + 1, items.length));
  };
  const focusGrip = (id: string) => requestAnimationFrame(() => { moving.current = false; ([...(listRef.current?.children ?? [])] as HTMLElement[]).find((x) => x.dataset.id === id)?.querySelector<HTMLElement>(".oc-sortable-row-grip")?.focus(); });
  const onGripKey = (e: KeyboardEvent, it: ContentBlockItem, i: number) => {
    if (picked !== it.id) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); moving.current = true; move(it.id, i + (e.key === "ArrowUp" ? -1 : 1)); focusGrip(it.id); }
    else if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setPicked(null); }
  };
  const onDragOver = (e: DragEvent<HTMLLIElement>, it: ContentBlockItem) => {
    if (!drag) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    if (drag.over !== it.id || drag.after !== after) setDrag({ ...drag, over: it.id, after });
  };
  const onDrop = (e: DragEvent) => {
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
      <ol ref={listRef} className="oc-block-content-blocks-list" aria-label={L.list} onDrop={onDrop}>
        {items.map((it, i) => {
          const t = name(it);
          return (
            <li
              key={it.id}
              data-id={it.id}
              className={cx("oc-block-content-blocks-item", drag?.id === it.id && "is-dragging", drag?.over === it.id && drag.id !== it.id && (drag.after ? "is-drop-after" : "is-drop-before"))}
              draggable={grabbed === it.id}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", it.id); setDrag({ id: it.id }); }}
              onDragOver={(e) => onDragOver(e, it)}
              onDragEnd={() => { setGrabbed(null); setDrag(null); }}
              onPointerUp={() => { if (!drag) setGrabbed(null); }}
            >
              <button
                className="oc-sortable-row-grip"
                type="button"
                aria-label={L.move(t)}
                aria-pressed={picked === it.id}
                onPointerDown={() => setGrabbed(it.id)}
                onClick={() => { const on = picked !== it.id; setPicked(on ? it.id : null); if (on) setStatus(L.pickedUp(t)); }}
                onKeyDown={(e) => onGripKey(e, it, i)}
                onBlur={() => { if (!moving.current && picked === it.id) setPicked(null); }}
              />
              <details className="oc-block-content-blocks-card" open={it.open}>
                <summary className="oc-block-content-blocks-head">
                  <span className="oc-block-content-blocks-type" style={it.color ? ({ "--oc-block-type-color": it.color } as CSSProperties) : undefined}>{node(it.icon)}{it.type}</span>
                  {it.peek != null && <span className="oc-block-content-blocks-peek">{it.peek}</span>}
                </summary>
                <div className="oc-block-content-blocks-body">{it.content}</div>
              </details>
              <div className="oc-block-content-blocks-tools">
                <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label={L.up(t)} disabled={i === 0} onClick={() => move(it.id, i - 1)}>{node("mdi:arrow-up")}</button>
                <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label={L.down(t)} disabled={i === items.length - 1} onClick={() => move(it.id, i + 1)}>{node("mdi:arrow-down")}</button>
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
