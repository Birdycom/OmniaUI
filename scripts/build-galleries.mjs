// File: scripts/build-galleries.mjs
// Generates the overview galleries apps/site/src/content/ui/components.html and ui/blocks.html from the content files.
// Map: first-line meta of each page (title, category, description) + manifests (CLI names) -> one card per page,
//      grouped as in scripts/lib/categories.mjs; blocks get a thumbnail from public/img/blocks/<name>.jpg when present.
// Run: "npm run gen:galleries" (part of "npm run site:build"). Do not edit the two overview pages by hand.
//
// Card text = "description" in the meta, else the manifest description, else the first sentence of the hero.
// Thumbnails (light + "-dark.jpg", 16:10) are screenshots of the first demo; a block without one gets a text card.

import fs from "node:fs";
import path from "node:path";
import { COMPONENT_CATEGORIES, BLOCK_CATEGORIES, byCategoryOrder } from "./lib/categories.mjs";

const root = process.cwd();
const contentDir = path.join(root, "apps/site/src/content/ui");
const TONES = ["vividblue", "indigo", "purple", "magenta", "red", "orange", "green", "teal"];

/** Manifest names per kind, for the "omniaui add" line, and their descriptions as a fallback. */
const registry = { components: new Map(), blocks: new Map() };
for (const [kind, pkg] of [["components", "ui"], ["blocks", "blocks"]]) {
  for (const it of JSON.parse(fs.readFileSync(path.join(root, "packages", pkg, "manifest.json"), "utf8")).items) registry[kind].set(it.name, it.description);
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (s) => s.replace(/&(?!\w+;|#\d+;)/g, "&amp;");
const sentence = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** The CLI name: the page name, or its numbered variants (login -> login-01 … 05), or "" when there is none. */
function addName(kind, name) {
  if (registry[kind].has(name)) return name;
  if (name === "password-reset") return "forgot-password reset-password";
  const stem = name.replace(/s$/, "");
  const variants = [...registry[kind].keys()].filter((n) => n.startsWith(`${stem}-`) && /-\d+$/.test(n)).sort();
  if (variants.length > 1) return `${variants[0]} … ${variants.at(-1).match(/\d+$/)[0]}`;
  return variants[0] || "";
}

function readPages(kind) {
  return fs.readdirSync(path.join(contentDir, kind)).filter((f) => f.endsWith(".html")).map((file) => {
    const src = fs.readFileSync(path.join(contentDir, kind, file), "utf8");
    const m = src.match(/^<!--oc-page (.*?)-->/);
    const meta = m ? JSON.parse(m[1]) : {};
    const name = file.replace(/\.html$/, "");
    let desc = meta.description || registry[kind].get(name) || "";
    if (!desc) {
      const hero = src.match(/<p class="oc-hero-text">([\s\S]*?)<\/p>/);
      desc = hero ? hero[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().split(/(?<=\.)\s/)[0] : "";
    }
    return {
      name,
      title: (meta.nav || meta.title || name).replace(/^OmniaUI\s*-\s*/, "").replace(/\s+Blocks?$/, ""),
      category: meta.category || (kind === "blocks" ? "Blocks" : "Components"),
      desc: desc && sentence(desc),
      demos: (src.match(/<oc-demo\b/g) || []).length,
      // "0.12" from the first version badge (oc-badge-version "v0.12.0"): the release that brought the page.
      minor: (src.match(/oc-badge-version">v(\d+\.\d+)\.\d+</) || [])[1] || "",
      // "all": an OmniaUI Pro block, "some": a family with Pro variants (meta "pro" of the page)
      pro: meta.pro || "",
    };
  });
}

function thumbnail(name) {
  const img = (n) => fs.existsSync(path.join(root, "public/img/blocks", n));
  if (!img(`${name}.jpg`)) return "";
  // Both images, CSS shows the one of the current site theme (the switch or data-theme, else the OS): a <picture>
  // with prefers-color-scheme would follow the OS only. Lazy images that are not shown are not downloaded.
  const tag = (file, cls) => `<img class="${cls}" src="/img/blocks/${file}" alt="" loading="lazy" decoding="async" width="640" height="400">`;
  const dark = img(`${name}-dark.jpg`) ? tag(`${name}-dark.jpg`, "gx-dark") : "";
  return `<span class="gx-shot${dark ? " gx-shot--themed" : ""}">${tag(`${name}.jpg`, "gx-light")}${dark}</span>`;
}

const tone = (t) => `--c: var(--color-${t}-60); --ci: light-dark(var(--color-${t}-60), var(--color-${t}-20))`;

const CSS = `
    .gx-hero { display: grid; gap: 1.25rem; }
    .gx-stats { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; margin: 0; padding: 0; list-style: none; font: 500 0.8rem var(--ocd-mono); color: var(--oc-muted-foreground); }
    .gx-stats b { font: 700 1.5rem var(--ocd-display); color: var(--oc-foreground); margin-inline-end: 0.35rem; }
    .gx-jump { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .gx-chip { --c: var(--color-vividblue-60); display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.3rem 0.75rem; border: 1px solid var(--oc-border); border-radius: 999px; color: inherit; font-size: 0.85rem; text-decoration: none; transition: border-color 0.2s; }
    .gx-chip::before { content: ""; inline-size: 0.5rem; block-size: 0.5rem; border-radius: 50%; background: var(--ci, var(--c)); }
    .gx-chip:hover { border-color: var(--c); }
    .gx-jump small { font: 500 0.7rem var(--ocd-mono); color: var(--oc-muted-foreground); }
    .gx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); gap: 0.75rem; }
    .gx-grid--blocks { grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr)); }
    .gx-card { --c: var(--color-vividblue-60); position: relative; display: grid; grid-template-rows: auto auto 1fr auto; gap: 0.35rem; padding: 1rem 1.1rem 0.9rem; border: 1px solid var(--oc-border); border-radius: 14px; color: inherit; text-decoration: none; overflow: hidden; transition: border-color 0.2s, translate 0.2s, box-shadow 0.2s; }
    .gx-card::before { content: ""; position: absolute; inset: 0 auto 0 0; inline-size: 3px; background: var(--c); opacity: 0; transition: opacity 0.2s; }
    .gx-card:hover { border-color: color-mix(in oklch, var(--c) 55%, var(--oc-border)); translate: 0 -2px; box-shadow: 0 10px 30px -18px var(--c); }
    .gx-card:hover::before { opacity: 1; }
    .gx-card:focus-visible { outline: 2px solid var(--oc-ring); outline-offset: 2px; }
    .gx-card b { font: 600 1.02rem var(--ocd-display); }
    .gx-card span { font-size: 0.86rem; line-height: 1.5; color: var(--oc-muted-foreground); }
    .gx-card span code { font-size: 0.8em; }
    .gx-card small { display: flex; justify-content: space-between; gap: 0.5rem; margin-block-start: 0.35rem; font: 500 0.7rem var(--ocd-mono); color: var(--oc-muted-foreground); }
    .gx-card small i { font-style: normal; color: var(--ci, var(--c)); }
    .gx-shot { margin: -1rem -1.1rem 0.4rem; aspect-ratio: 16 / 10; overflow: hidden; border-block-end: 1px solid var(--oc-border); background: var(--oc-muted); }
    .gx-shot--themed .gx-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]):not(:has(.oc-theme-switch input[value="light"]:checked:not(.oc-theme-scope *))) .gx-shot--themed .gx-light { display: none; }
      :root:not([data-theme="light"]):not(:has(.oc-theme-switch input[value="light"]:checked:not(.oc-theme-scope *))) .gx-shot--themed .gx-dark { display: block; }
    }
    :root:is([data-theme="dark"], :has(.oc-theme-switch input[value="dark"]:checked:not(.oc-theme-scope *))) .gx-shot--themed .gx-light { display: none; }
    :root:is([data-theme="dark"], :has(.oc-theme-switch input[value="dark"]:checked:not(.oc-theme-scope *))) .gx-shot--themed .gx-dark { display: block; }
    .gx-new { position: absolute; inset: 0.6rem auto auto 0.6rem; z-index: 1; padding: 0.1rem 0.5rem; border-radius: 999px; font: 700 0.65rem var(--ocd-mono); font-style: normal; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-white-50); background: linear-gradient(135deg, var(--color-green-70), var(--color-teal-70)); }
    .gx-shot img { display: block; inline-size: 100%; block-size: 100%; object-fit: contain; object-position: center; transition: scale 0.4s; }
    .gx-card:hover .gx-shot img { scale: 1.03; }
    .gx-pro { position: absolute; inset: 0.6rem 0.6rem auto auto; z-index: 1; padding: 0.1rem 0.5rem; border-radius: 999px; font: 700 0.65rem var(--ocd-mono); font-style: normal; letter-spacing: 0.06em; text-transform: uppercase; color: var(--oc-primary-foreground); background: var(--ocd-accent); }
    @media (prefers-reduced-motion: reduce) { .gx-card, .gx-card::before, .gx-shot img, .gx-chip { transition: none; } }`;

const USED_BY_DOCS = `
      <section class="oc-docs-section" id="used-by-docs">
        <div class="oc-section-header">
          <h2 class="oc-section-header__title">The components this documentation is built with</h2>
          <p class="oc-section-header__desc">The documentation site does not use private styles for its own chrome: every piece you see around the content is an OmniaUI component, so you can build the same thing in your project.</p>
        </div>
        <div class="oc-section-content">
          <table class="oc-table-ref">
            <thead><tr><th class="w-perc-1/3">Where on this site</th><th>Component</th></tr></thead>
            <tbody>
              <tr><td>Top bar with the menu</td><td><a href="components/site-header.html">Site header</a> with <a href="components/navmenu.html">Navigation menu</a> (<code>--site</code>)</td></tr>
              <tr><td>Light / dark / system switch</td><td><a href="components/theme-switch.html">Theme switch</a></td></tr>
              <tr><td>Left menu</td><td><a href="components/sidebar.html#docs-sidebar">Sidebar, docs variant</a></td></tr>
              <tr><td>Right "On this page"</td><td><a href="components/toc.html">Table of contents</a></td></tr>
              <tr><td>Examples with preview and code</td><td><a href="components/demo-panel.html">Demo panel</a> and <a href="components/code.html">Code block</a></td></tr>
              <tr><td>Buttons ("Show more", links, actions)</td><td><a href="components/button.html">Button</a>, <a href="components/expandable-table.html">Expandable table</a></td></tr>
              <tr><td>Reference tables</td><td><a href="components/table.html">Table</a></td></tr>
              <tr><td>Version badge, status pills</td><td><a href="components/badge.html">Badge</a></td></tr>
              <tr><td>Section intros and cards</td><td><a href="components/section-header.html">Section header</a>, <a href="components/card.html">Card</a></td></tr>
              <tr><td>Footer line</td><td><a href="components/site-footer.html">Site footer</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>
`;

const KINDS = {
  components: {
    categories: COMPONENT_CATEGORIES,
    example: "modal",
    packages: "@birdycom/omniaui",
    hero: `<h1 class="oc-hero-title">Components</h1>
        <p class="oc-hero-text">Themeable building blocks with the <code>oc-</code> prefix. Native HTML does the behaviour: dialogs on <code>&lt;dialog&gt;</code>, menus on <code>popover</code>, tabs on radio inputs and <code>:has()</code>. Every page has live demos you can resize, copy-ready code and the browser support straight from MDN.</p>`,
    tail: USED_BY_DOCS,
  },
  blocks: {
    categories: BLOCK_CATEGORIES,
    example: "pricing",
    packages: "@birdycom/omniaui @birdycom/omniaui-blocks",
    hero: `<h1 class="oc-hero-title">Blocks</h1>
        <p class="oc-hero-text">Whole sections and screens, composed from OmniaCSS utilities and OmniaUI components: dashboards, sign-in flows, landing page sections. Open one to resize the live demo, copy the HTML, or add it to your project as Vue, React or Blade with one command. Blocks marked <b>Pro</b> are part of <a href="pro.html">OmniaUI Pro</a>: their demos are live here, their code comes with a license.</p>`,
    tail: "",
  },
};

// "New" = brought by the newest release that any page names (components and blocks together), so the badge moves
// on by itself: once v0.13 pages exist, the v0.12 ones lose it.
const byVersion = (a, b) => { const [x, y] = [a, b].map((v) => v.split(".").map(Number)); return x[0] - y[0] || x[1] - y[1]; };
const newest = Object.keys(KINDS).flatMap((kind) => readPages(kind).map((p) => p.minor)).filter(Boolean).sort(byVersion).at(-1) || "";

for (const [kind, k] of Object.entries(KINDS)) {
  const pages = readPages(kind);
  const freshCount = pages.filter((p) => p.minor === newest).length;
  const titles = [...new Set(pages.map((p) => p.category))].sort(byCategoryOrder(k.categories));
  const groups = titles.map((title, i) => ({
    title,
    tone: TONES[i % TONES.length],
    items: pages.filter((p) => p.category === title).sort((a, b) => a.title.localeCompare(b.title)),
  }));
  const card = (p, t) => {
    const fresh = p.minor && p.minor === newest ? `<em class="gx-new">New</em>` : "";
    const cli = p.pro === "all" ? "" : addName(kind, p.name);
    const badge = p.pro ? `<em class="gx-pro">${p.pro === "all" ? "Pro" : "Free + Pro"}</em>` : "";
    return `<a class="gx-card" href="${kind}/${p.name}.html" style="${tone(t)}">${kind === "blocks" ? thumbnail(p.name) : ""}${fresh}${badge}<b>${esc(p.title)}</b><span>${p.desc}</span><small><i>${cli ? `omniaui add ${cli}` : p.pro === "all" ? "OmniaUI Pro" : ""}</i>${p.demos > 1 ? `<em>${p.demos} demos</em>` : ""}</small></a>`;
  };
  const single = kind === "blocks" ? "block" : "component";
  const body = `<section class="oc-hero gx-hero" id="overview" data-oc-no-compat>
        ${k.hero}
        <ul class="gx-stats"><li><b>${pages.length}</b>${kind}</li>${freshCount ? `<li><b>${freshCount}</b>new in v${newest}</li>` : ""}<li><b>${groups.length}</b>categories</li><li><b>4</b>flavours: HTML, Vue, React, Blade</li></ul>
        <nav class="gx-jump" aria-label="Categories">${groups.map((g) => `<a class="gx-chip" href="#${slug(g.title)}" style="${tone(g.tone)}">${esc(g.title)} <small>${g.items.length}</small></a>`).join("")}</nav>
      </section>

      <section class="oc-docs-section" id="install">
        <div class="oc-section-header"><h2 class="oc-section-header__title">Add one to your project</h2>
          <p class="oc-section-header__desc">Install the package for the styles, then copy the ${single} you need in the flavour you use. The command writes the file into your project; you own the code from then on.</p></div>
        <div class="oc-section-content">
          <oc-code lang="bash">npm install ${k.packages}
npx omniaui add ${k.example}                 # plain HTML
npx omniaui add ${k.example} -f vue          # or -f react, -f blade
npx omniaui list ${kind}</oc-code>
        </div>
      </section>
${groups.map((g) => `
      <section class="oc-docs-section" id="${slug(g.title)}">
        <div class="oc-section-header"><h2 class="oc-section-header__title">${esc(g.title)}</h2>${k.categories[g.title] ? `<p class="oc-section-header__desc">${k.categories[g.title]}</p>` : ""}</div>
        <div class="oc-section-content"><div class="gx-grid${kind === "blocks" ? " gx-grid--blocks" : ""}">
          ${g.items.map((p) => card(p, g.tone)).join("\n          ")}
        </div></div>
      </section>`).join("\n")}
${k.tail}`;
  const description = `${pages.length} ${kind} for OmniaCSS in ${groups.length} categories, as HTML, Vue, React and Blade.`;
  const meta = { title: `OmniaUI - ${kind === "blocks" ? "Blocks" : "Components"}`, description, layout: "sidebar", shell: "ui", shellClass: "ocd-shell", bodyClass: "", head: [`<style>${CSS}\n  </style>`] };
  fs.writeFileSync(path.join(contentDir, `${kind}.html`), `<!--oc-page ${JSON.stringify(meta)}-->\n<!-- Generated by scripts/build-galleries.mjs from the meta lines of ui/${kind}/*.html. Do not edit by hand. -->\n${body}`);
  const missing = pages.filter((p) => !p.desc).map((p) => p.name);
  console.log(`[galleries] apps/site/src/content/ui/${kind}.html: ${pages.length} cards in ${groups.length} group(s)${missing.length ? ` (no description: ${missing.join(", ")})` : ""}`);
}
