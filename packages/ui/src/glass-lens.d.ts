// File: packages/ui/src/glass-lens.d.ts
// Types for the lens of the glass (.oc-glass, .oc-glass-bar): Chromium bends the backdrop at the edge. Plus the optional
// drag: data-oc-glass-drag moves a sheet over its backdrop.

/** Default displacement scale (-80): a bigger number bends more, the minus sign turns the direction. */
export const LENS_SCALE: number;
/** The sheets initGlassLens and the auto-start give a lens. */
export const LENS_SELECTOR: string;
/** True in Chromium browsers (Chrome, Edge, Opera, Electron), the only ones that apply url() in backdrop-filter. */
export function supportsGlassLens(nav?: Navigator): boolean;
/** The displacement map for a sheet of w x h px (SVG data URI). */
export function lensMap(w: number, h: number, radius?: number): string;
/** The scale used on a sheet of w x h: full from a short side of 160px, proportionally less below. */
export function lensScale(w: number, h: number, scale?: number): number;
/** Filter id for a size and scale: "oc-lens-320x180". */
export function lensId(w: number, h: number, scale?: number): string;
/** Makes or reuses the filter for w x h (one per size) and counts a user; returns its id. */
export function acquireLens(doc: Document, w: number, h: number, scale?: number, radius?: number): string;
/** One user less; the filter goes away when nobody uses it. */
export function releaseLens(doc: Document, id: string): void;
/** Number of lens filters on the page. */
export function lensCount(): number;
/** Gives one sheet the lens (--oc-glass-lens, data-oc-lens) and follows its size; returns a function that removes it.
 *  Outside Chromium it only adds html.oc-no-lens (frosted glass). `force` skips the browser check (tests). */
export function bindGlassLens(el: HTMLElement, options?: { force?: boolean }): () => void;
/** Gives every glass sheet in scope the lens. */
export function initGlassLens(scope?: ParentNode, options?: { force?: boolean }): Array<() => void>;

/** The sheets initGlassDrag and the auto-start make draggable: "[data-oc-glass-drag]". */
export const DRAG_SELECTOR: string;
/** Keyboard step in px for the arrow keys (Shift: four times as far). */
export const DRAG_STEP: number;
/** x/y clamped so the sheet stays inside its area (closest [data-oc-glass-drag-area], else the parent). */
export function clampGlassDrag(el: HTMLElement, x: number, y: number, state?: { x: number; y: number }): [number, number];
/** Moves a draggable sheet to x/y px from its place in the layout (clamped); fires "oc-glass-move" with { x, y }. */
export function moveGlass(el: HTMLElement, x: number, y: number): void;
/** Makes one sheet draggable with mouse, touch and keyboard (focusable, arrows, Home); returns a function that undoes it.
 *  `label` is the aria-label when the sheet has none (default "Drag to move"). */
export function bindGlassDrag(el: HTMLElement, options?: { label?: string }): () => void;
/** Makes every [data-oc-glass-drag] in scope draggable. */
export function initGlassDrag(scope?: ParentNode): Array<() => void>;
