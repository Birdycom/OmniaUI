// File: php-packages/omniaui-laravel/tools/build-blocks.mjs
// Generates resources/views/components/block/<name>.blade.php from packages/blocks/blocks/<name>.html.
// Each block keeps the exact snippet markup/classes. The root element gets $attributes->merge(), named slots
// replace a region (falling back to the snippet content), and the default slot replaces the main region.
// Usage: node php-packages/omniaui-laravel/tools/build-blocks.mjs
//        [--src <snippet dir> --out <view dir> --config <module exporting CONFIG and optionally MANUAL>]
// The options let OmniaUI Pro generate its own block views with this same generator.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const here = path.dirname(fileURLToPath(import.meta.url));
const { values: opts } = parseArgs({ options: { src: { type: "string" }, out: { type: "string" }, config: { type: "string" } } });
const SRC = path.resolve(opts.src ?? path.resolve(here, "../../../packages/blocks/blocks"));
const OUT = path.resolve(opts.out ?? path.resolve(here, "../resources/views/components/block"));
const external = opts.config ? await import(pathToFileURL(path.resolve(opts.config)).href) : null;

/**
 * Slot config. `inner: true` replaces the children of the matched element (the element itself stays),
 * otherwise the whole element is replaced. `from` starts searching after the first line containing it,
 * `nth` picks the nth match (1-based). `default` marks the default-slot region (inner by default);
 * a block without `default` and without named slots uses the root's children as default slot.
 */
const CONFIG = external?.CONFIG ?? {
  "app-header": {
    slots: [
      { name: "toggle", match: '<label class="oc-btn oc-btn--ghost oc-btn--icon"' },
      { name: "nav", match: '<nav class="oc-block-appbar-nav"', inner: true },
      { name: "actions", match: '<div class="oc-block-appbar-actions"', inner: true },
    ],
  },
  "app-shell": {
    props: "'height' => null",
    merge: { style: "$height ? '--oc-block-shell-height: '.$height : null" },
    slots: [
      { name: "sidebar", match: '<aside class="oc-sidebar' },
      { name: "header", match: '<header class="oc-block-appbar"' },
      { name: "breadcrumbs", match: '<div class="oc-block-shell-breadcrumbs"', inner: true },
    ],
    default: '<main class="oc-block-shell-content"',
  },
  "auth-split": {
    props: "'action' => '#', 'method' => 'post'",
    replaceLine: [['action="#" method="post">', 'action="{{ $action }}" method="{{ $method }}">@unless (strtolower($method) === \'get\') @csrf @endunless']],
    slots: [
      { name: "logo", match: '<a class="oc-block-authsplit-logo"', inner: true },
      { name: "quote", match: '<blockquote class="oc-block-authsplit-quote"', inner: true },
      { name: "title", match: '<h1 class="oc-block-authsplit-title"', inner: true },
      { name: "subtitle", match: '<p class="oc-block-authsplit-subtitle"', inner: true },
      { name: "fields", match: '<div class="oc-block-authsplit-fields"', inner: true },
    ],
  },
  auth: {
    slots: [
      { name: "footer", match: '<div class="oc-block-auth-footer"', inner: true },
    ],
    default: '<div class="oc-block-auth-card"',
  },
  cta: {
    slots: [
      { name: "title", match: "<h2>", inner: true },
      { name: "text", match: "<p>", inner: true },
      { name: "actions", match: '<div class="oc-block-hero-actions"', inner: true },
    ],
  },
  "data-table": {
    slots: [
      { name: "title", match: '<h2 class="oc-block-datatable-title"', inner: true },
      { name: "description", match: '<p class="oc-block-datatable-description"', inner: true },
      { name: "actions", match: "    <div>", from: "oc-block-datatable-head", nth: 2, inner: true },
      { name: "toolbar", match: '<div class="oc-table-toolbar"', inner: true },
      { name: "table", match: '<div class="oc-table-wrap"', inner: true },
      { name: "footer", match: '<div class="oc-table-footer"', inner: true },
    ],
  },
  features: {
    slots: [
      { name: "title", match: "<h2>", inner: true },
      { name: "text", match: "<p>", inner: true },
    ],
    default: '<div class="oc-block-features-grid"',
  },
  "form-page": {
    props: "'action' => '#', 'method' => 'post'",
    rootAttrs: { action: "$action", method: "$method" },
    afterOpen: "@unless (strtolower($method) === 'get') @csrf @endunless",
  },
  hero: {
    slots: [
      { name: "badge", match: '<span class="oc-block-hero-badge"', inner: true },
      { name: "title", match: "<h1>", inner: true },
      { name: "text", match: "<p>", inner: true },
      { name: "actions", match: '<div class="oc-block-hero-actions"', inner: true },
    ],
  },
  "hero-split": {
    slots: [
      { name: "title", match: "<h1>", inner: true },
      { name: "text", match: "<p>", inner: true },
      { name: "actions", match: '<div class="oc-block-hero-actions', inner: true },
      { name: "visual", match: '<div class="oc-block-hero-visual"', inner: true },
    ],
  },
  "module-header": {
    slots: [
      { name: "icon", match: '<span class="oc-block-modulehead-icon"', inner: true },
      { name: "title", match: '<h1 class="oc-block-modulehead-title"', inner: true },
      { name: "intro", match: '<p class="oc-block-modulehead-intro"', inner: true },
      { name: "meta", match: '<div class="oc-block-modulehead-meta"', inner: true },
      { name: "actions", match: '<div class="oc-block-modulehead-actions"', inner: true },
    ],
  },
  "page-hero": {
    slots: [
      { name: "eyebrow", match: '<span class="oc-hero-eyebrow"', inner: true },
      { name: "title", match: '<h1 class="oc-hero-title"', inner: true },
      { name: "text", match: '<p class="oc-hero-text"', inner: true },
      { name: "actions", match: '<div class="oc-hero-actions"', inner: true },
    ],
  },
  pricing: {
    slots: [
      { name: "title", match: "<h2>", inner: true },
      { name: "text", match: "<p>", inner: true },
    ],
    default: '<div class="oc-block-pricing-grid"',
  },
  "site-header": {
    slots: [
      { name: "brand", match: '<a class="oc-site-header__brand"', inner: true },
      { name: "nav", match: '<nav class="oc-site-header__nav"', inner: true },
    ],
  },
  "two-factor": {
    slots: [
      { name: "qr", match: '<div class="oc-block-twofactor-qr"', inner: true },
      { name: "key", match: '<div class="oc-copy-field"' },
      { name: "code", match: '<div class="oc-field">' },
      { name: "recovery", match: '<div class="oc-recovery-codes">' },
    ],
  },
  // 0.6.0 blocks. Named regions stay slots on a full generator run; `default` is the repeating body
  // (inner), same pattern as features / pricing. Status page has no default: every region is named.
  "about-timeline": {
    slots: [
      { name: "badge", match: '<span class="oc-block-about-badge"', inner: true },
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h2 class="oc-block-about-title"', inner: true },
      { name: "text", match: "<p>", from: "oc-block-about-title", inner: true },
    ],
    default: '<ol class="oc-timeline"',
  },
  "contact-grid": {
    slots: [
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h2 class="oc-block-contact-heading"', inner: true },
      { name: "lead", match: '<p class="oc-block-contact-lead"', inner: true },
    ],
    default: '<div class="oc-block-contact-grid"',
  },
  faq: {
    slots: [
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h2 class="oc-block-faq-title"', inner: true },
      { name: "lead", match: '<p class="oc-block-faq-lead"', inner: true },
      { name: "more", match: '<p class="oc-block-faq-more"', inner: true },
    ],
    default: '<div class="oc-accordion oc-block-faq-list"',
  },
  "hero-orbit": {
    slots: [
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h1 class="oc-display"', inner: true },
      { name: "lead", match: '<p class="oc-lead"', inner: true },
      { name: "actions", match: '<div class="flex flex-wrap gap-1 mt-2"', inner: true },
      { name: "center", match: '<div class="oc-code-window oc-block-orbit-center"', inner: true },
    ],
    default: '<div class="oc-block-orbit-ring"',
  },
  "portfolio-grid": {
    slots: [
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h2 class="oc-display oc-display--md"', inner: true },
      { name: "lead", match: '<p class="oc-block-portfolio-lead"', inner: true },
      { name: "link", match: '<a class="oc-link-arrow"', inner: true },
    ],
    default: '<div class="oc-block-portfolio-grid"',
  },
  "profile-header": {
    slots: [
      { name: "avatar", match: '<span class="oc-avatar oc-block-profile-avatar"', inner: true },
      { name: "name", match: '<h1 class="oc-block-profile-name"', inner: true },
      { name: "meta", match: '<p class="oc-block-profile-meta"', inner: true },
      { name: "bio", match: '<p class="oc-block-profile-bio"', inner: true },
      { name: "actions", match: '<div class="oc-block-profile-actions"', inner: true },
    ],
    default: '<nav class="oc-block-profile-tabs"',
  },
  // 0.10.0 blocks. Markup after the root (a dialog, the optional script) is kept as "tail": scripts go in @once,
  // and a slot with `tail: true` is looked up there.
};

/** Blocks that are written by hand (multi-root markup). */
const MANUAL = new Set(external ? external.MANUAL ?? [] : ["wizard-dialog"]);

const VOID = new Set(["input", "br", "img", "hr", "meta", "link", "source", "wbr", "col", "area", "base", "embed", "track", "param"]);

// "@" after a word character (e-mail addresses) or before a non-word character (a lone "@") is never a directive,
// and Blade only unescapes "@@" in front of a name, so only escape the others.
const escapeBlade = (line) => line.replace(/(^|[^\w])@(?=\w)/g, "$1@@").replace(/\{\{/g, "@{{").replace(/\{!!/g, "@{!!");
const phpStr = (s) => "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
const indentOf = (line) => line.match(/^\s*/)[0];

/** Net element depth per line plus the lowest depth reached. */
function depthChange(line) {
  let depth = 0;
  for (const m of line.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = m;
    if (VOID.has(tag.toLowerCase()) || selfClosing) continue;
    depth += closing ? -1 : 1;
  }
  return depth;
}

function findElement(lines, { match, from, nth = 1 }) {
  let begin = 0;
  if (from) {
    const f = lines.findIndex((l) => l.includes(from));
    if (f < 0) throw new Error(`from not found: ${from}`);
    begin = f + 1;
  }
  let count = 0;
  let start = -1;
  for (let i = begin; i < lines.length; i++) {
    if (lines[i].includes(match) && ++count === nth) {
      start = i;
      break;
    }
  }
  if (start < 0) throw new Error(`match not found: ${match}`);
  let depth = 0;
  for (let j = start; j < lines.length; j++) {
    depth += depthChange(lines[j]);
    if (depth <= 0) return { start, end: j };
  }
  throw new Error(`unbalanced element for: ${match}`);
}

function wrap(indent, cond, expr, originalLines) {
  return [
    `${indent}@if (${cond})`,
    `${indent}    ${expr}`,
    `${indent}@else`,
    ...originalLines,
    `${indent}@endif`,
  ];
}

function applySlot(lines, slot, isDefault) {
  const { start, end } = findElement(lines, slot);
  const expr = isDefault ? "{{ $slot }}" : `{{ $${slot.name} }}`;
  const v = "$" + slot.name;
  const cond = isDefault ? "! $slot->isEmpty()" : `isset(${v}) && trim((string) ${v}) !== ''`;
  const inner = slot.inner || isDefault;

  if (!inner) {
    const indent = indentOf(lines[start]);
    lines.splice(start, end - start + 1, ...wrap(indent, cond, expr, lines.slice(start, end + 1)));
    return;
  }

  if (end > start) {
    const indent = indentOf(lines[start]) + "    ";
    lines.splice(start + 1, end - start - 1, ...wrap(indent, cond, expr, lines.slice(start + 1, end)));
    return;
  }

  // Single line: <tag ...>content</tag>
  const line = lines[start];
  const openEnd = line.indexOf(">") + 1;
  const closeStart = line.lastIndexOf("</");
  const open = line.slice(0, openEnd);
  const content = line.slice(openEnd, closeStart);
  const close = line.slice(closeStart);
  lines.splice(start, 1, open, ...wrap(indentOf(line) + "    ", cond, expr, [indentOf(line) + "    " + content]), indentOf(line) + close);
}

/** Markup after the root element: escaped like the rest, each <script> wrapped in @once so it is printed one time per page. */
function buildTail(lines) {
  const out = [];
  let inScript = false;
  for (const line of lines.map(escapeBlade)) {
    if (/^\s*<script\b/.test(line)) {
      inScript = true;
      out.push("@once");
    }
    out.push(inScript ? "    " + line : line);
    if (inScript && /<\/script>\s*$/.test(line)) {
      inScript = false;
      out.push("@endonce");
    }
  }
  return out;
}

function build(name) {
  const raw = fs.readFileSync(path.join(SRC, `${name}.html`), "utf8").replace(/\r\n/g, "\n");
  const cm = raw.match(/^<!--([\s\S]*?)-->\n/);
  if (!cm) throw new Error(`${name}: no leading comment`);
  const comment = cm[1].replace(/--}}/g, "- -}}").replace(/\s+$/, "");
  const cfg = CONFIG[name] ?? {};

  const body = raw.slice(cm[0].length).replace(/\s+$/, "").split("\n");
  const openLine = body[0];
  // The root ends where the element depth returns to 0; anything after it (dialog, script) is the tail.
  const rootEnd = findElement(body, { match: openLine }).end;
  const closeLine = body[rootEnd];
  const tail = buildTail(body.slice(rootEnd + 1));
  const om = openLine.match(/^<([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*>$/);
  if (!om) throw new Error(`${name}: unsupported root ${openLine}`);
  const tag = om[1];

  const attrs = {};
  for (const m of om[2].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[m[1]] = m[2] ?? "";
  // app-shell drives height from a prop (cfg.merge.style). Every other block keeps a literal root style.
  const staticStyle = attrs.style;
  delete attrs.style;

  const mergeEntries = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (cfg.rootAttrs && k in cfg.rootAttrs) continue;
    mergeEntries.push(`${phpStr(k)} => ${phpStr(v)}`);
  }
  for (const [k, v] of Object.entries(cfg.rootAttrs ?? {})) mergeEntries.push(`${phpStr(k)} => ${v}`);
  for (const [k, v] of Object.entries(cfg.merge ?? {})) mergeEntries.push(`${phpStr(k)} => ${v}`);
  if (staticStyle != null && !(cfg.merge && Object.hasOwn(cfg.merge, "style"))) {
    mergeEntries.push(`${phpStr("style")} => ${phpStr(staticStyle)}`);
  }

  let inner = body.slice(1, rootEnd).map(escapeBlade);
  for (const [from, to] of cfg.replaceLine ?? []) {
    inner = inner.map((l) => (l.includes(from) ? l.replace(from, to) : l));
  }

  const slots = cfg.slots ?? [];
  for (const slot of slots) applySlot(slot.tail ? tail : inner, slot, false);
  if (cfg.default) applySlot(inner, { match: cfg.default }, true);
  else if (slots.length === 0) {
    // whole root content is the default slot
    const wrapped = wrap("    ", "! $slot->isEmpty()", "{{ $slot }}", inner);
    inner = wrapped;
  }

  const slotNames = [...slots.map((s) => s.name), ...(cfg.default || slots.length === 0 ? ["default"] : [])];
  const header = [
    `{{--${comment.startsWith("\n") ? "" : " "}${comment.trimStart()}`,
    `     Blade: <x-oc::block.${name}> - attributes merge onto the root element${cfg.props ? "; props: " + cfg.props.replace(/'/g, "") : ""}.`,
    `     Blade slots (each falls back to the snippet content when empty): ${slotNames.join(", ")}.`,
    "--}}",
  ].join("\n");

  const lines = [header];
  const propList = [...(cfg.props ? [cfg.props] : []), ...slots.map((x) => `'${x.name}' => null`)];
  if (propList.length) lines.push(`@props([${propList.join(", ")}])`);
  lines.push(`<${tag} {{ $attributes->merge([${["'class' => " + phpStr(attrs.class ?? ""), ...mergeEntries.filter((e) => !e.startsWith("'class'"))].join(", ")}]) }}>`);
  if (cfg.afterOpen) lines.push(`    ${cfg.afterOpen}`);
  lines.push(...inner);
  lines.push(closeLine, ...tail);
  return lines.join("\n") + "\n";
}

fs.mkdirSync(OUT, { recursive: true });
let count = 0;
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".html")).sort()) {
  const name = file.replace(/\.html$/, "");
  if (MANUAL.has(name)) continue;
  fs.writeFileSync(path.join(OUT, `${name}.blade.php`), build(name));
  count++;
}
console.log(`block views generated: ${count} (manual: ${[...MANUAL].join(", ")})`);
