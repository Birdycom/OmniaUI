// File: scripts/cache-bust-assets.mjs
// Adds a content hash to every stylesheet and script URL (".../oc-components.css?v=<hash>") in the HTML pages.
// Herd/nginx serves CSS/JS without Cache-Control, so browsers may reuse an old file on a normal reload.
// A hash of the file content gives every change a new URL, so the browser always loads it.
// Map: hash public/css + public/js files -> rewrite <link>/<script> URLs in public/**/*.html
// Run: "npm run assets:bust" (part of "npm run site:build"). Copy of the OmniaCSS script, without the
// oc-colors.css import step (this site has no full utility build).

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const assetDirs = [[path.join(root, 'public/css'), '.css'], [path.join(root, 'public/js'), '.js']];

async function hashFile(filePath) {
  const content = await fs.readFile(filePath);
  return crypto.createHash('sha1').update(content).digest('hex').slice(0, 10);
}

/** All .html files below public/. */
async function listHtml() {
  const entries = await fs.readdir(path.join(root, 'public'), { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.html')).map((e) => path.join(e.parentPath ?? e.path, e.name));
}

async function main() {
  const hashes = new Map();
  for (const [dir, ext] of assetDirs) {
    // public/js is optional on this site.
    const names = await fs.readdir(dir).catch(() => []);
    for (const name of names) {
      if (name.endsWith(ext)) hashes.set(name, await hashFile(path.join(dir, name)));
    }
  }

  // Only rewrite real <link>/<script> tags; escaped code samples in the docs (&lt;link ...) stay untouched.
  const tagRe = /<(?:link|script)\b[^>]*>/g;
  const urlRe = /((?:href|src)="[^"]*?)([A-Za-z0-9_.-]+\.(?:css|js))(?:\?v=[^"]*)?"/;
  let changed = 0;
  for (const filePath of await listHtml()) {
    const content = await fs.readFile(filePath, 'utf8');
    const updated = content.replace(tagRe, (tag) =>
      tag.replace(urlRe, (match, prefix, name) => (hashes.has(name) ? `${prefix}${name}?v=${hashes.get(name)}"` : match))
    );
    if (updated !== content) {
      await fs.writeFile(filePath, updated, 'utf8');
      changed++;
    }
  }
  console.log('[bust]', `${changed} HTML file(s) updated`, Object.fromEntries(hashes));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
