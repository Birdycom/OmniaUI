// File: scripts/build-packages.mjs
// Builds the CSS of the npm packages (packages/*/dist) and the site copies in public/css.
// Map: OmniaCSS theme tokens (vendor oc-theme.css) -> read sources -> append parts/*.css (alphabetical) -> ui dist + min -> blocks dist + min
//      (+ pro.json names) -> public/css (+ oc-blocks-pro.css from vendor/omniaui-pro)
// Run: "npm run build:packages" (part of "npm run build").
//
// New components/blocks only ADD files: their CSS goes in packages/ui/src/parts/<name>.css or
// packages/blocks/src/parts/<name>.css. Every part is appended after the main CSS, so no shared file changes.

import fs from "node:fs/promises";
import path from "node:path";
import { transform } from "lightningcss";

const root = process.cwd();
const r = (...p) => path.join(root, ...p);

// Main component sources, in cascade order. code-block.css (syntax colors) is a separate site file.
const UI_MAIN = ["components.css", "showcase.css", "docs-ui.css", "components-extra.css"];

const read = (file) => fs.readFile(file, "utf8");

// Semantic theme tokens (--oc-background, --oc-primary, ...) are defined once in @birdycom/omniacss
// (tokens/semantic.json -> dist/oc-theme.css, the same source as its desktop export) and put in front of
// the components here. Refresh the vendored copy with "npm run sync:omniacss".
const THEME = "vendor/omniacss/dist/oc-theme.css";
// Built Pro CSS + Pro block names, copied in by "npm run sync:site" in ../omniaUI-pro (no Pro markup or wrappers).
const PRO = "vendor/omniaui-pro";

/** Contents of every <dir>/parts/*.css, alphabetical, each with a small marker comment. */
async function parts(srcDir) {
  const dir = path.join(srcDir, "parts");
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith(".css")).sort(); } catch { return []; }
  return Promise.all(files.map(async (f) => `/* parts/${f} */\n${await read(path.join(dir, f))}`));
}

// Browsers for minifying. Without targets lightningcss folds animation-timeline into the animation shorthand,
// which Chrome rejects, so scroll-driven animations stop. Same list as the omniacss CLI (--minify).
const v = (major, minor = 0) => (major << 16) | (minor << 8);
const MINIFY_TARGETS = { chrome: v(123), edge: v(123), firefox: v(120), safari: v(17, 5), ios_saf: v(17, 5) };

/** Write a CSS file and a minified copy next to it (<name>.min.css) for CDN use (jsDelivr/unpkg). */
async function writeWithMin(file, css) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, css);
  const { code } = transform({ filename: file, code: Buffer.from(css), minify: true, targets: MINIFY_TARGETS });
  await fs.writeFile(file.replace(/\.css$/, ".min.css"), code);
  console.log("[packages]", path.relative(root, file), `(${css.length} bytes, min ${code.length} bytes)`);
}

async function main() {
  // @birdycom/omniaui — components (+ parts) and the Code-block colors.
  const uiSrc = r("packages/ui/src");
  const theme = await read(r(THEME)).catch(() => { throw new Error(`${THEME} is missing: run "npm run sync:omniacss" (needs ../omniacss built).`); });
  const uiMain = [theme, ...(await Promise.all(UI_MAIN.map((f) => read(path.join(uiSrc, f)))))];
  const uiParts = await parts(uiSrc);
  const codeBlock = await read(path.join(uiSrc, "code-block.css"));
  await fs.rm(r("packages/ui/dist"), { recursive: true, force: true });
  // Plain copies of the sources (e.g. "@birdycom/omniaui/showcase.css" style imports keep working).
  await fs.cp(uiSrc, r("packages/ui/dist"), { recursive: true });
  await fs.writeFile(r("packages/ui/dist/oc-theme.css"), theme);
  // components.css in dist = everything incl. parts and the Code-block, so one import gives all.
  await writeWithMin(r("packages/ui/dist/components.css"), [...uiMain, ...uiParts, codeBlock].join("\n"));

  // @birdycom/omniaui-blocks — block CSS (+ parts). HTML snippets in packages/blocks/blocks are published as-is.
  const blocksSrc = r("packages/blocks/src");
  const blocksCss = [await read(path.join(blocksSrc, "blocks.css")), ...(await parts(blocksSrc))].join("\n");
  await fs.rm(r("packages/blocks/dist"), { recursive: true, force: true });
  await fs.cp(blocksSrc, r("packages/blocks/dist"), { recursive: true });
  await writeWithMin(r("packages/blocks/dist/blocks.css"), blocksCss);
  // Names of the OmniaUI Pro blocks (no markup): the omniaui CLI uses them for a hint, the site for its Pro badges.
  const proManifest = JSON.parse(await read(r(PRO, "manifest.json")).catch(() => '{"items":[]}'));
  await fs.writeFile(r("packages/blocks/pro.json"), JSON.stringify(proManifest, null, 2) + "\n");

  // Site copies (same sources). The site loads the Code-block colors as a separate file.
  await fs.writeFile(r("public/css/oc-components.css"), [...uiMain, ...uiParts].join("\n"));
  await fs.writeFile(r("public/css/oc-code-syntax.css"), codeBlock);
  await fs.writeFile(r("public/css/oc-blocks.css"), blocksCss);
  // Pro block styles, so the site can show the Pro blocks as live previews (their code stays in the Pro repo).
  const proCss = await read(r(PRO, "pro.css")).catch(() => { console.warn(`[packages] ${PRO}/pro.css missing: Pro previews stay unstyled (run "npm run sync:site" in ../omniaUI-pro).`); return ""; });
  await fs.writeFile(r("public/css/oc-blocks-pro.css"), proCss);
  // List-table behaviour. The docs page loads /js/oc-data-table.js (the name turns auto-start on).
  await fs.mkdir(r("public/js"), { recursive: true });
  await fs.copyFile(r("packages/ui/src/data-table.js"), r("public/js/oc-data-table.js"));
  console.log(`[packages] public/css: oc-components.css (${uiParts.length} parts), oc-code-syntax.css, oc-blocks.css`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
