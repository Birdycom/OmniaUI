// File: packages/ui/bin/lib/copy-js.mjs
// `omniaui copy-js`: copy the scripts of the installed OmniaUI packages into the project's public folder as
// oc-<name>.js, the name that makes them start on their own from a plain <script type="module"> tag.
// Map: scripts per package -> installed ones -> target folder (Laravel/Vite: public/js) -> copy (--force, --dry-run) -> script tags

import fs from "node:fs/promises";
import path from "node:path";
import { cwd, exists, pkgDir, posix } from "./project.mjs";

/** [package, file in the package, name in the project, what it does]. */
const SCRIPTS = [
  ["@birdycom/omniaui", "dist/data-table.js", "oc-data-table.js", "list table: sort, filter, select, paginate"],
  ["@birdycom/omniaui", "dist/carousel.js", "oc-carousel.js", "looping carousel (.oc-carousel--loop)"],
  ["@birdycom/omniaui-pro", "dist/spotlight.js", "oc-spotlight.js", "spotlight cards (Pro)"],
  ["@birdycom/omniaui-pro", "dist/ecosystem-map.js", "oc-ecosystem-map.js", "ecosystem map lines (Pro)"],
  ["@birdycom/omniaui-pro", "dist/infinite-carousel.js", "oc-infinite-carousel.js", "infinite carousel (Pro)"],
];

/** public/js when the project has a public folder (Laravel, Vite, Astro …), else js. */
async function defaultJsDir() {
  return (await exists(path.join(cwd, "public"))) ? "public/js" : "js";
}

export async function cmdCopyJs(names, flags) {
  const dir = path.resolve(cwd, flags.to || flags.dir || (await defaultJsDir()));
  const wanted = names.map((n) => n.replace(/^oc-|\.js$/g, ""));
  const picked = SCRIPTS.filter(([, , target]) => !wanted.length || wanted.includes(target.replace(/^oc-|\.js$/g, "")));
  if (wanted.length && picked.length !== wanted.length) {
    const known = SCRIPTS.map(([, , t]) => t.replace(/^oc-|\.js$/g, ""));
    throw new Error(`unknown script: ${wanted.filter((w) => !known.includes(w)).join(", ")} (known: ${known.join(", ")})`);
  }

  const copied = [];
  for (const [pkg, file, target, what] of picked) {
    let from;
    try { from = path.join(pkgDir(pkg), file); } catch { if (wanted.length) console.log(`skip ${target}: ${pkg} is not installed`); continue; }
    if (!(await exists(from))) continue;
    const to = path.join(dir, target);
    const rel = posix(path.relative(cwd, to));
    if ((await exists(to)) && !flags.force && !flags["dry-run"]) { console.log(`skip ${rel} (exists, use --force)`); continue; }
    if (!flags["dry-run"]) {
      await fs.mkdir(dir, { recursive: true });
      await fs.copyFile(from, to);
    }
    console.log(`${flags["dry-run"] ? "would copy" : "copied"} ${rel}  (${what})`);
    copied.push(target);
  }
  if (!copied.length) {
    console.log("No scripts copied. They come with @birdycom/omniaui and @birdycom/omniaui-pro: install those first.");
    return;
  }
  // The URL the page uses: the folder under public/ is served from the site root.
  const base = "/" + posix(path.relative(path.join(cwd, "public"), dir)).replace(/^(\.\.\/)+/, "");
  console.log(`\nLoad the ones a page needs; each starts on its own:`);
  for (const target of copied) console.log(`  <script type="module" src="${base}/${target}"></script>`);
}
