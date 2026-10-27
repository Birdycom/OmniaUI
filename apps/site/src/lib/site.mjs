// File: apps/site/src/lib/site.mjs
// Site-wide constants: repository paths, version, header links, and the OmniaCSS docs URL.
// Map: findRepo -> paths + version -> OMNIACSS_URL + header links -> crossLinks -> sectionOf

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

export const HEADER_LINKS = [
  { id: "home", label: "Home", href: "/index.html" },
  { id: "components", label: "Components", href: "/ui/components.html" },
  { id: "blocks", label: "Blocks", href: "/ui/blocks.html" },
  { id: "webicons", label: "Webicons", href: "/ui/webicons.html" },
  { id: "docs", label: "Docs", href: `${OMNIACSS_URL}/docs/index.html` },
  // Back to the sister site: "Home" is the OmniaUI home, so the CSS framework needs its own link.
  { id: "omniacss", label: "OmniaCSS", href: `${OMNIACSS_URL}/index.html` },
];

// Header button to the Pro pricing (every page, so buyers find it without going through Blocks).
export const PRO_LINK = { label: "Pro", href: "/ui/pro.html#pricing", route: "ui/pro.html" };

export const GITHUB = "https://github.com/Birdycom/OmniaUI";

/**
 * Links in the content to CSS docs pages ("/docs/x.html", "../docs/x.html", "/pages/x.html")
 * go to the OmniaCSS site.
 */
export function crossLinks(html) {
  return html.replace(/href="(?:\/|(?:\.\.\/)+)(docs|pages)\//g, `href="${OMNIACSS_URL}/$1/`);
}

/** Which top-level section a page belongs to (used for the header active state and the sidebar). */
export function sectionOf(route) {
  if (route.startsWith("ui/components") || route === "ui/components.html" || route.startsWith("ui/frameworks-")) return "components";
  if (route.startsWith("ui/blocks") || route === "ui/blocks.html" || route === "ui/pro.html") return "blocks";
  if (route.startsWith("ui/icons") || route === "ui/webicons.html") return "webicons";
  return "home";
}
