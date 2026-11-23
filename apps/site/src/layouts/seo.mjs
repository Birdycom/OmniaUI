// File: apps/site/src/layouts/seo.mjs
// Search-engine and share tags for every page: canonical URL, Open Graph, Twitter card and JSON-LD.
// Same module in the OmniaCSS repo (apps/docs/src/lib/seo.mjs); only the SITE block below differs.
// Map: SITE (production URL, names, share image) -> plainText -> canonicalUrl -> breadcrumbs -> jsonLd

import fs from "node:fs";
import path from "node:path";
import { CONTENT, VERSION, GITHUB } from "../lib/site.mjs";

/**
 * The production address. Canonical, og:url and JSON-LD always point here, also in a local build (the links between
 * the sites use the Herd hosts locally, see OMNIACSS_URL in lib/site.mjs). Override with OMNIAUI_SITE_URL for a staging host.
 */
export const SITE_URL = (process.env.OMNIAUI_SITE_URL || "https://omniaui.eu").replace(/\/$/, "");

export const SITE = {
  name: "OmniaUI",
  description: "CSS-first components and blocks on OmniaCSS that are just HTML, with React, Vue and Blade versions.",
  image: { path: "/img/og-omniaui.png", width: 1200, height: 630, alt: "OmniaUI: components and blocks that are just HTML" },
  // Pages that get BreadcrumbList + TechArticle: the component, block, icon and framework pages (not the Pro pricing).
  docs: (route) => route.startsWith("ui/") && route !== "ui/pro.html",
  // Title prefixes and suffixes that are not part of the page name ("OmniaUI - Accordion" -> "Accordion").
  titleNoise: /^OmniaUI(?: Pro)?\s*[-–—:]\s*|\s*[-–—|]\s*OmniaUI$/g,
  app: {
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    sameAs: [GITHUB, "https://www.npmjs.com/package/@birdycom/omniaui"],
  },
};

const PUBLISHER = { "@type": "Organization", name: "Birdycom", url: "https://birdycom.be" };

/** Text for a meta attribute: no tags, entities decoded once (Astro escapes the attribute itself). */
export function plainText(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

/** "ui/components/card.html" -> https://…/ui/components/card; a folder's index.html is the folder itself (clean URLs). */
export function canonicalUrl(route) {
  return `${SITE_URL}/${route.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "")}`;
}

/** The page name of a title, without the site name. */
export const pageName = (title) => plainText(title).replace(SITE.titleNoise, "").trim() || SITE.name;

/** Title of another content page (first-line oc-page meta), or null when the file does not exist. */
function titleOf(route) {
  const file = path.join(CONTENT, route);
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, "utf8").match(/^<!--oc-page (.*?)-->/);
  try { return m ? JSON.parse(m[1]).title || null : null; } catch { return null; }
}

/**
 * Home -> every parent page that exists (folder/index.html, or folder.html next to the folder) -> this page.
 * "ui/components/card.html": OmniaUI -> Components (ui/components.html) -> Card.
 */
export function breadcrumbs(route, title) {
  const trail = [{ name: SITE.name, url: `${SITE_URL}/` }];
  const parts = route.split("/");
  const isIndex = parts.at(-1) === "index.html";
  const dirs = parts.slice(0, isIndex ? -2 : -1);
  for (let i = 1; i <= dirs.length; i++) {
    const dir = dirs.slice(0, i).join("/");
    for (const candidate of [`${dir}/index.html`, `${dir}.html`]) {
      const t = titleOf(candidate);
      if (t) { trail.push({ name: pageName(t), url: canonicalUrl(candidate) }); break; }
    }
  }
  if (route !== "index.html") trail.push({ name: pageName(title), url: canonicalUrl(route) });
  return trail;
}

/** JSON-LD objects for a page: WebSite + SoftwareApplication on the home, BreadcrumbList + TechArticle on docs pages. */
export function jsonLd({ route, title, description }) {
  const url = canonicalUrl(route);
  const website = { "@type": "WebSite", name: SITE.name, url: `${SITE_URL}/`, inLanguage: "en", publisher: PUBLISHER };
  if (route === "index.html") {
    return [
      { "@context": "https://schema.org", ...website, description: SITE.description },
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE.name, url: `${SITE_URL}/`, description: SITE.description, softwareVersion: VERSION, publisher: PUBLISHER, ...SITE.app },
    ];
  }
  if (!SITE.docs(route)) return [];
  const trail = breadcrumbs(route, title);
  return [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) },
    { "@context": "https://schema.org", "@type": "TechArticle", headline: pageName(title).slice(0, 110), description, url, mainEntityOfPage: url, inLanguage: "en", image: SITE_URL + SITE.image.path, isPartOf: website, publisher: PUBLISHER, about: { "@type": "SoftwareApplication", name: SITE.name, applicationCategory: SITE.app.applicationCategory } },
  ];
}

/** JSON for inside <script type="application/ld+json">: "<" escaped so no text can close the script tag. */
export const ldScript = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
