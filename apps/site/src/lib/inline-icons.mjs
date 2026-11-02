// File: apps/site/src/lib/inline-icons.mjs
// Build time: <iconify-icon icon="set:name"> in a demo preview becomes an inline <svg> from the local @iconify-json
// collections. The previews then draw at once, without a request to the Iconify API and without a shadow root per
// icon (that made long pages stutter while scrolling). The code tabs keep the <iconify-icon> markup (taken earlier).
// Map: load a collection (cached) -> icon data (aliases) -> svg markup -> replace in one demo
// Skipped: icons a script changes later (inside [data-oc-favorite]) and icons with rotate or flip.

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const SETS = ["mdi", "mdi-light", "material-symbols", "svg-spinners", "flag", "vscode-icons"];
const cache = new Map();

function collection(prefix) {
  if (!SETS.includes(prefix)) return null;
  if (!cache.has(prefix)) {
    try { cache.set(prefix, require(`@iconify-json/${prefix}/icons.json`)); } catch { cache.set(prefix, null); }
  }
  return cache.get(prefix);
}

/** { body, width, height } of "set:name", following aliases; null when unknown. */
export function iconData(name) {
  const [prefix, id] = String(name).split(":");
  const set = id && collection(prefix);
  if (!set) return null;
  let key = id;
  for (let i = 0; i < 5 && !set.icons[key] && set.aliases?.[key]; i++) key = set.aliases[key].parent;
  const icon = set.icons[key];
  if (!icon) return null;
  return { body: icon.body, width: icon.width || set.width || 16, height: icon.height || set.height || 16 };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Inline SVG for one iconify-icon element (linkedom element), or null to keep the element. */
function svgFor(el) {
  if (el.hasAttribute("rotate") || el.hasAttribute("flip") || el.closest("[data-oc-favorite]")) return null;
  const data = iconData(el.getAttribute("icon"));
  if (!data) return null;
  const ratio = Math.round((data.width / data.height) * 1000) / 1000;
  const keep = ["class", "style", "aria-hidden", "aria-label", "role", "title", "id"]
    .filter((a) => el.hasAttribute(a))
    .map((a) => ` ${a}="${esc(el.getAttribute(a))}"`).join("");
  const size = (attr, fallback) => { const v = el.getAttribute(attr); return v && v !== "unset" && v !== "auto" ? (/^\d+(\.\d+)?$/.test(v) ? `${v}px` : v) : fallback; };
  const hidden = el.hasAttribute("aria-label") || el.hasAttribute("aria-hidden") ? "" : ' aria-hidden="true"';
  return `<svg data-icon="${esc(el.getAttribute("icon"))}"${keep}${hidden} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.width} ${data.height}" width="${size("width", `${ratio}em`)}" height="${size("height", "1em")}">${data.body}</svg>`;
}

/** Replace the iconify-icon elements under root (a demo) with inline SVG. Returns the number replaced. */
export function inlineIcons(document, root) {
  let n = 0;
  for (const el of [...root.querySelectorAll("iconify-icon[icon]")]) {
    const svg = svgFor(el);
    if (!svg) continue;
    const tpl = document.createElement("template");
    tpl.innerHTML = svg;
    el.replaceWith(tpl.content.firstChild);
    n++;
  }
  return n;
}
