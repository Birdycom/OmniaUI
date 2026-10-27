// File: scripts/build-manifests.mjs
// (Re)generates packages/ui/manifest.json and packages/blocks/manifest.json from the snippet files.
// Map: read snippet header -> merge with the existing manifest -> drop entries without a file -> write
// Run: "npm run gen:manifests" (part of "npm run build:packages").
//
// Merge rule: existing entries stay as they are (hand-written descriptions, order). Snippets that are
// not listed yet are added at the end, with the description from their header comment.
// Header format (first comment of the file, " — " or " - " both work):
//   <!-- OmniaUI component: <name> — <Description>. Needs @birdycom/omniaui CSS. -->
//   <!-- OmniaUI block: <name> — <Description>. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS. -->

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const TARGETS = [
  { kind: "component", pkg: "packages/ui", dir: "snippets", requires: ["@birdycom/omniaui"] },
  { kind: "block", pkg: "packages/blocks", dir: "blocks", requires: ["@birdycom/omniaui-blocks", "@birdycom/omniaui"] },
];

/** Name + description from the header comment, or null when the file has no valid header. */
function readHeader(text) {
  const comment = text.match(/^\s*<!--([\s\S]*?)-->/);
  if (!comment) return null;
  const flat = comment[1].replace(/\s+/g, " ").trim();
  const m = flat.match(/^Omnia(?:CSS|UI) (component|block): ([a-z0-9-]+) [—-] (.*)$/);
  if (!m) return null;
  const description = m[3].replace(/\s*Needs @.*$/, "").replace(/\.\s*$/, "").trim();
  return { kind: m[1], name: m[2], description };
}

for (const t of TARGETS) {
  const manifestPath = path.join(root, t.pkg, "manifest.json");
  const snippetDir = path.join(root, t.pkg, t.dir);
  let items = [];
  try { items = JSON.parse(fs.readFileSync(manifestPath, "utf8")).items; } catch { /* first run: empty */ }

  const files = fs.readdirSync(snippetDir).filter((f) => f.endsWith(".html")).sort();
  // Keep only entries whose snippet still exists.
  const kept = items.filter((i) => files.includes(path.basename(i.file)));
  const listed = new Set(kept.map((i) => path.basename(i.file)));
  const added = [];

  for (const file of files) {
    if (listed.has(file)) continue;
    const header = readHeader(fs.readFileSync(path.join(snippetDir, file), "utf8"));
    const name = file.replace(/\.html$/, "");
    if (!header) console.warn(`[manifests] ${t.pkg}/${t.dir}/${file}: no valid header comment, using the file name`);
    added.push({ name, file: `${t.dir}/${file}`, description: header?.description || name, requires: t.requires });
  }

  fs.writeFileSync(manifestPath, JSON.stringify({ items: [...kept, ...added] }, null, 2) + "\n");
  const removed = items.length - kept.length;
  console.log(`[manifests] ${t.pkg}/manifest.json: ${kept.length + added.length} ${t.kind}s (${added.length} added${removed ? `, ${removed} removed` : ""})`);
}
