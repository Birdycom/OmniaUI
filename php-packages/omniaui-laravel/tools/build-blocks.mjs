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
 * 0.17.0 options: `wholeDefault: true` keeps that whole-content default slot next to named slots (blocks that had no named
 * slots before, so existing markup in the default slot keeps working); `form: true` gives the first <form> a `form` prop
 * (array of attributes merged onto it, e.g. ['wire:submit' => 'login']) plus @csrf for a non-GET form (only with the prop, so the
 * markup without it stays the snippet); `heading: <match>`
 * gives that h1 a `heading-level` prop (1 default, 2 renders an h2 with the same classes).
 * `classExpr: "<php>"` appends a PHP string expression to the root class (conditional modifiers); `insertBefore: [[match, line]]` puts
 * a Blade line (same indent) before the first line containing `match` (optional parts that are not in the snippet).
 */
// 0.17.0: the auth page blocks (login, signup, otp, forgot / reset password) share one config: a form prop for the form attributes
// (action, method, wire:submit), heading-level, and title / text / fields / footer as named slots that also take a plain string
// (+ panel: the whole <aside> on the split -02 variants; social and legal on login-03). The default slot still replaces the whole
// content, as before.
const AUTH_BLOCKS = ["login-01", "login-02", "login-03", "signup-01", "signup-02", "otp-01", "otp-02", "forgot-password", "reset-password"];
const AUTH_CONFIG = (name) => ({
  wholeDefault: true,
  form: true,
  heading: '<h1 class="oc-block-authcard-title"',
  slots: [
    ...(name.endsWith("-02") ? [{ name: "panel", match: '<aside class="oc-block-authduo-panel' }] : []),
    { name: "title", match: '<h1 class="oc-block-authcard-title"', inner: true },
    { name: "text", match: '<p class="oc-block-authcard-text"', inner: true },
    ...(name === "login-03" ? [{ name: "social", match: '<div class="oc-block-authsocial"', inner: true }] : []),
    { name: "fields", match: '<div class="oc-block-authcard-fields"', inner: true },
    { name: "footer", match: '<p class="oc-block-authcard-foot"', inner: true },
    ...(name === "login-03" ? [{ name: "legal", match: '<p class="oc-block-authcard-legal"', inner: true }] : []),
  ],
});
// 0.17.0: sidebar-01..05 keep the whole-content default slot and get the sidebar, the breadcrumb, the whole top bar (toggle button,
// separator, breadcrumb) and the page body as named slots.
const SIDEBAR_CONFIG = {
  wholeDefault: true,
  slots: [
    { name: "sidebar", match: '<aside class="oc-sidebar' },
    { name: "breadcrumbs", match: '<nav aria-label="Breadcrumb"' },
    { name: "bar", match: '<header class="oc-block-sb-bar"', inner: true },
    { name: "body", match: '<div class="oc-block-sb-body"', inner: true },
  ],
};

const CONFIG = external?.CONFIG ?? {
  "app-header": {
    // 0.17.0: toggle-for points the default toggle at the sidebar checkbox (app-shell: oc-shell-toggle).
    props: "'toggleFor' => 'oc-appbar-toggle'",
    replaceLine: [['for="oc-appbar-toggle"', 'for="{{ $toggleFor }}"']],
    slots: [
      { name: "toggle", match: '<label class="oc-btn oc-btn--ghost oc-btn--icon"' },
      { name: "nav", match: '<nav class="oc-block-appbar-nav"', inner: true },
      { name: "actions", match: '<div class="oc-block-appbar-actions"', inner: true },
    ],
  },
  "app-shell": {
    // 0.17.0: toggle-id renames the collapse checkbox and the toggle label in the default header together.
    props: "'height' => null, 'toggleId' => 'oc-shell-toggle'",
    merge: { style: "$height ? '--oc-block-shell-height: '.$height : null" },
    replaceLine: [['id="oc-shell-toggle"', 'id="{{ $toggleId }}"'], ['for="oc-shell-toggle"', 'for="{{ $toggleId }}"']],
    slots: [
      { name: "sidebar", match: '<aside class="oc-sidebar' },
      { name: "header", match: '<header class="oc-block-appbar"' },
      { name: "breadcrumbs", match: '<div class="oc-block-shell-breadcrumbs"', inner: true },
    ],
    default: '<main class="oc-block-shell-content"',
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
    heading: "<h1>",
    slots: [
      { name: "badge", match: '<span class="oc-block-hero-badge"', inner: true },
      { name: "title", match: "<h1>", inner: true },
      { name: "text", match: "<p>", inner: true },
      { name: "actions", match: '<div class="oc-block-hero-actions"', inner: true },
    ],
  },
  "hero-split": {
    heading: "<h1>",
    slots: [
      { name: "title", match: "<h1>", inner: true },
      { name: "text", match: "<p>", inner: true },
      { name: "actions", match: '<div class="oc-block-hero-actions', inner: true },
      { name: "visual", match: '<div class="oc-block-hero-visual"', inner: true },
    ],
  },
  "module-header": {
    // 0.17.0: module (data-module: band tint + icon tile), eyebrow (line above the title), fixed-height (one band height).
    props: "'module' => null, 'eyebrow' => null, 'fixedHeight' => false",
    merge: { "data-module": "$module ?: null" },
    classExpr: "($fixedHeight ? ' oc-block-modulehead--fixed' : '')",
    insertBefore: [['<h1 class="oc-block-modulehead-title"', "@if (isset($eyebrow) && trim((string) $eyebrow) !== '')<p class=\"oc-block-modulehead-eyebrow\">{{ $eyebrow }}</p>@endif"]],
    heading: '<h1 class="oc-block-modulehead-title"',
    slots: [
      { name: "icon", match: '<span class="oc-block-modulehead-icon"', inner: true },
      { name: "title", match: '<h1 class="oc-block-modulehead-title"', inner: true },
      { name: "intro", match: '<p class="oc-block-modulehead-intro"', inner: true },
      { name: "meta", match: '<div class="oc-block-modulehead-meta"', inner: true },
      { name: "actions", match: '<div class="oc-block-modulehead-actions"', inner: true },
    ],
  },
  "content-blocks": {
    slots: [
      { name: "title", match: '<h2 class="oc-block-content-blocks-title"', inner: true },
      { name: "meta", match: '<p class="oc-block-content-blocks-meta"', inner: true },
      { name: "actions", match: '<div class="oc-block-content-blocks-actions"', inner: true },
    ],
    default: '<ol class="oc-block-content-blocks-list"',
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
  faq: {
    slots: [
      { name: "eyebrow", match: '<p class="oc-eyebrow"', inner: true },
      { name: "title", match: '<h2 class="oc-block-faq-title"', inner: true },
      { name: "lead", match: '<p class="oc-block-faq-lead"', inner: true },
      { name: "more", match: '<p class="oc-block-faq-more"', inner: true },
    ],
    default: '<div class="oc-accordion oc-block-faq-list"',
  },
  // name-id (0.17.0): the id of the name heading, also used by aria-labelledby (two headers on one page need two ids).
  "profile-header": {
    props: "'nameId' => 'oc-profile-name'",
    rootAttrs: { "aria-labelledby": "$nameId" },
    replaceLine: [['id="oc-profile-name"', 'id="{{ $nameId }}"']],
    heading: '<h1 class="oc-block-profile-name"',
    slots: [
      { name: "avatar", match: '<span class="oc-avatar oc-block-profile-avatar"', inner: true },
      { name: "name", match: '<h1 class="oc-block-profile-name"', inner: true },
      { name: "meta", match: '<p class="oc-block-profile-meta"', inner: true },
      { name: "bio", match: '<p class="oc-block-profile-bio"', inner: true },
      { name: "actions", match: '<div class="oc-block-profile-actions"', inner: true },
      { name: "tabs", match: '<div class="oc-block-profile-tabs"', inner: true },
    ],
    default: '<div class="oc-block-profile-panels"',
  },
  // 0.10.0 blocks. Markup after the root (a dialog, the optional script) is kept as "tail": scripts go in @once,
  // and a slot with `tail: true` is looked up there.
  ...Object.fromEntries(AUTH_BLOCKS.map((name) => [name, AUTH_CONFIG(name)])),
  ...Object.fromEntries(["sidebar-01", "sidebar-02", "sidebar-03", "sidebar-04", "sidebar-05"].map((name) => [name, SIDEBAR_CONFIG])),
};

/** Blocks that are written by hand (multi-root markup). */
// 0.17.0: blocks with array props (rows, steps, cards) or variants the snippet cannot express are written by hand too.
const MANUAL = new Set(external ? external.MANUAL ?? [] : [
  "wizard-dialog", "contact-form", "site-header", "site-footer",
  "route-progress", "step-view", "route-steps", "type-picker",
  "showcase", "hero-code", "product-grid", "about-timeline", "portfolio-grid", "contact-grid",
  "auth-split", "hero-orbit",
  // 0.17.0: app-header is written by hand (overflow More menu, search slot, module); its CONFIG above is kept for reference.
  "app-header",
]);

const VOID = new Set(["input", "br", "img", "hr", "meta", "link", "source", "wbr", "col", "area", "base", "embed", "track", "param"]);

// "@" after a word character (e-mail addresses) or before a non-word character (a lone "@") is never a directive,
// and Blade only unescapes "@@" in front of a name, so only escape the others.
const escapeBlade = (line) => line.replace(/(^|[^\w])@(?=\w)/g, "$1@@").replace(/\{\{/g, "@{{").replace(/\{!!/g, "@{!!");
// 0.17.0: <iconify-icon icon="set:name"> in a snippet becomes <x-oc::webicon> (inline SVG from the installed sets; apps that
// still load the Iconify runtime keep it via fallback="iconify"). aria-label becomes the label prop, aria-hidden="true" is the default.
const toWebicon = (line) => line.replace(/<iconify-icon icon="([^"{}]+)"((?:\s+[\w:-]+="[^"]*")*)\s*><\/iconify-icon>/g, (m, name, attrs) => {
  let out = `<x-oc::webicon name="${name}"`;
  for (const [, k, v] of attrs.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    if (k === "aria-hidden" && v === "true") continue;
    out += k === "aria-label" ? ` label="${v}"` : ` ${k}="${v}"`;
  }
  return `${out} bare fallback="iconify" />`;
});
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
  for (const line of lines.map(escapeBlade).map(toWebicon)) {
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

  let inner = body.slice(1, rootEnd).map(escapeBlade).map(toWebicon);
  for (const [from, to] of cfg.replaceLine ?? []) {
    inner = inner.map((l) => (l.includes(from) ? l.replace(from, to) : l));
  }
  for (const [match, line] of cfg.insertBefore ?? []) {
    const at = inner.findIndex((l) => l.includes(match));
    if (at < 0) throw new Error(`${name}: insertBefore: no line with ${match}`);
    inner.splice(at, 0, indentOf(inner[at]) + line);
  }

  const pre = [];
  const props = cfg.props ? [cfg.props] : [];
  const notes = [];
  if (cfg.form) {
    const at = inner.findIndex((l) => /^\s*<form\b/.test(l));
    if (at < 0) throw new Error(`${name}: form: no <form> line`);
    const fm = inner[at].match(/^(\s*)<form((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*>$/);
    if (!fm) throw new Error(`${name}: unsupported form line ${inner[at]}`);
    const fattrs = [...fm[2].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((m) => `${phpStr(m[1])} => ${phpStr(m[2] ?? "")}`);
    props.push("'form' => null");
    pre.push(`    $ocForm = (new \\Illuminate\\View\\ComponentAttributeBag(is_array($form) ? $form : []))->merge([${fattrs.join(", ")}]);`);
    inner.splice(at, 1, `${fm[1]}<form {{ $ocForm }}>`, `${fm[1]}    @if (is_array($form) && strtolower((string) $ocForm->get('method', 'get')) !== 'get') @csrf @endif`);
    notes.push("form (array of attributes merged onto the <form>, e.g. ['wire:submit' => 'login']; it can override action / method; with it a non-GET form gets @csrf)");
  }

  const slots = cfg.slots ?? [];
  for (const slot of slots) applySlot(slot.tail ? tail : inner, slot, false);
  if (cfg.heading) {
    const { start, end } = findElement(inner, { match: cfg.heading });
    inner[start] = inner[start].replace("<h1", "<{{ $ocHeading }}");
    const close = inner[end].lastIndexOf("</h1>");
    inner[end] = inner[end].slice(0, close) + "</{{ $ocHeading }}>" + inner[end].slice(close + 5);
    props.push("'headingLevel' => 1");
    pre.push("    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';");
    notes.push("heading-level (1 default; 2 renders the title as an h2 with the same look)");
  }
  if (cfg.default) applySlot(inner, { match: cfg.default }, true);
  else if (slots.length === 0 || cfg.wholeDefault) {
    // whole root content is the default slot
    const wrapped = wrap("    ", "! $slot->isEmpty()", "{{ $slot }}", inner);
    inner = wrapped;
  }

  const slotNames = [...slots.map((s) => s.name), ...(cfg.default || slots.length === 0 || cfg.wholeDefault ? ["default"] : [])];
  const header = [
    `{{--${comment.startsWith("\n") ? "" : " "}${comment.trimStart()}`,
    `     Blade: <x-oc::block.${name}> - attributes merge onto the root element${cfg.props ? "; props: " + cfg.props.replace(/'/g, "") : ""}.`,
    `     Blade slots (each falls back to the snippet content when empty): ${slotNames.join(", ")}.`,
    ...(cfg.wholeDefault ? ["     The default slot replaces the whole content; each named slot replaces one region (a plain string works too)."] : []),
    ...(notes.length ? [`     Props (0.17.0, optional): ${notes.join("; ")}.`] : []),
    "--}}",
  ].join("\n");

  const lines = [header];
  const propList = [...props, ...slots.map((x) => `'${x.name}' => null`)];
  if (propList.length) lines.push(`@props([${propList.join(", ")}])`);
  if (pre.length) lines.push("@php", ...pre, "@endphp");
  lines.push(`<${tag} {{ $attributes->merge([${["'class' => " + phpStr(attrs.class ?? "") + (cfg.classExpr ? `.${cfg.classExpr}` : ""), ...mergeEntries.filter((e) => !e.startsWith("'class'"))].join(", ")}]) }}>`);
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
