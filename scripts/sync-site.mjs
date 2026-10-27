// File: scripts/sync-site.mjs
// After "astro build": copy the generated pages into public/ (served by Herd at https://omniaui.test) and
// build the site's utility CSS on demand with the vendored OmniaCSS engine (vendor/omniacss).
// Map: copy dist HTML -> search index -> on-demand public/css/omnia-site.css
// Run: "npm run site:build".

import fs from "node:fs/promises";
import path from "node:path";
import { buildCss } from "../vendor/omniacss/src/engine.mjs";
import { buildSearchIndex } from "./lib/search-index.mjs";

const root = process.cwd();
const dist = path.join(root, "apps/site/dist");
const out = path.join(root, "public");

async function copyHtml(from) {
  let n = 0;
  for await (const rel of fs.glob("**/*.html", { cwd: from })) {
    const target = path.join(out, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(path.join(from, rel), target);
    n++;
  }
  return n;
}

// public/ui and public/index.html are fully generated: clear the old pages first so removed pages disappear.
await fs.rm(path.join(out, "ui"), { recursive: true, force: true });
const pages = await copyHtml(dist);
console.log(`[site] ${pages} pages → public/`);

// Search index for the Ctrl K dialog (public/js/oc-docs-v2.js)
const indexed = await buildSearchIndex(dist, path.join(out, "data/search-index.json"), {
  siteName: "OmniaUI",
  featured: ["/ui/components.html", "/ui/blocks.html", "/ui/components/button.html", "/ui/components/modal.html", "/ui/components/data-table.html", "/ui/blocks/cms-dashboard.html", "/ui/blocks/pricing.html"],
});
console.log(`[site] data/search-index.json ${indexed} pages`);

// Site CSS: only the utilities used by the generated pages.
// Tokens (var(--color-…)) used by the component and site stylesheets must stay in the utility build.
const siteSheets = ["oc-components.css", "oc-code-syntax.css", "oc-blocks.css", "oc-blocks-pro.css", "omnia_site.css", "oc-docs-shell.css", "oc-docs-v2.css", "oc-layout-module.css"];
const referencedBy = await Promise.all(siteSheets.map((f) => fs.readFile(path.join(out, "css", f), "utf8").catch(() => "")));
const { css, stats } = await buildCss({
  content: ["apps/site/dist/**/*.html"],
  cwd: root,
  layer: false,
  dist: path.join(root, "vendor/omniacss/dist"),
  referencedBy,
});
await fs.writeFile(path.join(out, "css/omnia-site.css"), css);
console.log(`[site] css/omnia-site.css ${(stats.outputBytes / 1024).toFixed(0)} KB (full build ${(stats.inputBytes / 1024 / 1024).toFixed(1)} MB)`);
