// File: scripts/lib/code-tabs.mjs | Map: docs pages -> demos (<oc-demo> + its <oc-code> tabs) -> wrapper index (React/Vue/Blade per
// oc-class) -> converters HTML -> JSX (React tab) / Vue template / Blade (Blade + Livewire tab)
// Shared by scripts/gen-code-tabs.mjs (writes missing tabs) and scripts/check-code-tabs.mjs (typechecks the React/Vue tabs).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CONTENT = path.join(REPO, "apps/site/src/content/ui");
export const FOLDERS = ["components", "blocks"];
export const FRAMEWORK_LANGS = ["tsx", "vue", "blade", "livewire"];

/** All docs pages with demos: [{ folder, page, rel, file }]. */
export function listPages() {
  return FOLDERS.flatMap((folder) => fs.readdirSync(path.join(CONTENT, folder)).filter((f) => f.endsWith(".html")).sort()
    .map((f) => ({ folder, page: f.slice(0, -5), rel: `${folder}/${f}`, file: path.join(CONTENT, folder, f) })));
}

export const escapeCode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const decodeEntities = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|quot|apos|amp|nbsp);/gi, (m, e) => {
  const k = e.toLowerCase();
  if (k[0] === "#") return String.fromCodePoint(k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10));
  return { lt: "<", gt: ">", quot: '"', apos: "'", amp: "&", nbsp: " " }[k];
});

/** Same as apps/site/src/lib/highlight.mjs dedent (kept here so the scripts do not depend on the site build). */
export function dedent(code) {
  const lines = code.replace(/\r\n?/g, "\n").replace(/\t/g, "  ").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join("\n");
}

const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

/**
 * Demos of a page source, in order. Positions are offsets in `src`.
 * { index, open, close, attrs, title, pro, codes: [{ lang, code }], preview } — preview = the markup without <oc-code> blocks,
 * as transform.mjs shows it in the HTML tab (data-oc-demo-only removed, dedented).
 */
export function parseDemos(src) {
  const demos = [];
  const re = /<oc-demo\b([^>]*)>([\s\S]*?)<\/oc-demo>/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] === undefined ? "" : decodeEntities(a[2]);
    const before = src.slice(0, m.index);
    const headings = [...before.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/g)];
    const heading = headings.length ? stripTags(headings[headings.length - 1][2]) : "";
    const codes = [...m[2].matchAll(/<oc-code\b([^>]*)>([\s\S]*?)<\/oc-code>/g)]
      .map((c) => ({ lang: c[1].match(/\blang="([^"]*)"/)?.[1] || "html", code: decodeEntities(c[2]) }));
    const previewRaw = m[2].replace(/<oc-code\b[\s\S]*?<\/oc-code>/g, "");
    demos.push({
      index: demos.length + 1,
      open: m.index,
      close: m.index + m[0].length - "</oc-demo>".length,
      attrs,
      title: attrs.title || heading,
      pro: "pro" in attrs,
      codes,
      preview: dedent(previewRaw.replace(/\s+data-oc-demo-only="[^"]*"/g, "")),
    });
  }
  return demos;
}

/** The markup the framework tabs are made from: the given HTML tab, else the preview. */
export const demoMarkup = (demo) => (demo.codes.find((c) => c.lang === "html")?.code.trim() ? dedent(demo.codes.find((c) => c.lang === "html").code) : demo.preview);

// ------------------------------------------------------------------------------------------------- wrapper index

/** Base classes (no BEM element or modifier) on the first element of a snippet: its root class(es). */
function snippetRoots(file) {
  if (!fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const first = html.match(/<[a-z][\w-]*\b[^>]*\bclass="([^"]*)"/);
  return first ? first[1].split(/\s+/).filter((c) => /^oc-[a-z0-9-]+$/.test(c) && !c.includes("--")) : [];
}

const pascal = (s) => s.replace(/(^|[-_\s.]+)([a-z0-9])/gi, (_, __, c) => c.toUpperCase());

/**
 * key (manifest name: "button", "about-timeline") -> { roots: ["oc-btn"], react: [...exports], vue: [...names], blade: [...tags] }
 * Roots come from the snippet the wrappers render (packages/ui/snippets, packages/blocks/blocks).
 */
export function wrapperIndex() {
  const index = new Map();
  const get = (key, kind) => {
    if (!index.has(key)) {
      const snippet = kind === "block" ? path.join(REPO, "packages/blocks/blocks", `${key}.html`) : path.join(REPO, "packages/ui/snippets", `${key}.html`);
      const own = kind === "block" ? `oc-block-${key}` : `oc-${key}`;
      index.set(key, { key, kind, own, candidates: snippetRoots(snippet), roots: [own], react: [], vue: [], blade: [] });
    }
    return index.get(key);
  };
  const snippetKey = (s) => s.split("/").pop().replace(/\.html$/, "");

  const react = JSON.parse(fs.readFileSync(path.join(REPO, "packages/react/manifest.json"), "utf8")).items;
  for (const item of react) {
    const src = fs.readFileSync(path.join(REPO, "packages/react", item.file), "utf8");
    const names = [...src.matchAll(/^export (?:const|function) ([A-Z]\w*)/gm)].map((x) => x[1]);
    get(item.snippet ? snippetKey(item.snippet) : item.name, item.kind).react.push(...names);
  }
  const vue = JSON.parse(fs.readFileSync(path.join(REPO, "packages/vue/manifest.json"), "utf8")).items;
  for (const item of vue) get(item.snippet ? snippetKey(item.snippet) : kebabCase(item.name.replace(/^Oc/, "")), item.kind).vue.push(item.name);

  const bladeDir = path.join(REPO, "php-packages/omniaui-laravel/resources/views/components");
  const walk = (dir, prefix = "") => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory()
    ? walk(path.join(dir, e.name), `${prefix}${e.name}.`) : e.name.endsWith(".blade.php") ? [`${prefix}${e.name.slice(0, -10)}`] : []);
  for (const name of walk(bladeDir)) {
    if (name.startsWith("wire.")) continue; // Livewire-bound inputs: the Livewire tab, not a wrapper of its own
    const block = name.startsWith("block.");
    const parts = (block ? name.slice(6) : name).split(".");
    const key = parts[0] === "index" ? null : parts[0];
    if (!key) continue;
    get(key, block ? "block" : "component").blade.push(`x-oc::${name.replace(/\.index$/, "")}`);
  }
  // A root class shared by the snippets of several wrappers (oc-modal for modal, alert-dialog, …) says nothing: keep the unique ones.
  const seen = new Map();
  for (const w of index.values()) for (const c of new Set(w.candidates)) seen.set(c, (seen.get(c) || 0) + 1);
  for (const w of index.values()) w.roots = [...new Set([w.own, ...w.candidates.filter((c) => seen.get(c) === 1)])];
  // … except these, which belong to one wrapper (the others only reuse the class).
  const OWNER = { "oc-btn": "button", "oc-field": "form-field", "oc-input": "input", "oc-card": "card", "oc-table-wrap": "table",
    "oc-accordion": "accordion", "oc-panel": "panel", "oc-browser-frame": "browser-frame", "oc-block-stats": "stats" };
  for (const [cls, key] of Object.entries(OWNER)) index.get(key)?.roots.push(cls);
  // Webicons are a custom element in the HTML; the wrappers render it.
  if (index.has("webicon")) index.get("webicon").tags = ["iconify-icon"];
  return index;
}

/** Wrappers (per framework) for the oc-classes and custom elements used in a piece of markup. */
export function wrappersFor(markup, index, primaryKey) {
  const classes = new Set([...markup.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
  const hits = [];
  for (const w of index.values()) {
    const used = w.key === primaryKey || w.roots.some((r) => classes.has(r)) || (w.tags || []).some((t) => markup.includes(`<${t}`));
    if (used && (w.react.length || w.vue.length || w.blade.length)) hits.push(w);
  }
  hits.sort((a, b) => (b.key === primaryKey) - (a.key === primaryKey) || a.key.localeCompare(b.key));
  return hits.map((w) => ({ key: w.key, primary: w.key === primaryKey, react: w.react, vue: w.vue, blade: w.blade }));
}

// ------------------------------------------------------------------------------------------------- HTML -> JSX / Vue

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const SVG_TAGS = Object.fromEntries(["animateMotion", "animateTransform", "clipPath", "feBlend", "feColorMatrix", "feComposite", "feDropShadow",
  "feFlood", "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "feTurbulence", "foreignObject", "linearGradient",
  "radialGradient", "textPath"].map((t) => [t.toLowerCase(), t]));
const SVG_EMPTY = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop", "use", "animate", "animatetransform", "image"]);
const PHRASING = new Set(["a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small",
  "span", "strong", "sub", "sup", "time", "u", "var"]);
const BOOL = new Set(["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "defer", "disabled", "formnovalidate",
  "hidden", "inert", "itemscope", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required",
  "reversed", "selected"]);
const JSX_NAMES = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength", minlength: "minLength",
  inputmode: "inputMode", autocomplete: "autoComplete", autofocus: "autoFocus", datetime: "dateTime", novalidate: "noValidate",
  colspan: "colSpan", rowspan: "rowSpan", spellcheck: "spellCheck", popovertarget: "popoverTarget", popovertargetaction: "popoverTargetAction",
  hreflang: "hrefLang", crossorigin: "crossOrigin", srcset: "srcSet", enctype: "encType", "accept-charset": "acceptCharset",
  "http-equiv": "httpEquiv", contenteditable: "contentEditable", accesskey: "accessKey", enterkeyhint: "enterKeyHint",
  fetchpriority: "fetchPriority", referrerpolicy: "referrerPolicy", frameborder: "frameBorder", allowfullscreen: "allowFullScreen",
  playsinline: "playsInline", autoplay: "autoPlay", srcdoc: "srcDoc", usemap: "useMap", formaction: "formAction", formmethod: "formMethod",
  formnovalidate: "formNoValidate", formtarget: "formTarget", charset: "charSet", cellpadding: "cellPadding", cellspacing: "cellSpacing",
  "xlink:href": "xlinkHref", "xmlns:xlink": "xmlnsXlink", "xml:space": "xmlSpace", "xml:lang": "xmlLang",
};
const JSX_NUMBERS = new Set(["tabIndex", "rows", "cols", "colSpan", "rowSpan", "maxLength", "minLength", "size", "span", "start", "high", "low",
  "optimum", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-level", "aria-posinset", "aria-setsize", "aria-colcount",
  "aria-colindex", "aria-colspan", "aria-rowcount", "aria-rowindex", "aria-rowspan"]);
const KEEP_VALUE = new Set(["option", "progress", "meter", "li", "button", "data", "output", "param"]);

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const isWs = (n) => n.nodeType === 3 && !n.textContent.trim();

/** Parse a markup fragment into nodes (linkedom keeps whitespace and comments). */
export function parseFragment(html) {
  const { document } = parseHTML(`<!doctype html><html><head></head><body>${html}</body></html>`);
  return [...document.body.childNodes];
}

/** CSS declarations of a style attribute (split on ; outside quotes and brackets). */
function styleDecls(style) {
  const out = [];
  let buf = "", depth = 0, quote = null;
  for (const ch of style) {
    if (quote) { if (ch === quote) quote = null; buf += ch; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  out.push(buf);
  return out.map((d) => d.trim()).filter(Boolean).map((d) => {
    const i = d.indexOf(":");
    return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
  }).filter(([k, v]) => k && v);
}

function styleObject(style, ctx) {
  const decls = styleDecls(style);
  if (!decls.length) return null;
  let custom = false;
  const props = decls.map(([k, v]) => {
    let key;
    if (k.startsWith("--")) { custom = true; key = JSON.stringify(k); }
    else {
      const name = k.toLowerCase().replace(/^-ms-/, "ms-").replace(/^-(webkit|moz|o)-/, (_, p) => `${p[0].toUpperCase()}${p.slice(1)}-`);
      key = camel(name);
      if (!/^[A-Za-z_$][\w$]*$/.test(key)) key = JSON.stringify(key);
    }
    return `${key}: ${JSON.stringify(v)}`;
  });
  if (custom) ctx.cssProperties = true;
  return `{{ ${props.join(", ")} }${custom ? " as CSSProperties" : ""}}`;
}

const jsxString = (v) => (/["\n\\]|&[#\w]+;/.test(v) ? `{${JSON.stringify(v)}}` : `"${v}"`);
const jsxText = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");

function jsxAttrs(el, ctx) {
  const tag = el.localName;
  const svg = !!el.closest?.("svg");
  const out = [];
  for (const a of [...el.attributes]) {
    let name = a.name, value = a.value;
    if (/^on[a-z]+$/.test(name)) { ctx.dropped.add("inline event handlers"); continue; }
    if (name === "style") { const s = styleObject(value, ctx); if (s) out.push(`style=${s}`); continue; }
    if (tag === "option" && name === "selected") continue; // becomes defaultValue on the <select>
    if (name === "checked" && tag === "input") name = "defaultChecked";
    else if (name === "value" && !KEEP_VALUE.has(tag) && !(tag === "input" && /^(checkbox|radio|button|submit|reset|hidden|image)$/i.test(el.getAttribute("type") || ""))) name = "defaultValue";
    else if (JSX_NAMES[name]) name = JSX_NAMES[name];
    else if (svg && /^[a-z]+(-[a-z]+)+$/.test(name) && !/^(aria|data)-/.test(name)) name = camel(name);
    if (BOOL.has(a.name) && (value === "" || value.toLowerCase() === a.name)) { out.push(name); continue; }
    if (JSX_NUMBERS.has(name) && /^-?\d+(\.\d+)?$/.test(value)) { out.push(`${name}={${value}}`); continue; }
    out.push(`${name}=${jsxString(value)}`);
  }
  if (tag === "select") {
    const sel = [...el.querySelectorAll("option")].find((o) => o.hasAttribute("selected"));
    if (sel && !el.hasAttribute("multiple")) out.push(`defaultValue=${jsxString(sel.getAttribute("value") ?? sel.textContent.trim())}`);
  }
  if (tag === "textarea" && el.textContent) out.push(`defaultValue={${JSON.stringify(el.textContent.replace(/^\n/, ""))}}`);
  return out.length ? ` ${out.join(" ")}` : "";
}

/** Whitespace between two siblings that JSX would drop but HTML shows as a space. */
const needsSpace = (prev, next) => prev && next && prev.nodeType === 1 && next.nodeType === 1 && PHRASING.has(prev.localName) && PHRASING.has(next.localName);

/** Adjacent text nodes (the parser splits text at a stray "<") as one. */
function mergeText(nodes) {
  const out = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.nodeType === 3 && last?.nodeType === 3) out[out.length - 1] = { nodeType: 3, textContent: last.textContent + n.textContent };
    else out.push(n);
  }
  return out;
}

function toJsx(nodes, ctx, pre = false) {
  let out = "";
  const list = mergeText(nodes).filter((n) => !(n.nodeType === 1 && (n.localName === "script" || n.localName === "style")) || (ctx.dropped.add(`<${n.localName}>`), false));
  list.forEach((n, i) => {
    const prev = list[i - 1], next = list[i + 1];
    if (n.nodeType === 3) {
      const text = n.textContent;
      if (pre) { if (text) out += `{${JSON.stringify(text)}}`; return; }
      if (!text.trim()) {
        // A gap left by a dropped <script> collapses to one line break.
        out += needsSpace(prev, next) && text.includes("\n") ? `{" "}${text}` : text;
        return;
      }
      const [, lead, core, trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      out += (lead.includes("\n") && prev ? `{" "}${lead}` : lead) + jsxText(core) + (trail.includes("\n") && next ? `{" "}${trail}` : trail);
      return;
    }
    if (n.nodeType === 8) { out += `{/* ${n.textContent.trim().replace(/\*\//g, "* /")} */}`; return; }
    if (n.nodeType !== 1) return;
    const tag = SVG_TAGS[n.localName] || n.localName;
    const attrs = jsxAttrs(n, ctx);
    if (n.localName === "textarea") { out += `<${tag}${attrs} />`; return; }
    const kids = [...n.childNodes];
    if (!kids.length || kids.every((k) => k.nodeType === 3 && !k.textContent) || (kids.every(isWs) && (VOID.has(n.localName) || SVG_EMPTY.has(n.localName)))) {
      out += `<${tag}${attrs} />`;
      return;
    }
    out += `<${tag}${attrs}>${toJsx(kids, ctx, pre || n.localName === "pre")}</${tag}>`;
  });
  return out;
}

/** Trim leading/trailing whitespace nodes and nodes JSX/Vue cannot carry. */
const meaningful = (nodes) => {
  const list = [...nodes];
  while (list.length && isWs(list[0])) list.shift();
  while (list.length && isWs(list[list.length - 1])) list.pop();
  return list;
};

const indent = (code, pad) => code.split("\n").map((l) => (l.trim() ? pad + l : "")).join("\n");
const tidy = (code) => code.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");

/** React tab: `export function Example() { return (...) }` with the demo markup as JSX. */
export function htmlToReact(html) {
  const ctx = { dropped: new Set(), cssProperties: false };
  const nodes = meaningful(parseFragment(html));
  const roots = nodes.filter((n) => !isWs(n) && !(n.nodeType === 1 && (n.localName === "script" || n.localName === "style")));
  let jsx = tidy(toJsx(nodes, ctx)).trim();
  if (roots.length !== 1 || roots[0].nodeType !== 1) jsx = `<>\n${indent(jsx, "  ")}\n</>`;
  const head = ctx.cssProperties ? 'import type { CSSProperties } from "react";\n\n' : "";
  return { code: `${head}export function Example() {\n  return (\n${indent(jsx, "    ")}\n  );\n}`, dropped: [...ctx.dropped] };
}

// Vue: newlines inside <pre>/<textarea> must not get the template indentation; they travel as \u0000 until the end.
const vueAttrValue = (v) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const vueText = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{\{/g, "{{ '{{' }}");

function toVue(nodes, ctx, pre = false) {
  let out = "";
  for (const n of mergeText(nodes)) {
    if (n.nodeType === 3) { const t = vueText(n.textContent); out += pre ? t.replace(/\n/g, "\u0000") : t; continue; }
    if (n.nodeType === 8) { out += `<!-- ${n.textContent.trim()} -->`; continue; }
    if (n.nodeType !== 1) continue;
    if (n.localName === "script" || n.localName === "style") { ctx.dropped.add(`<${n.localName}>`); continue; }
    const tag = SVG_TAGS[n.localName] || n.localName;
    const attrs = [...n.attributes].filter((a) => !/^on[a-z]+$/.test(a.name) || (ctx.dropped.add("inline event handlers"), false))
      .map((a) => (BOOL.has(a.name) && (a.value === "" || a.value.toLowerCase() === a.name) ? a.name : `${a.name}="${vueAttrValue(a.value)}"`));
    const open = `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}`;
    const kids = [...n.childNodes];
    if (VOID.has(n.localName)) { out += `${open} />`; continue; }
    if ((!kids.length || kids.every(isWs)) && (n.closest?.("svg") || SVG_EMPTY.has(n.localName))) { out += `${open} />`; continue; }
    const p = pre || n.localName === "pre" || n.localName === "textarea";
    out += `${open}>${toVue(kids, ctx, p)}</${tag}>`;
  }
  return out;
}

/** Vue tab: a single-file component with the demo markup as its template. */
export function htmlToVue(html) {
  const ctx = { dropped: new Set() };
  const body = tidy(toVue(meaningful(parseFragment(html)), ctx)).trim();
  return { code: `<template>\n${indent(body, "  ").replace(/\u0000/g, "\n")}\n</template>`, dropped: [...ctx.dropped] };
}

// Blade compiles these @words; anything else (e-mail addresses, CSS at-rules) stays text.
const BLADE_DIRECTIVES = ["if", "elseif", "else", "endif", "unless", "endunless", "isset", "endisset", "empty", "endempty", "auth", "endauth",
  "guest", "endguest", "env", "endenv", "production", "endproduction", "switch", "case", "break", "default", "endswitch", "for", "endfor",
  "foreach", "endforeach", "forelse", "endforelse", "while", "endwhile", "continue", "php", "endphp", "include", "includeIf", "includeWhen",
  "includeUnless", "includeFirst", "each", "once", "endonce", "push", "endpush", "pushOnce", "endPushOnce", "prepend", "endprepend", "stack",
  "section", "endsection", "show", "yield", "extends", "parent", "props", "aware", "class", "style", "checked", "selected", "disabled",
  "readonly", "required", "csrf", "method", "error", "enderror", "json", "js", "lang", "choice", "can", "cannot", "canany", "endcan",
  "verbatim", "endverbatim", "inject", "fragment", "endfragment", "session", "endsession", "use", "vite", "stop", "append", "overwrite",
  "hasSection", "sectionMissing", "component", "endcomponent", "slot", "endslot", "livewire", "livewireStyles", "livewireScripts", "script",
  "endscript", "assets", "endassets", "teleport", "endteleport", "persist", "endpersist", "entangle", "this", "dd", "dump", "context",
  "omniacss"]; // @omniacss: the asset directive of omniaui-laravel
const DIRECTIVE_RE = new RegExp(`(^|[^\\w@])@(${BLADE_DIRECTIVES.join("|")})\\b`, "g");

/** Blade is HTML: the markup itself, with Blade syntax in it escaped. */
export function htmlToBlade(html) {
  return html.replace(/\{\{--/g, "@{{--").replace(/(^|[^@])\{\{/g, "$1@{{").replace(/(^|[^@])\{!!/g, "$1@{!!")
    .replace(DIRECTIVE_RE, "$1@@$2").replace(/<\?(php|=)/g, "&lt;?$1");
}

/** Livewire tab: a component class with render() and the Blade view (one root element, as Livewire requires). */
export function livewireTab(className, viewName, blade) {
  const roots = meaningful(parseFragment(blade)).filter((n) => !isWs(n));
  // A Blade component (<x-oc::…>) as the only root is not enough: Livewire needs an HTML tag around it.
  const single = roots.length === 1 && roots[0].nodeType === 1 && !["script", "style", "template"].includes(roots[0].localName) && !/^x-|:/.test(roots[0].localName);
  const view = single ? blade : `<div>\n${indent(blade, "    ")}\n</div>`;
  return `<?php

namespace App\\Livewire;

use Livewire\\Component;

class ${className} extends Component
{
    public function render()
    {
        return view('livewire.${viewName}');
    }
}

{{-- resources/views/livewire/${viewName}.blade.php --}}
${view}`;
}

export const pascalCase = pascal;
export const kebabCase = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
