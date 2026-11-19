// File: scripts/gen-code-tabs.mjs | Map: every free <oc-demo> on ui/components + ui/blocks -> missing framework tabs (React tsx, Vue,
// Blade, Livewire) made from the demo HTML -> inserted before </oc-demo> -> report (generated tabs + wrappers that exist for the classes used)
//
// npm run gen:code-tabs                         all pages
// npm run gen:code-tabs -- --pages a.html,b.html only these pages (file names, with or without folder)
// npm run gen:code-tabs -- --dry                list what would be added, write nothing to the pages
// npm run gen:code-tabs -- --report <file>      where the JSON report goes (default node_modules/.cache/code-tabs/todo.json)
//
// The tabs are a first, mechanical version: the same markup in each framework. Where React/Vue/Blade wrappers exist for the
// classes in a demo, the report lists them so the tab can be rewritten by hand to real component calls. <oc-demo pro> gets nothing.
// Existing tabs are kept; a second run changes nothing.

import fs from "node:fs";
import path from "node:path";
import {
  REPO, FRAMEWORK_LANGS, listPages, parseDemos, demoMarkup, wrapperIndex, wrappersFor, escapeCode,
  htmlToReact, htmlToVue, htmlToBlade, livewireTab, pascalCase, kebabCase, dedent,
} from "./lib/code-tabs.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const dry = args.includes("--dry");
const only = opt("--pages")?.split(",").map((p) => p.trim().replace(/\\/g, "/")).filter(Boolean);
const reportFile = path.resolve(opt("--report") || path.join(REPO, "node_modules/.cache/code-tabs/todo.json"));

// Demos that show code which is not markup (a JSON config, a shell command) get no framework tabs.
const MARKUP_LANGS = new Set(["html", ...FRAMEWORK_LANGS]);

const index = wrapperIndex();
const pages = listPages().filter((p) => !only || only.some((o) => p.rel === o || `${p.page}.html` === o || p.page === o || p.rel === `${o}.html`));
if (only && !pages.length) { console.error(`No pages match --pages ${only.join(",")}`); process.exit(1); }

const count = { pages: 0, demos: 0, free: 0, pro: 0, skipped: 0, complete: 0, tabs: Object.fromEntries(FRAMEWORK_LANGS.map((l) => [l, 0])), todos: { tsx: 0, vue: 0, blade: 0, livewire: 0 } };
const report = [];

/** Livewire class name: page + demo title in PascalCase, unique within the page. */
function className(page, title, used) {
  const pageWords = page.split("-");
  let words = (title || "").replace(/&/g, " and ").split(/[^A-Za-z0-9]+/).filter(Boolean);
  // "Button - variants" on button.html -> ButtonVariants, not ButtonButtonVariants
  if (words.slice(0, pageWords.length).join("-").toLowerCase() === page) words = words.slice(pageWords.length);
  let name = pascalCase([...pageWords, ...words.slice(0, 6)].join(" ").toLowerCase()) || "Example";
  if (/^\d/.test(name)) name = `Demo${name}`;
  let unique = name, n = 2;
  while (used.has(unique)) unique = `${name}${n++}`;
  used.add(unique);
  return unique;
}

for (const page of pages) {
  const raw = fs.readFileSync(page.file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const demos = parseDemos(raw);
  if (!demos.length) continue;
  count.pages++;
  const used = new Set();
  const inserts = [];
  const pageReport = { page: page.rel, demos: [] };
  for (const demo of demos) {
    count.demos++;
    if (demo.pro) { count.pro++; continue; }
    count.free++;
    const have = new Set(demo.codes.filter((c) => c.code.trim()).map((c) => c.lang));
    const name = className(page.page, demo.title, used);
    if ([...have].some((l) => !MARKUP_LANGS.has(l)) && !have.has("html")) { count.skipped++; continue; }
    const missing = FRAMEWORK_LANGS.filter((l) => !have.has(l));
    const markup = demoMarkup(demo);
    const wrappers = wrappersFor(markup, index, page.folder === "blocks" ? page.page : page.page);
    if (!missing.length) { count.complete++; continue; }
    if (!markup.trim()) { count.skipped++; continue; }

    const tabs = {};
    const notes = new Set();
    const blade = htmlToBlade(markup);
    // A hand-written Blade tab (real <x-oc::…> calls) is the better Livewire view.
    // Not when it needs data the empty component class does not have ($variables) or calls actions it does not define.
    let givenBlade = demo.codes.find((c) => c.lang === "blade" && c.code.trim())?.code.replace(/\r\n/g, "\n");
    if (givenBlade && /\$\w|wire:|\b(action|complete)="/.test(givenBlade)) givenBlade = undefined;
    for (const lang of missing) {
      if (lang === "tsx") { const r = htmlToReact(markup); tabs.tsx = r.code; r.dropped.forEach((d) => notes.add(`React: ${d} left out`)); }
      if (lang === "vue") { const r = htmlToVue(markup); tabs.vue = r.code; r.dropped.forEach((d) => notes.add(`Vue: ${d} left out`)); }
      if (lang === "blade") tabs.blade = blade;
      if (lang === "livewire") tabs.livewire = livewireTab(name, kebabCase(name), givenBlade ? dedent(givenBlade) : blade);
      count.tabs[lang]++;
    }
    const todo = {
      tsx: tabs.tsx && wrappers.some((w) => w.react.length) ? wrappers.flatMap((w) => w.react.slice(0, 3)) : [],
      vue: tabs.vue && wrappers.some((w) => w.vue.length) ? wrappers.flatMap((w) => w.vue.slice(0, 3)) : [],
      blade: tabs.blade && wrappers.some((w) => w.blade.length) ? wrappers.flatMap((w) => w.blade.slice(0, 3)) : [],
      livewire: tabs.livewire && !givenBlade && wrappers.some((w) => w.blade.length) ? wrappers.flatMap((w) => w.blade.slice(0, 3)) : [],
    };
    for (const l of Object.keys(todo)) if (todo[l].length) count.todos[l]++;
    pageReport.demos.push({
      index: demo.index, title: demo.title, livewireClass: name, generated: missing,
      wrappers: wrappers.map((w) => ({ key: w.key, primary: w.primary, react: w.react, vue: w.vue, blade: w.blade })),
      todo: Object.fromEntries(Object.entries(todo).filter(([, v]) => v.length)),
      notes: [...notes],
    });

    const block = missing.map((l) => `<oc-code lang="${l}">${escapeCode(tabs[l]).replace(/\n/g, eol)}</oc-code>`).join(eol);
    // Before the indentation of </oc-demo> when it stands on its own line, else right before it on a new line.
    const lineStart = raw.lastIndexOf("\n", demo.close - 1) + 1;
    const ownLine = !raw.slice(lineStart, demo.close).trim();
    inserts.push(ownLine ? { at: lineStart, text: block + eol } : { at: demo.close, text: eol + block + eol });

    if (dry) {
      const marks = [
        todo.tsx.length && `// TODO wrapper: ${todo.tsx.join(", ")}`,
        todo.vue.length && `vue: ${todo.vue.join(", ")}`,
        todo.blade.length && `blade: <${todo.blade.join(">, <")}>`,
      ].filter(Boolean);
      console.log(`${page.rel} #${demo.index} ${demo.title || "(no title)"}: + ${missing.join(", ")}${marks.length ? `  [${marks.join(" | ")}]` : ""}`);
    }
  }
  if (pageReport.demos.length) report.push(pageReport);
  if (!inserts.length || dry) continue;
  let out = raw;
  for (const ins of inserts.sort((a, b) => b.at - a.at)) out = out.slice(0, ins.at) + ins.text + out.slice(ins.at);
  fs.writeFileSync(page.file, out);
}

const todoCount = report.reduce((s, p) => s + p.demos.reduce((t, d) => t + Object.keys(d.todo).length, 0), 0);
const summary = { ...count, todoTabs: todoCount, demosWithTodo: report.reduce((s, p) => s + p.demos.filter((d) => Object.keys(d.todo).length).length, 0) };
fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, JSON.stringify({ generated: new Date().toISOString(), dry, summary, pages: report }, null, 2) + "\n");
console.log(`${dry ? "[dry] " : ""}${JSON.stringify(summary)}`);
console.log(`report: ${reportFile}`);
