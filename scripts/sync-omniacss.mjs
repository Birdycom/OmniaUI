// File: scripts/sync-omniacss.mjs
// Refreshes the vendored OmniaCSS copy in vendor/omniacss/ from a sibling checkout (../omniacss).
// Map: find ../omniacss/packages/core -> check dist is built -> copy files -> write version stamp
// Run: "npm run sync:omniacss" (build OmniaCSS first: "npm run build" in ../omniacss).
//
// Why vendored? The OmniaCSS repo is private and not on npm yet, so CI here cannot fetch it.
// The vendored files are committed. OmniaUI uses them for:
//   - dist/omnia.css + dist/oc-colors.css: input of the on-demand engine (site CSS) and the tokens,
//   - dist/oc-theme.css: the semantic theme tokens, put in front of components.css by build-packages.mjs,
//   - src/engine.mjs + src/variants.mjs: the on-demand engine itself.

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.resolve(root, "../omniacss/packages/core");
const target = path.join(root, "vendor/omniacss");

// Files to copy, relative to packages/core. Keep this list small: only what OmniaUI really uses.
const FILES = ["dist/omnia.css", "dist/oc-colors.css", "dist/oc-theme.css", "src/engine.mjs", "src/variants.mjs", "package.json", "LICENSE"];

const exists = (p) => fs.stat(p).then(() => true, () => false);

if (!(await exists(source))) {
  console.log(`[sync:omniacss] ${path.relative(root, source)} not found.`);
  console.log("[sync:omniacss] Clone the OmniaCSS repo next to this one (../omniacss) to refresh vendor/omniacss/.");
  console.log("[sync:omniacss] Nothing changed: the committed vendored copy is still used.");
  process.exit(0);
}

if (!(await exists(path.join(source, "dist/omnia.css")))) {
  console.error("[sync:omniacss] ../omniacss/packages/core/dist is missing. Run \"npm run build\" in ../omniacss first.");
  process.exit(1);
}

for (const rel of FILES) {
  const to = path.join(target, rel);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(path.join(source, rel), to);
  console.log("[sync:omniacss]", rel);
}

const { version } = JSON.parse(await fs.readFile(path.join(source, "package.json"), "utf8"));
console.log(`[sync:omniacss] vendor/omniacss now matches @birdycom/omniacss ${version}`);
