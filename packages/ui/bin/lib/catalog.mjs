// File: packages/ui/bin/lib/catalog.mjs
// What can be added, per flavour (css | vue | react | blade), and which files an entry needs.
// Map: registry (snippet manifests) -> flavourRoot -> catalog -> closure (internal imports) -> findEntries

import fs from "node:fs/promises";
import path from "node:path";
import { binDir, cwd, exists, kebab, pkgDir, posix, readJson } from "./project.mjs";

export const INSTALL_HINT = { vue: "npm i @birdycom/omniaui-vue", react: "npm i @birdycom/omniaui-react", blade: "composer require birdycom/omniaui-laravel", block: "npm i @birdycom/omniaui-blocks" };

// Package roots inside the OmniaUI monorepo (used when the package is not installed, e.g. while developing).
const uiRoot = path.resolve(binDir, "..");
const monoPackages = path.resolve(binDir, "../..");
const monoBlade = path.resolve(binDir, "../../../php-packages/omniaui-laravel/resources/views/components");

/** Folder of a package, or a monorepo fallback folder, or null. */
async function findPkg(name, fallback) {
  try { return pkgDir(name); } catch { /* not installed */ }
  return (await exists(path.join(fallback, "package.json"))) ? fallback : null;
}

const registryCache = {};
/** Snippet registry: { dir, manifest } of @birdycom/omniaui (components) or @birdycom/omniaui-blocks (blocks). */
export async function registry(kind) {
  if (!registryCache[kind]) {
    const dir = kind === "block" ? await findPkg("@birdycom/omniaui-blocks", path.join(monoPackages, "blocks")) : uiRoot;
    if (!dir) throw new Error(`Cannot find the blocks. Install them with: ${INSTALL_HINT.block}`);
    registryCache[kind] = { dir, manifest: await readJson(path.join(dir, "manifest.json")) };
  }
  return registryCache[kind];
}

/** OmniaUI Pro snippets ({ dir, manifest }) when @birdycom/omniaui-pro is installed, else null. */
async function proRegistry() {
  try {
    const dir = pkgDir("@birdycom/omniaui-pro");
    return { dir, manifest: await readJson(path.join(dir, "manifest.json")) };
  } catch { return null; }
}

/** Names of the OmniaUI Pro blocks (pro.json in @birdycom/omniaui-blocks), for a hint when one is asked for without Pro. */
export async function proBlockNames() {
  try { return (await readJson(path.join((await registry("block")).dir, "pro.json"))).items.map((i) => i.name); } catch { return []; }
}

/** Root folder holding the sources of a flavour (installed package first, monorepo second). Returns null when missing. */
async function flavourRoot(fw) {
  if (fw === "vue" || fw === "react") return findPkg(`@birdycom/omniaui-${fw}`, path.join(monoPackages, fw));
  if (fw === "blade") {
    for (const base of [path.join(cwd, "vendor/birdycom/omniaui-laravel/resources/views/components"), monoBlade]) {
      if (await exists(base)) return base;
    }
  }
  return null;
}

async function walk(dir, base = dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(posix(path.relative(base, full)));
  }
  return out.sort();
}

/** Snippet name of a vue manifest item (sub-parts share the snippet of their parent). */
const vueSnippetName = (i) => (i.snippet ? path.basename(i.snippet, ".html") : kebab(i.name.replace(/^Oc(Block)?/, "")));

/**
 * Catalog of one flavour: { root, entries: [{ kind, name, files (relative to root), description }] }.
 * An entry groups the files that belong together (Accordion + AccordionItem, accordion.blade.php + accordion/).
 */
export async function catalog(fw) {
  const describe = {};
  const regs = {};
  for (const kind of ["component", "block"]) {
    // Blocks are optional (separate package): without them, only components are listed.
    try { regs[kind] = await registry(kind); } catch (err) { if (kind === "component") throw err; regs[kind] = null; }
    for (const i of regs[kind]?.manifest.items || []) describe[`${kind}:${i.name}`] = i;
  }
  if (fw === "css") {
    const entries = [];
    for (const kind of ["component", "block"]) {
      for (const i of regs[kind]?.manifest.items || []) entries.push({ kind, name: i.name, files: [i.file], description: i.description, root: regs[kind].dir });
    }
    const pro = await proRegistry();
    for (const i of pro?.manifest.items || []) entries.push({ kind: "block", name: i.name, files: [i.file], description: i.description, root: pro.dir, pro: true });
    return { root: null, entries };
  }
  const root = await flavourRoot(fw);
  if (!root) throw new Error(`Cannot find the ${fw} sources. Install them with: ${INSTALL_HINT[fw]}`);
  const groups = new Map();
  const put = (kind, name, file) => {
    const key = `${kind}:${name}`;
    if (!groups.has(key)) groups.set(key, { kind, name, files: [], description: describe[key]?.description });
    groups.get(key).files.push(file);
  };
  if (fw === "blade") {
    for (const file of await walk(root)) {
      if (!file.endsWith(".blade.php")) continue;
      const segs = file.slice(0, -".blade.php".length).split("/");
      if (segs[0] === "block" && segs.length > 1) put("block", segs[1], file);
      else put("component", segs[0], file);
    }
  } else {
    const manifest = await readJson(path.join(root, "manifest.json"));
    // react: one entry per name; vue: parts that share an HTML snippet belong to one entry
    for (const i of manifest.items) put(i.kind, fw === "vue" ? vueSnippetName(i) : i.name, i.file);
  }
  return { root, entries: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name)) };
}

const EXT = ["", ".ts", ".tsx", ".vue", "/index.ts", "/index.tsx"];
/** Local files a vue/react source imports (relative specifiers only). */
async function localImports(root, file) {
  const text = await fs.readFile(path.join(root, file), "utf8");
  const found = [];
  for (const m of text.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1]));
    for (const ext of EXT) {
      if (path.extname(base + ext) && (await fs.stat(path.join(root, base + ext)).catch(() => null))?.isFile()) { found.push(base + ext); break; }
    }
  }
  return found;
}

/** Blade components a file uses, as files: <x-oc::button> -> button.blade.php, <x-oc::block.hero> -> block/hero.blade.php. */
async function bladeUses(root, file) {
  const text = await fs.readFile(path.join(root, file), "utf8");
  const found = new Set();
  for (const m of text.matchAll(/<x-oc::([\w.-]+)/g)) {
    const rel = `${m[1].replace(/\./g, "/")}.blade.php`;
    if (await exists(path.join(root, rel))) found.add(rel);
  }
  return [...found];
}

/** All files an entry needs: its own files plus internal dependencies (utils, hooks, composables, sub-components). */
export async function closure(fw, root, entry, entries) {
  const seen = new Set();
  const queue = [...entry.files];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const deps = fw === "blade" ? await bladeUses(root, file) : await localImports(root, file);
    for (const dep of deps) {
      queue.push(dep);
      // blade: pull in the whole entry (root file + sub-parts like accordion/item)
      if (fw === "blade") {
        const owner = entries.find((e) => e.files.includes(dep));
        if (owner) queue.push(...owner.files);
      }
    }
  }
  return [...seen].sort();
}

/** Find the entries for a user-typed name ("button", "OcButton", "app-shell"). */
export function findEntries(entries, input, kind) {
  let name = kebab(input);
  if (name.startsWith("oc-")) name = name.slice(3);
  if (name.startsWith("block-") && !kind) {
    const hit = entries.filter((e) => e.kind === "block" && e.name === name.slice(6));
    if (hit.length) return hit;
  }
  return entries.filter((e) => e.name === name && (!kind || e.kind === kind));
}
