// File: packages/react/src/webicons.ts (the same file lives in packages/vue/src/webicons.ts)
// Map: types -> registry (single icons, whole sets per prefix, built-ins last; version + listeners) -> register / add
//      -> resolve (aliases, set defaults) -> svg parts (viewBox, ratio, body with transforms and unique ids) -> dev warning
// The webicon registry: the OmniaCSS webicons (Iconify sets MDI, MDI Light, Material Symbols, SVG Spinners, Flags,
// VSCode Icons) drawn as inline SVG from data the app bundles itself. Nothing is fetched: an app registers a whole
// Iconify JSON set, part of one, or a subset file made with `npx omniaui webicons`.

import { BUILTIN_WEBICONS } from "./webicons-builtin";

/** One icon: the SVG body on its own box (Iconify icon format). */
export interface WebiconData {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  /** Quarter turns (1 = 90deg). */
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

/** An Iconify JSON collection, e.g. `@iconify-json/mdi/icons.json`. */
export interface WebiconSet {
  prefix: string;
  icons: Record<string, WebiconData>;
  aliases?: Record<string, Omit<WebiconData, "body"> & { parent: string }>;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

/** Icons by full name ("mdi:home"): Iconify icon data, an SVG body ("<path …/>") or path data on a 24x24 box. */
export type WebiconMap = Record<string, WebiconData | string>;

/** A resolved icon, ready to draw. */
export interface ResolvedWebicon extends WebiconData {
  width: number;
  height: number;
  left: number;
  top: number;
}

const singles = new Map<string, WebiconData>();
const sets = new Map<string, WebiconSet[]>();
const listeners = new Set<() => void>();
let version = 0;

const changed = () => {
  version++;
  listeners.forEach((l) => l());
};

/** @internal Re-render hook for the wrappers: called after every register / add. */
export function subscribeWebicons(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** @internal */
export const webiconsVersion = () => version;

const isSet = (v: unknown): v is WebiconSet =>
  typeof v === "object" && v !== null && typeof (v as WebiconSet).prefix === "string" && typeof (v as WebiconSet).icons === "object";

const fromString = (v: string): WebiconData =>
  v.trimStart().startsWith("<") ? { body: v, width: 24, height: 24 } : { body: `<path fill="currentColor" d="${v}"/>`, width: 24, height: 24 };

function fromSet(set: WebiconSet, name: string): ResolvedWebicon | undefined {
  let extra: Omit<WebiconData, "body"> = {};
  let rotate = 0;
  let hFlip = false;
  let vFlip = false;
  let n = name;
  for (let depth = 0; depth < 6; depth++) {
    const icon = set.icons[n];
    if (icon) {
      return {
        left: set.left ?? 0,
        top: set.top ?? 0,
        width: set.width ?? 16,
        height: set.height ?? 16,
        ...icon,
        ...extra,
        body: icon.body,
        rotate: ((icon.rotate ?? 0) + rotate) % 4,
        hFlip: !!icon.hFlip !== hFlip,
        vFlip: !!icon.vFlip !== vFlip,
      };
    }
    const alias = set.aliases?.[n];
    if (!alias) return undefined;
    const { parent, rotate: r = 0, hFlip: h = false, vFlip: v = false, ...rest } = alias;
    extra = { ...rest, ...extra };
    rotate += r;
    hFlip = hFlip !== h;
    vFlip = vFlip !== v;
    n = parent;
  }
  return undefined;
}

const complete = (d: WebiconData): ResolvedWebicon => ({ left: 0, top: 0, width: 24, height: 24, ...d });

/**
 * Registers an Iconify JSON set. Without `names` the whole set is kept (only a reference: nothing is copied);
 * with `names` only those icons ("home" or "mdi:home"), so the rest can be dropped.
 * `registerWebicons(mdi)` after `import mdi from "@iconify-json/mdi/icons.json"`.
 */
export function registerWebicons(set: WebiconSet, names?: string[]): void {
  if (!isSet(set)) throw new TypeError("registerWebicons: expected an Iconify JSON set with prefix and icons");
  if (names) {
    for (const raw of names) {
      const name = raw.startsWith(`${set.prefix}:`) ? raw.slice(set.prefix.length + 1) : raw;
      const icon = fromSet(set, name);
      if (icon) singles.set(`${set.prefix}:${name}`, icon);
      else warnOnce(`${set.prefix}:${name}`, "is not in the set passed to registerWebicons");
    }
  } else {
    sets.set(set.prefix, [set, ...(sets.get(set.prefix) ?? []).filter((s) => s !== set)]);
  }
  changed();
}

/**
 * Adds icons: an Iconify JSON set (same as registerWebicons) or a map by full name, such as the subset file made
 * by `npx omniaui webicons` ({ "mdi:home": { body, width, height } }), an SVG body or a 24x24 path:
 * `addWebicons({ "mdi:home": "M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" })`.
 */
export function addWebicons(icons: WebiconSet | WebiconMap): void {
  if (isSet(icons)) return registerWebicons(icons);
  for (const [name, value] of Object.entries(icons)) {
    if (!name.includes(":")) {
      warnOnce(name, "needs a prefix (mdi:home)");
      continue;
    }
    singles.set(name, typeof value === "string" ? fromString(value) : value);
  }
  changed();
}

/** The icon, resolved (app icons first, then registered sets, then the built-in set), or undefined. */
export function getWebicon(name: string): ResolvedWebicon | undefined {
  const single = singles.get(name);
  if (single) return complete(single);
  const i = name.indexOf(":");
  if (i > 0) {
    for (const set of sets.get(name.slice(0, i)) ?? []) {
      const icon = fromSet(set, name.slice(i + 1));
      if (icon) return icon;
    }
  }
  const builtin = BUILTIN_WEBICONS[name];
  return builtin ? complete(builtin) : undefined;
}

/** True when the icon can be drawn. */
export const hasWebicon = (name: string): boolean => getWebicon(name) !== undefined;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Gives the ids inside the body a suffix, so two copies of the same icon on one page do not share a gradient. */
function uniqueIds(body: string, suffix: string): string {
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    body = body.replace(new RegExp(`([#;"])(${escapeRe(id)})([")]|\\.[a-z])`, "g"), `$1$2-${suffix}$3`);
  }
  return body;
}

/** @internal viewBox, width:height ratio and inner HTML (optional <title>) of an icon. */
export function webiconSvg(icon: ResolvedWebicon, label?: string, idSuffix?: string): { viewBox: string; ratio: number; html: string } {
  const { left, top, width: w, height: h } = icon;
  const t: string[] = [];
  if (icon.rotate) t.push(`rotate(${icon.rotate * 90} ${left + w / 2} ${top + h / 2})`);
  if (icon.hFlip) t.push(`translate(${2 * left + w} 0) scale(-1 1)`);
  if (icon.vFlip) t.push(`translate(0 ${2 * top + h}) scale(1 -1)`);
  let body = t.length ? `<g transform="${t.join(" ")}">${icon.body}</g>` : icon.body;
  if (idSuffix && body.includes(" id=")) body = uniqueIds(body, idSuffix);
  return {
    viewBox: `${left} ${top} ${w} ${h}`,
    ratio: Math.round((w / h) * 10000) / 10000,
    html: (label ? `<title>${escapeHtml(label)}</title>` : "") + body,
  };
}

declare const process: { env: { NODE_ENV?: string } };
const isDev = (() => {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
})();
const warned = new Set<string>();

/** @internal One console warning per name, in development only. */
export function warnOnce(name: string, why = "is not registered"): void {
  if (!isDev || warned.has(name)) return;
  warned.add(name);
  console.warn(`[OmniaUI] Webicon "${name}" ${why}. Register it with registerWebicons() / addWebicons(), or make a subset with "npx omniaui webicons".`);
}

/** @internal True when the Iconify web component is loaded (the iconify fallback can draw). */
export const hasIconifyRuntime = (): boolean => typeof customElements !== "undefined" && customElements.get("iconify-icon") !== undefined;
