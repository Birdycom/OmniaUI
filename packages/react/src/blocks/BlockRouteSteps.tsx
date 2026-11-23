// File: packages/react/src/blocks/BlockRouteSteps.tsx | Map: types -> BlockRouteSteps (head -> tools: search + kind chips -> ol of steps: grip, main, status, menu -> empty -> foot -> live status)
import { Fragment, forwardRef, useId, useRef, useState } from "react";
import type { CSSProperties, DragEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { attrs, cx, textOf } from "../utils";
import { DropdownItem, DropdownSeparator } from "../components/Dropdown";
import { webiconNode } from "../components/Webicon";

export interface RouteStep {
  id: string;
  name: ReactNode;
  /** Short facts under the name ("Question", "20 points"). */
  meta?: ReactNode[];
  /** Kind, matched by the kind chips (data-kind). */
  kind?: string;
  /** Shows the order number and counts (default true). False: an icon thumb (intro, finish). */
  numbered?: boolean;
  /** Icon of a step without a number: a webicon name ("mdi:flag-checkered") or any node. */
  icon?: ReactNode;
  /** Tint of that icon. */
  color?: string;
  /** A photo (img or svg) in the thumb; a numbered step keeps a small number. */
  image?: ReactNode;
  status?: ReactNode;
  statusTone?: "success" | "warning" | "destructive" | "outline" | "secondary" | "info";
  /** Tooltip on the status (the messages behind "2 problems"); the status becomes focusable. */
  statusTooltip?: string;
  /** Small badges under the name ("Counts", "Team"). */
  badges?: ReactNode[];
}

export interface RouteStepsKind {
  /** One or more kinds, separated by a space. */
  value: string;
  label: ReactNode;
}

export interface RouteStepsLabels {
  move: (name: string) => string;
  actions: (name: string) => string;
  up: string;
  down: string;
  duplicate: string;
  remove: string;
  search: string;
  all: ReactNode;
  kind: string;
  empty: ReactNode;
  list: string;
  moved: (name: string, position: number, total: number) => string;
}

const EN: RouteStepsLabels = {
  move: (n) => `Move ${n}`,
  actions: (n) => `Actions for ${n}`,
  up: "Move up",
  down: "Move down",
  duplicate: "Duplicate",
  remove: "Delete",
  search: "Search steps",
  all: "All",
  kind: "Kind",
  empty: "No step matches your search.",
  list: "Steps in route order",
  moved: (n, p, t) => `${n}: position ${p} of ${t}`,
};

export interface BlockRouteStepsProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "onSelect"> {
  title: ReactNode;
  /** "7 steps · 4 count". */
  count?: ReactNode;
  steps: RouteStep[];
  /** Id of the step open in the editor (aria-current). */
  selected?: string;
  onSelect?: (id: string) => void;
  /** Called with the new position after a move (menu, keyboard or drag). Keep `steps` in that order. */
  onMove?: (id: string, toIndex: number) => void;
  onDuplicate?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Show the search field (default true). */
  search?: boolean;
  /** Kind chips; "All" comes first. */
  kinds?: RouteStepsKind[];
  /** Buttons under the list (Add step). */
  footer?: ReactNode;
  labels?: Partial<RouteStepsLabels>;
  /** The order cannot change now (a live round): no grips, no dragging, no move items; a lock line in the head. */
  locked?: boolean;
  /** Text of that lock line (default "Order locked"). */
  lockedLabel?: ReactNode;
}

const node = (i: ReactNode) => webiconNode(i);

/** `.oc-block-route-steps`: the ordered steps of a route or course in an editor, numbered by a CSS counter. */
export const BlockRouteSteps = forwardRef<HTMLElement, BlockRouteStepsProps>(function BlockRouteSteps(
  { title, count, steps, selected, onSelect, onMove: onMoveProp, onDuplicate, onRemove, search = true, kinds = [], footer, labels, locked, lockedLabel = "Order locked", className, ...rest },
  ref,
) {
  const L = { ...EN, ...labels };
  const onMove = locked ? undefined : onMoveProp;
  const auto = useId().replace(/[^\w-]/g, "");
  const titleId = `oc-rsteps-${auto}`;
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [picked, setPicked] = useState<string | null>(null);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; over?: string; after?: boolean } | null>(null);
  const [status, setStatus] = useState("");
  // A move re-inserts the row; the blur that causes must not drop the grip that was picked up with the keyboard.
  const moving = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const q = query.trim().toLowerCase();
  const kindList = kind.split(" ");
  const visible = (s: RouteStep) => (kind === "all" || kindList.includes(s.kind ?? "")) && (!q || `${textOf(s.name)} ${(s.meta ?? []).map(textOf).join(" ")}`.toLowerCase().includes(q));
  const shown = steps.filter(visible).length;
  const name = (s: RouteStep) => textOf(s.name) || "Step";

  const move = (id: string, to: number) => {
    const from = steps.findIndex((x) => x.id === id);
    if (from < 0 || to < 0 || to >= steps.length || to === from) return;
    onMove?.(id, to);
    setStatus(L.moved(name(steps[from]), to + 1, steps.length));
  };
  const onGripKey = (e: KeyboardEvent, s: RouteStep, i: number) => {
    if (picked !== s.id) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      moving.current = true;
      move(s.id, i + (e.key === "ArrowUp" ? -1 : 1));
      requestAnimationFrame(() => { moving.current = false; ([...(listRef.current?.children ?? [])] as HTMLElement[]).find((x) => x.dataset.id === s.id)?.querySelector<HTMLElement>(".oc-sortable-row-grip")?.focus(); });
    } else if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setPicked(null); }
  };
  const onDragOver = (e: DragEvent<HTMLLIElement>, s: RouteStep) => {
    if (!drag) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    if (drag.over !== s.id || drag.after !== after) setDrag({ ...drag, over: s.id, after });
  };
  const onDrop = (e: DragEvent) => {
    if (!drag?.over || drag.over === drag.id) { setDrag(null); return; }
    e.preventDefault();
    const from = steps.findIndex((x) => x.id === drag.id);
    let to = steps.findIndex((x) => x.id === drag.over) + (drag.after ? 1 : 0);
    if (to > from) to--;
    move(drag.id, to);
    setDrag(null);
  };

  return (
    <section ref={ref} className={cx("oc-block-route-steps", locked && "oc-block-route-steps--locked", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-route-steps-head">
        <h2 className="oc-block-route-steps-title" id={titleId}>{title}</h2>
        {count != null && <span className="oc-block-route-steps-count">{count}</span>}
        {locked && <span className="oc-block-route-steps-lock">{lockedLabel}</span>}
      </div>
      {(search || kinds.length > 0) && (
        <div className="oc-block-route-steps-tools">
          {search && (
            <div className="oc-input-group oc-input-group--affix">
              <span className="oc-input-addon" aria-hidden="true">{node("mdi:magnify")}</span>
              <input className="oc-input oc-block-route-steps-search" type="search" placeholder={L.search} aria-label={L.search} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          )}
          {kinds.length > 0 && (
            <fieldset className="oc-chip-filter oc-chip-filter--sm oc-block-route-steps-kinds" aria-label={L.kind}>
              {[{ value: "all", label: L.all }, ...kinds].map((k) => (
                <label key={k.value} className="oc-chip-filter-item"><input type="radio" name={`${titleId}-kind`} value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} /> {k.label}</label>
              ))}
            </fieldset>
          )}
        </div>
      )}
      <ol ref={listRef} className="oc-block-route-steps-list" aria-label={L.list} onDrop={onDrop}>
        {steps.map((s, i) => {
          const n = name(s);
          const menuId = `${titleId}-menu-${i}`;
          const numbered = s.numbered ?? true;
          return (
            <li
              key={s.id}
              data-id={s.id}
              data-kind={s.kind}
              className={cx("oc-block-route-steps-item", !visible(s) && "is-filtered", drag?.id === s.id && "is-dragging", drag?.over === s.id && drag.id !== s.id && (drag.after ? "is-drop-after" : "is-drop-before"))}
              draggable={!locked && grabbed === s.id}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", s.id); setDrag({ id: s.id }); }}
              onDragOver={(e) => onDragOver(e, s)}
              onDragEnd={() => { setGrabbed(null); setDrag(null); }}
              onPointerUp={() => { if (!drag) setGrabbed(null); }}
            >
              <button className="oc-sortable-row-grip" type="button" aria-label={L.move(n)} aria-pressed={picked === s.id} disabled={locked}
                onPointerDown={() => setGrabbed(s.id)}
                onClick={() => setPicked(picked === s.id ? null : s.id)}
                onKeyDown={(e) => onGripKey(e, s, i)}
                onBlur={() => { if (!moving.current && picked === s.id) setPicked(null); }} />
              <button className="oc-block-route-steps-main" type="button" aria-current={selected === s.id ? "true" : undefined} onClick={() => onSelect?.(s.id)}>
                {numbered
                  ? <span className="oc-block-route-steps-thumb oc-block-route-steps-thumb--num">{s.image}</span>
                  : <span className="oc-block-route-steps-thumb" style={s.color ? ({ "--oc-step-color": s.color } as CSSProperties) : undefined}>{s.image ?? node(s.icon)}</span>}
                <span className="oc-block-route-steps-text">
                  <span className="oc-block-route-steps-name">{s.name}</span>
                  {s.meta && s.meta.length > 0 && <span className="oc-block-route-steps-meta">{s.meta.map((m, k) => <span key={k}>{m}</span>)}</span>}
                  {s.badges && s.badges.length > 0 && <span className="oc-block-route-steps-badges">{s.badges.map((b, k) => <Fragment key={k}>{b}</Fragment>)}</span>}
                </span>
              </button>
              {s.status != null && (s.statusTooltip
                ? <span className="oc-block-route-steps-status oc-tooltip oc-tooltip--left" data-tooltip={s.statusTooltip} tabIndex={0}><span className={cx("oc-badge", s.statusTone && `oc-badge--${s.statusTone}`)}>{s.status}</span></span>
                : <span className={cx("oc-badge", s.statusTone && `oc-badge--${s.statusTone}`, "oc-block-route-steps-status")}>{s.status}</span>)}
              {(onMove || onDuplicate || onRemove) && (
                <>
                  <button className="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popoverTarget={menuId} aria-label={L.actions(n)}>{node("mdi:dots-vertical")}</button>
                  <div className="oc-dropdown-menu" id={menuId} {...attrs({ popover: "" })}>
                    {onMove && <DropdownItem icon="mdi:arrow-up" disabled={i === 0} onClick={() => move(s.id, i - 1)}>{L.up}</DropdownItem>}
                    {onMove && <DropdownItem icon="mdi:arrow-down" disabled={i === steps.length - 1} onClick={() => move(s.id, i + 1)}>{L.down}</DropdownItem>}
                    {onDuplicate && <DropdownItem icon="mdi:content-copy" onClick={() => onDuplicate(s.id)}>{L.duplicate}</DropdownItem>}
                    {onRemove && <><DropdownSeparator /><DropdownItem icon="mdi:trash-can-outline" className="oc-dropdown-item--destructive" onClick={() => onRemove(s.id)}>{L.remove}</DropdownItem></>}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
      {shown === 0 && <p className="oc-block-route-steps-empty">{L.empty}</p>}
      {footer != null && <div className="oc-block-route-steps-foot">{footer}</div>}
      <p className="oc-block-route-steps-status-line oc-visually-hidden" aria-live="polite">{status}</p>
    </section>
  );
});
