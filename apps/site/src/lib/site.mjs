// File: apps/site/src/lib/site.mjs
// Site-wide constants: repository paths, version, header links, and the OmniaCSS docs URL.
// Map: findRepo -> paths + version -> OMNIACSS_URL + header links -> footer links -> crossLinks -> sectionOf

import fs from "node:fs";
import path from "node:path";

/** Repository root: walk up from the working directory to the workspace package.json (bundling moves this module). */
function findRepo(dir = process.cwd()) {
  for (let d = dir; ; d = path.dirname(d)) {
    const pkg = path.join(d, "package.json");
    if (fs.existsSync(pkg) && JSON.parse(fs.readFileSync(pkg, "utf8")).name === "omniaui-workspace") return d;
    if (path.dirname(d) === d) throw new Error("omniaui site: workspace root not found from " + dir);
  }
}

export const REPO = findRepo();
export const CONTENT = path.join(REPO, "apps/site/src/content");

export const VERSION = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8")).version;
export const RELEASES = JSON.parse(fs.readFileSync(path.join(REPO, "docs/release-history.json"), "utf8")).releases;

// The CSS docs (utilities, tokens, /docs/* and /pages/*) live on the OmniaCSS site.
// This is the ONLY place with its base URL. Change it here for production.
export const OMNIACSS_URL = "https://omniacss.test";

// The same menu, in the same order, as on omniacss.eu (apps/docs/src/lib/site.mjs in the OmniaCSS repo): a visitor
// who moves between the two sites keeps every item in its place. Keep both lists equal. The first item is always the
// other site (the brand on the left leads to this site's home); oc-docs-v2.css gives it a fixed width, so "OmniaCSS"
// and "OmniaUI" take the same room.
export const HEADER_LINKS = [
  { id: "omniacss", label: "OmniaCSS", href: `${OMNIACSS_URL}/index.html` },
  { id: "docs", label: "Docs", href: `${OMNIACSS_URL}/docs/index.html` },
  { id: "components", label: "Components", href: "/ui/components.html" },
  { id: "blocks", label: "Blocks", href: "/ui/blocks.html" },
  { id: "starter-kits", label: "Starter kits", href: "/ui/starter-kits.html" },
  { id: "webicons", label: "Webicons", href: "/ui/webicons.html" },
  { id: "story", label: "Our story", href: `${OMNIACSS_URL}/story.html` },
  { id: "release-notes", label: "Release notes", href: `${OMNIACSS_URL}/release-notes.html` },
];

// Header button to the Pro pricing (every page, so buyers find it without going through Blocks).
export const PRO_LINK = { label: "Pro", href: "/ui/pro.html#pricing", route: "ui/pro.html" };

export const GITHUB = "https://github.com/Birdycom/OmniaUI";

// The one bottom bar of every page (layouts/ContentPage.astro, .ocd-footer in oc-docs-v2.css): copyright + version on
// the left, these links on the right. Same labels and order as on omniacss.eu (apps/docs/src/lib/site.mjs in the
// OmniaCSS repo); only the GitHub repo and the terms page are this site's own. Keep both lists equal. The release notes
// of both packages (same version number) are one page on omniacss.eu.
export const FOOTER_LINKS = [
  { label: "OmniaCSS docs", href: `${OMNIACSS_URL}/docs/index.html` },
  { label: "OmniaUI components", href: "/ui/components.html" },
  { label: "Release notes", href: `${OMNIACSS_URL}/release-notes.html` },
  { label: "GitHub", href: GITHUB },
  { label: "License", href: "/legal/terms.html#license" },
  { label: "Terms", href: "https://birdycom.be/en/terms/omniaui-pro" },
  { label: "Privacy", href: "https://birdycom.be/en/privacy" },
  { label: "Cookies", href: "https://birdycom.be/en/cookies" },
  { label: "birdycom.be", href: "https://birdycom.be/en" },
];
// Copyright years in the footer bar: from the first release (2022) to the year of the build.
export const COPYRIGHT_YEARS = { from: 2022, to: new Date().getFullYear() };

/**
 * Links in the content to CSS docs pages ("/docs/x.html", "../docs/x.html", "/pages/x.html")
 * go to the OmniaCSS site. A live frame of the OmniaCSS site (<iframe src="https://omniacss.eu/..."> in a demo) loads
 * the same base URL, so the local site never requests the live one. Code panels are escaped (&lt;iframe) and keep
 * the public URL.
 */
export function crossLinks(html) {
  return html
    .replace(/href="(?:\/|(?:\.\.\/)+)(docs|pages)\//g, `href="${OMNIACSS_URL}/$1/`)
    .replace(/(<iframe\b[^>]*\bsrc=")https:\/\/omniacss\.eu\//g, `$1${OMNIACSS_URL}/`);
}

/** Which top-level section a page belongs to (used for the header active state and the sidebar). */
export function sectionOf(route) {
  if (route.startsWith("ui/components") || route === "ui/components.html" || route.startsWith("ui/frameworks-")) return "components";
  if (route.startsWith("ui/blocks") || route === "ui/blocks.html" || route === "ui/pro.html" || route === "ui/security.html") return "blocks";
  if (route.startsWith("ui/icons") || route === "ui/webicons.html") return "webicons";
  if (route === "ui/starter-kits.html") return "starter-kits";
  return "home";
}
