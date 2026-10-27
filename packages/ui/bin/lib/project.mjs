// File: packages/ui/bin/lib/project.mjs
// Project helpers for the omniaui CLI: paths, package resolving, config, framework detection, content globs.
// Map: cwd + resolve -> config (omnia.config.json) -> detectFramework / resolveFramework -> defaultDir -> ensureContentGlob

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const cwd = process.cwd();
export const CONFIG = "omnia.config.json";
export const FRAMEWORKS = ["css", "vue", "react", "blade"];
// Folder of the omniaui CLI (packages/ui/bin); the package root is one level up.
export const binDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const requireFromProject = createRequire(path.join(cwd, "package.json"));
const requireFromCli = createRequire(path.join(binDir, "omniaui.mjs"));

export const exists = async (p) => !!(await fs.stat(p).catch(() => null));
export const posix = (p) => p.split(path.sep).join("/");
export const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
export const pascal = (s) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

/** Folder of an installed package: the project's own install first, then next to the CLI. Throws when missing. */
export function pkgDir(name) {
  for (const req of [requireFromProject, requireFromCli]) {
    try { return path.dirname(req.resolve(`${name}/package.json`)); } catch { /* try next */ }
  }
  throw new Error(`Cannot find ${name}. Install it with: npm install ${name}`);
}

/** omnia.config.json of the project ({} when there is none). */
export async function loadConfig() {
  try { return await readJson(path.join(cwd, CONFIG)); } catch { return {}; }
}

/** Detect the flavour from package.json / composer.json: vue, react, blade (Laravel) or css. */
export async function detectFramework() {
  let pkg = {};
  try { pkg = await readJson(path.join(cwd, "package.json")); } catch { /* no package.json */ }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps.vue || deps.nuxt) return "vue";
  if (deps.react || deps.next) return "react";
  let laravel = await exists(path.join(cwd, "artisan"));
  if (!laravel) {
    try { const c = await readJson(path.join(cwd, "composer.json")); laravel = !!{ ...c.require, ...c["require-dev"] }["laravel/framework"]; } catch { /* no composer.json */ }
  }
  return laravel ? "blade" : "css";
}

/** Pick the flavour: --framework flag, then config `framework`, then detection. */
export async function resolveFramework(flags) {
  const config = await loadConfig();
  const fw = String(flags.framework || config.framework || (await detectFramework())).toLowerCase();
  if (!FRAMEWORKS.includes(fw)) throw new Error(`Unknown framework "${fw}". Use one of: ${FRAMEWORKS.join(", ")}.`);
  return fw;
}

/** Default target folder per flavour (Laravel projects get Laravel paths). */
export async function defaultDir(fw, legacyKind) {
  const laravel = await exists(path.join(cwd, "artisan"));
  if (fw === "blade") return "resources/views/components/oc";
  if (fw === "css") return legacyKind ? `omnia/${legacyKind}s` : laravel ? "resources/views/oc-snippets" : "oc-snippets";
  return laravel || (await exists(path.join(cwd, "resources/js"))) ? "resources/js/components/oc" : "src/components/oc";
}

/** Does a content glob already cover a sample path? (tiny matcher: **, *, {a,b}) */
function globCovers(glob, sample) {
  const re = glob
    .replace(/[.+^$()|[\]\\]/g, "\\$&")
    .replace(/\{([^}]+)\}/g, (_, g) => `(${g.split(",").join("|")})`)
    .replace(/\*\*\//g, "\u0000").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\u0000/g, "(?:.*/)?");
  return new RegExp(`^${re}$`).test(sample);
}

/** Add a glob to omnia.config.json so "omniacss build" scans copied files (only when a config exists). */
export async function ensureContentGlob(glob, enableBlocks) {
  const file = path.join(cwd, CONFIG);
  let config;
  try { config = await readJson(file); } catch { return; }
  let changed = false;
  if (enableBlocks && !config.blocks) { config.blocks = true; changed = true; console.log(`Enabled "blocks" in ${CONFIG}`); }
  const sample = glob.replace("**/", "x/");
  const covered = (config.content || []).some((g) => g === glob || globCovers(g, sample));
  if (!covered) { config.content = [...(config.content || []), glob]; changed = true; console.log(`Added "${glob}" to ${CONFIG} content`); }
  if (changed) await fs.writeFile(file, JSON.stringify(config, null, 2) + "\n");
}
