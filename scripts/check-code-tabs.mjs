// File: scripts/check-code-tabs.mjs | Map: React (tsx) and Vue tabs of every demo on ui/components + ui/blocks -> one file per tab in
// node_modules/.cache/code-tabs-check -> tsc against packages/react/src, vue-tsc against packages/vue/src -> report per page/demo
//
// npm run check:code-tabs                       all pages
// npm run check:code-tabs -- --pages a.html,b.html
// npm run check:code-tabs -- --only tsx|vue     one of the two checks
//
// A tab is either a module (it has `export …`) or a fragment: optional statements followed by JSX / template markup. Fragments are
// wrapped in a component; their free lowercase names (state such as `email`, `setEmail`) are not reported. Component names and props
// are: an unknown <Component> or prop fails the check. Wrapper imports are added when a tab does not import them itself.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { REPO, listPages, parseDemos } from "./lib/code-tabs.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const only = opt("--pages")?.split(",").map((p) => p.trim().replace(/\\/g, "/")).filter(Boolean);
const which = opt("--only");
const TMP = path.join(REPO, "node_modules/.cache/code-tabs-check");
const posix = (p) => p.replace(/\\/g, "/");

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(path.join(TMP, "tsx"), { recursive: true });
fs.mkdirSync(path.join(TMP, "vue"), { recursive: true });

const REACT_HOOKS = new Set(["useState", "useEffect", "useRef", "useMemo", "useCallback", "useId", "useReducer", "useContext", "useLayoutEffect",
  "useTransition", "useDeferredValue", "useImperativeHandle", "useSyncExternalStore", "useOptimistic", "useActionState"]);
const VUE_API = new Set(["ref", "reactive", "computed", "watch", "watchEffect", "onMounted", "onUnmounted", "onBeforeUnmount", "nextTick", "useTemplateRef", "shallowRef"]);

const DOM_GLOBALS = ["open", "close", "name", "status", "event", "length", "origin", "parent", "top", "self", "print", "focus", "blur", "stop",
  "find", "scroll", "closed", "frames", "history", "location", "screen", "external", "menubar", "toolbar", "opener", "confirm", "alert", "prompt"];

/** Everything packages/react exports (components, hooks, types), read from its sources. */
const REACT_EXPORTS = new Set();
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) scan(path.join(dir, e.name));
    else if (/\.tsx?$/.test(e.name)) for (const m of fs.readFileSync(path.join(dir, e.name), "utf8").matchAll(/^export (?:declare )?(?:const|function|type|interface|class|enum) (\w+)/gm)) REACT_EXPORTS.add(m[1]);
  }
})(path.join(REPO, "packages/react/src"));

/** Names a snippet imports or declares itself. */
const ownNames = (code) => new Set([
  ...[...code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean)),
  ...[...code.matchAll(/import\s+(\w+)\s+from/g)].map((m) => m[1]),
  ...[...code.matchAll(/\b(?:const|let|var|function|class|interface|type)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
]);

const files = []; // { kind, file, page, demo, title, header, fragment }
let n = 0;
for (const page of listPages()) {
  if (only && !only.some((o) => page.rel === o || `${page.page}.html` === o || page.page === o)) continue;
  for (const demo of parseDemos(fs.readFileSync(page.file, "utf8"))) {
    if (demo.pro) continue;
    demo.codes.forEach((c, i) => {
      if ((c.lang !== "tsx" && c.lang !== "vue") || (which && which !== c.lang)) return;
      const code = c.code.replace(/\r\n/g, "\n").trim();
      const base = `${page.folder}-${page.page}-d${demo.index}-${i + 1}-${++n}`;
      const meta = { kind: c.lang, page: page.rel, demo: demo.index, title: demo.title };
      if (c.lang === "tsx") files.push({ ...meta, ...writeTsx(base, code) });
      else files.push({ ...meta, ...writeVue(base, code) });
    });
  }
}

function writeTsx(base, code) {
  const fragment = !/^\s*export\s/m.test(code);
  const lines = code.split("\n");
  const imports = [], rest = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) { let j = i; while (j < lines.length - 1 && !/from\s+["'][^"']+["'];?\s*$|^import\s+["']/.test(lines[j])) j++; imports.push(...lines.slice(i, j + 1)); i = j; }
    else rest.push(lines[i]);
  }
  let body = rest.join("\n");
  if (fragment) {
    const at = rest.findIndex((l) => /^</.test(l));
    if (at >= 0) {
      const stmts = rest.slice(0, at).join("\n");
      body = `export function Snippet() {\n${stmts}\nreturn (\n<>\n${rest.slice(at).join("\n")}\n</>\n);\n}`;
    }
  }
  const own = ownNames(code);
  // Only names the package exports: an unknown <Component> stays unimported and fails as "Cannot find name".
  const tags = [...new Set([...code.matchAll(/\b([A-Z]\w*)/g)].map((m) => m[1]))].filter((t) => !own.has(t) && REACT_EXPORTS.has(t));
  const hooks = [...new Set([...code.matchAll(/\b(use[A-Z]\w*)\s*[(<]/g)].map((m) => m[1]))].filter((h) => !own.has(h));
  const fromOmnia = [...new Set([...tags, ...hooks.filter((h) => !REACT_HOOKS.has(h) && REACT_EXPORTS.has(h))])];
  const fromReact = hooks.filter((h) => REACT_HOOKS.has(h));
  // A fragment's free state may carry the name of a DOM global (open, name, close, …): shadow those as `any`.
  const shadow = fragment ? DOM_GLOBALS.filter((g) => new RegExp(`(?<![\\w.$])${g}\\b`).test(body) && !own.has(g)) : [];
  const header = [
    ...imports,
    ...shadow.map((g) => `declare const ${g}: any;`),
    fromOmnia.length ? `import { ${fromOmnia.join(", ")} } from "@birdycom/omniaui-react";` : "",
    fromReact.length ? `import { ${fromReact.join(", ")} } from "react";` : "",
  ].filter(Boolean);
  const file = path.join(TMP, "tsx", `${base}.tsx`);
  fs.writeFileSync(file, `${header.join("\n")}\n${body}\n`);
  return { file, fragment };
}

function writeVue(base, code) {
  const hasTemplate = /<template>/.test(code);
  const hasScript = /<script\b/.test(code);
  const fragment = !hasScript;
  let sfc = hasTemplate ? code : `${hasScript ? code.match(/<script[\s\S]*?<\/script>/)[0] : ""}\n<template>\n${code.replace(/<script[\s\S]*?<\/script>/, "").trim()}\n</template>`;
  const own = ownNames(code);
  const tags = [...new Set([...sfc.matchAll(/<(Oc[A-Z]\w*)/g)].map((m) => m[1]))].filter((t) => !own.has(t));
  const api = [...new Set([...sfc.matchAll(/\b(\w+)\s*\(/g)].map((m) => m[1]))].filter((f) => VUE_API.has(f) && !own.has(f));
  const extra = [tags.length && `import { ${tags.join(", ")} } from "@birdycom/omniaui-vue"`, api.length && `import { ${api.join(", ")} } from "vue"`].filter(Boolean);
  if (extra.length) {
    if (/<script setup[^>]*>/.test(sfc)) sfc = sfc.replace(/(<script setup[^>]*>)/, `$1\n${extra.join("\n")}`);
    else sfc = `<script setup lang="ts">\n${extra.join("\n")}\n</script>\n\n${sfc}`;
  }
  const file = path.join(TMP, "vue", `${base}.vue`);
  fs.writeFileSync(file, sfc);
  return { file, fragment };
}

// Custom elements (webicons), and HTML attributes that @types/react does not list yet (invoker commands, interest invokers).
fs.writeFileSync(path.join(TMP, "tsx", "globals.d.ts"), `import "react";
declare module "react" {
  interface HTMLAttributes<T> { command?: string; commandfor?: string; interestfor?: string }
  namespace JSX { interface IntrinsicElements { [tag: \`\${string}-\${string}\`]: any } }
}
`);
const base = { target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], module: "ESNext", moduleResolution: "Bundler", strict: true,
  skipLibCheck: true, noEmit: true, isolatedModules: true, esModuleInterop: true, types: [] };
fs.writeFileSync(path.join(TMP, "tsconfig.tsx.json"), JSON.stringify({
  compilerOptions: { ...base, jsx: "react-jsx", baseUrl: posix(REPO), paths: { "@birdycom/omniaui-react": ["packages/react/src/index.ts"] } },
  include: ["tsx/*.tsx", "tsx/*.d.ts"],
}, null, 2));
fs.writeFileSync(path.join(TMP, "vue", "globals.d.ts"), `export {};
declare module "vue" { interface GlobalComponents { IconifyIcon: any } }
`);
fs.writeFileSync(path.join(TMP, "tsconfig.vue.json"), JSON.stringify({
  compilerOptions: { ...base, jsx: "preserve", baseUrl: posix(REPO), paths: { "@birdycom/omniaui-vue": ["packages/vue/src/index.ts"] }, types: ["vite/client"] },
  vueCompilerOptions: { checkUnknownComponents: true, checkUnknownProps: true },
  include: ["vue/*.vue", "vue/*.d.ts"],
}, null, 2));

function run(bin, config) {
  try {
    execFileSync(process.execPath, [path.join(REPO, bin), "-p", config, "--pretty", "false"], { cwd: TMP, encoding: "utf8", stdio: "pipe", maxBuffer: 64 << 20 });
    return "";
  } catch (e) {
    return `${e.stdout || ""}${e.stderr || ""}`;
  }
}

const HTML_ATTRS = new Set(("id name class style title role lang dir hidden tabindex accesskey autofocus inert popover placeholder disabled readonly " +
  "required type value checked rows cols wrap min max step pattern maxlength minlength inputmode autocomplete form for href target rel " +
  "download accept multiple size alt src width height loading decoding open method action novalidate enctype spellcheck draggable " +
  "contenteditable translate enterkeyhint popovertarget popovertargetaction command commandfor closedby list label selected").split(" "));

// Fragments use free state names; only those are allowed to be unknown.
const FREE = new Set(["TS2304", "TS2552", "TS2339", "TS7006", "TS7031", "TS18046", "TS2448", "TS2454"]);
const byFile = new Map(files.map((f) => [posix(path.resolve(f.file)).toLowerCase(), f]));
const problems = [];
const outside = [];
const DIAG = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
/**
 * tsc reports only syntax errors (TS1xxx) as long as one file has them, so a tab that does not parse would hide the type
 * errors of all the others: report those tabs, move them out of the project and check again.
 */
function check(kind, bin, config) {
  const lines = [];
  for (let round = 0; round < 5; round++) {
    const out = run(bin, config).split(/\r?\n/);
    const broken = new Set(out.map((l) => l.match(DIAG)).filter((m) => m && /^TS1\d{3}$/.test(m[4]) && byFile.has(posix(path.resolve(TMP, m[1])).toLowerCase())).map((m) => posix(path.resolve(TMP, m[1])).toLowerCase()));
    if (!broken.size) return [...lines, ...out];
    lines.push(...out.filter((l) => { const m = l.match(DIAG); return m && broken.has(posix(path.resolve(TMP, m[1])).toLowerCase()); }));
    for (const f of files) if (broken.has(posix(path.resolve(f.file)).toLowerCase())) fs.renameSync(f.file, `${f.file}.syntax-error`);
  }
  return lines;
}

for (const [kind, out] of [
  ["tsx", which === "vue" ? [] : check("tsx", "node_modules/typescript/bin/tsc", "tsconfig.tsx.json")],
  ["vue", which === "tsx" ? [] : check("vue", "node_modules/vue-tsc/bin/vue-tsc.js", "tsconfig.vue.json")],
]) {
  for (const line of out) {
    const m = line.match(DIAG);
    if (!m) { if (line.trim() && /error/.test(line)) outside.push(`${kind}: ${line}`); continue; }
    const f = byFile.get(posix(path.resolve(TMP, m[1])).toLowerCase());
    // checkUnknownProps also flags data-*/popover attributes inside the wrapper sources: not a tab problem.
    if (!f) { if (!(kind === "vue" && /packages\/vue\/src\//.test(posix(m[1])))) outside.push(`${kind}: ${line}`); continue; }
    // Unknown attributes on native elements pass through to the DOM (data-*, popover, closedby): only component props count.
    if (m[4] === "TS2353" && /(HTMLAttributes|SVGAttributes)[\w ]*& ReservedProps/.test(m[5])) continue;
    // A Vue component passes HTML attributes it does not declare to its root element (fallthrough attrs): id, name, aria-*, …
    const prop = m[5].match(/and '+([^']+)'+ does not exist/)?.[1];
    if (kind === "vue" && m[4] === "TS2353" && prop && (HTML_ATTRS.has(prop) || /^(aria|data)-/.test(prop))) continue;
    const name = m[5].match(/(?:Cannot find name|Property) '([^']+)'/)?.[1];
    if (f.fragment && FREE.has(m[4]) && (!name || /^[a-z_$]/.test(name))) continue;
    problems.push({ ...f, line: Number(m[2]), code: m[4], message: m[5] });
  }
}

const pages = new Map();
for (const p of problems) {
  const key = `${p.page} #${p.demo} ${p.title} [${p.kind}]`;
  if (!pages.has(key)) pages.set(key, []);
  pages.get(key).push(`  ${path.basename(p.file)}:${p.line} ${p.code} ${p.message}`);
}
for (const [key, list] of pages) console.log(`${key}\n${[...new Set(list)].join("\n")}`);
if (outside.length) console.log(`\nErrors outside the tabs (wrapper sources or config):\n${[...new Set(outside)].slice(0, 40).join("\n")}`);
const tsx = files.filter((f) => f.kind === "tsx").length, vue = files.length - tsx;
console.log(`\ncode tabs checked: ${tsx} React, ${vue} Vue; with errors: ${pages.size} (${problems.length} errors)${outside.length ? `, ${outside.length} outside the tabs` : ""}`);
process.exit(problems.length || outside.length ? 1 : 0);
