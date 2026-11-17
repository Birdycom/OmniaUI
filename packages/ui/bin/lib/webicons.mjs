// File: packages/ui/bin/lib/webicons.mjs
// `omniaui webicons`: a small JSON file with only the webicons an app uses, read from the Iconify sets installed in
// node_modules (@iconify-json/<set>/icons.json). Nothing is fetched. The app imports the file and passes it to
// addWebicons() (React / Vue); Blade reads it through config('omniacss.webicons.files').
// Map: names (arguments and/or --scan of the source) -> resolve per set (aliases) -> write --out (or print) -> report

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { cwd } from "./project.mjs";

/** The webicon sets (Iconify prefixes). */
export const WEBICON_SETS = ["mdi", "mdi-light", "material-symbols", "svg-spinners", "flag", "vscode-icons"];
const NAME = new RegExp(`(?<![\\w-])(${WEBICON_SETS.join("|")}):([a-z0-9]+(?:-[a-z0-9]+)*)`, "g");
const SCAN_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".php", ".html", ".md", ".mdx", ".json"]);
const SKIP_DIR = new Set(["node_modules", "vendor", "dist", "build", ".git", ".next", ".nuxt", "storage", "coverage"]);

/** Every webicon name in the files under `dir`. */
export async function scanNames(dir, skip = new Set()) {
  const found = new Set();
  async function walk(d) {
    for (const entry of await fs.readdir(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIR.has(entry.name) && !entry.name.startsWith(".")) await walk(full);
      } else if (SCAN_EXT.has(path.extname(entry.name)) && !skip.has(path.resolve(full))) {
        for (const m of (await fs.readFile(full, "utf8")).matchAll(NAME)) found.add(`${m[1]}:${m[2]}`);
      }
    }
  }
  await walk(dir);
  return [...found].sort();
}

/** One icon of an Iconify JSON set with its aliases resolved, or null. */
export function resolveIcon(set, name) {
  let extra = {};
  let rotate = 0;
  let hFlip = false;
  let vFlip = false;
  for (let n = name, depth = 0; depth < 6; depth++) {
    const icon = set.icons[n];
    if (icon) {
      const out = { ...icon, ...extra, body: icon.body };
      out.width ??= set.width ?? 16;
      out.height ??= set.height ?? 16;
      if (set.left && out.left == null) out.left = set.left;
      if (set.top && out.top == null) out.top = set.top;
      const r = ((icon.rotate ?? 0) + rotate) % 4;
      const h = !!icon.hFlip !== hFlip;
      const v = !!icon.vFlip !== vFlip;
      delete out.rotate; delete out.hFlip; delete out.vFlip;
      if (r) out.rotate = r;
      if (h) out.hFlip = true;
      if (v) out.vFlip = true;
      return out;
    }
    const alias = set.aliases?.[n];
    if (!alias) return null;
    const { parent, rotate: ar = 0, hFlip: ah = false, vFlip: av = false, ...rest } = alias;
    extra = { ...rest, ...extra };
    rotate += ar;
    hFlip = hFlip !== ah;
    vFlip = vFlip !== av;
    n = parent;
  }
  return null;
}

/** { icons: { "mdi:home": {...} }, missing: [names], noSet: [prefixes] } for the given names. */
export async function buildSubset(names, from = cwd) {
  const require = createRequire(path.join(from, "package.json"));
  const sets = new Map();
  const icons = {};
  const missing = [];
  const noSet = new Set();
  for (const full of [...new Set(names)].sort()) {
    const i = full.indexOf(":");
    const prefix = full.slice(0, i);
    if (i < 1) { missing.push(full); continue; }
    if (!sets.has(prefix)) {
      try {
        sets.set(prefix, JSON.parse(await fs.readFile(require.resolve(`@iconify-json/${prefix}/icons.json`), "utf8")));
      } catch {
        sets.set(prefix, null);
      }
    }
    const set = sets.get(prefix);
    if (!set) { noSet.add(prefix); missing.push(full); continue; }
    const icon = resolveIcon(set, full.slice(i + 1));
    if (icon) icons[full] = icon;
    else missing.push(full);
  }
  return { icons, missing, noSet: [...noSet] };
}

/** `omniaui webicons [name...] [--scan <dir>] [--out <file>]` */
export async function cmdWebicons(names, values) {
  const out = values.out ?? values.to;
  const list = [...names];
  if (values.scan) {
    const skip = new Set(out ? [path.resolve(cwd, out)] : []);
    list.push(...(await scanNames(path.resolve(cwd, values.scan), skip)));
  }
  if (!list.length) throw new Error('name the icons ("mdi:home flag:nl-4x3") or scan the source with --scan src');
  const { icons, missing, noSet } = await buildSubset(list);
  const json = JSON.stringify(icons, null, 1) + "\n";
  if (out && !values["dry-run"]) {
    await fs.mkdir(path.dirname(path.resolve(cwd, out)), { recursive: true });
    await fs.writeFile(path.resolve(cwd, out), json);
  } else if (!out) {
    process.stdout.write(json);
  }
  const log = out ? console.log : console.error;
  if (out) log(`omniaui: ${Object.keys(icons).length} webicons -> ${out} (${(json.length / 1024).toFixed(1)} KB)`);
  for (const p of noSet) log(WEBICON_SETS.includes(p) ? `  set ${p} is not installed: npm i -D @iconify-json/${p}` : `  ${p}: not a webicon set (${WEBICON_SETS.join(", ")})`);
  const unknown = missing.filter((m) => !noSet.includes(m.slice(0, m.indexOf(":"))));
  if (unknown.length) log(`  not found: ${unknown.join(", ")}`);
  if (out) log(`  React/Vue: import icons from "./${path.basename(out)}"; addWebicons(icons)`);
}
