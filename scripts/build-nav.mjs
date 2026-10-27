// File: scripts/build-nav.mjs
// Generates the sidebar navigation for components and blocks from the content files of the site.
// Map: read first-line meta of each content file -> label + category -> group -> public/data/oc-*-nav.json
// Run: "npm run gen:nav" (part of "npm run site:build").
//
// A content file starts with one meta line (JSON inside an HTML comment):
//   <!--oc-page {"title": "OmniaUI - Button", "category": "Forms", "nav": "Button", "layout": "sidebar", ...}-->
// - label    = "nav" when present, else the title without "OmniaUI - " / " Block(s)".
// - category = "category" when present, else "Components" (components) or "Blocks" (blocks).
// Groups follow scripts/lib/categories.mjs (the same order as the overview galleries), unknown groups after them by name;
// items are sorted by label. The fixed "Overview" group always comes first.

import fs from "node:fs";
import path from "node:path";
import { OMNIACSS_URL } from "../apps/site/src/lib/site.mjs";
import { COMPONENT_CATEGORIES, BLOCK_CATEGORIES, byCategoryOrder } from "./lib/categories.mjs";

const root = process.cwd();
const contentDir = path.join(root, "apps/site/src/content/ui");

const SECTIONS = [
  {
    folder: "components",
    out: "oc-components-nav.json",
    title: "OmniaUI Components",
    fallback: "Components",
    categories: COMPONENT_CATEGORIES,
    overview: [
      { id: "components", label: "All components", href: "/ui/components.html" },
      { id: "frameworks-react", label: "React", href: "/ui/frameworks-react.html" },
      { id: "frameworks-vue", label: "Vue", href: "/ui/frameworks-vue.html" },
      { id: "frameworks-laravel", label: "Laravel", href: "/ui/frameworks-laravel.html" },
    ],
  },
  {
    folder: "blocks",
    out: "oc-blocks-nav.json",
    title: "OmniaUI Blocks",
    fallback: "Blocks",
    categories: BLOCK_CATEGORIES,
    overview: [{ id: "blocks", label: "All blocks", href: "/ui/blocks.html" }, { id: "pro", label: "OmniaUI Pro", href: "/ui/pro.html" }],
  },
];

/** The JSON meta of the first line ({} when the file has none). */
function readMeta(file) {
  const first = fs.readFileSync(file, "utf8").split(/\r?\n/, 1)[0];
  const m = first.match(/^<!--oc-page (.*?)-->/);
  if (!m) return {};
  try { return JSON.parse(m[1]); } catch { console.warn(`[nav] invalid meta JSON in ${path.relative(root, file)}`); return {}; }
}

/** Sidebar label: "nav" in the meta, else the page title without the site prefix and " Block(s)" suffix. */
const labelOf = (meta, id) => meta.nav || (meta.title || id).replace(/^Omnia(?:CSS|UI)(?: UI)? - /, "").replace(/ Blocks?$/, "");

for (const s of SECTIONS) {
  const dir = path.join(contentDir, s.folder);
  const groups = new Map();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
    const id = file.replace(/\.html$/, "");
    const meta = readMeta(path.join(dir, file));
    const category = meta.category || s.fallback;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ id, label: labelOf(meta, id), href: `/ui/${s.folder}/${file}` });
  }
  const sections = [...groups.keys()].sort(byCategoryOrder(s.categories)).map((title) => ({
    title,
    items: groups.get(title).sort((a, b) => a.label.localeCompare(b.label)),
  }));
  const nav = {
    sidebarTitle: s.title,
    quickLinks: [
      { label: "Home", href: "/index.html" },
      { label: "OmniaCSS docs", href: `${OMNIACSS_URL}/docs/index.html` },
    ],
    leftSections: [{ title: "Overview", items: s.overview }, ...sections],
  };
  fs.writeFileSync(path.join(root, "public/data", s.out), JSON.stringify(nav, null, 2) + "\n");
  const count = sections.reduce((n, g) => n + g.items.length, 0);
  console.log(`[nav] public/data/${s.out}: ${count} items in ${sections.length} group(s)`);
}
