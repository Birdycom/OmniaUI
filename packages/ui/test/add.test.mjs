// File: packages/ui/test/add.test.mjs
// Moved from packages/cli in the OmniaCSS repo (October 2026): the add/list commands live in the omniaui CLI now.
// Tests framework detection and copying for each flavour (css, vue, react, blade) in a temp project.
// Map: helpers (temp project, run) -> detection -> per flavour copy -> --force -> --import -> errors
// Author: Serge Cools | Framework: OmniaUI

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const bin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../bin/omniaui.mjs");

async function project(files = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omniaui-cli-"));
  for (const [name, content] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await fs.writeFile(path.join(dir, name), typeof content === "string" ? content : JSON.stringify(content));
  }
  return dir;
}
const run = (cwd, ...args) => execFileSync(process.execPath, [bin, ...args], { cwd, encoding: "utf8" });
const has = (dir, rel) => fs.stat(path.join(dir, rel)).then(() => true, () => false);

test("detects the framework from package.json and composer.json", async () => {
  const cases = [
    [{ "package.json": { dependencies: { vue: "^3" } } }, "vue"],
    [{ "package.json": { devDependencies: { react: "^18" } } }, "react"],
    [{ "composer.json": { require: { "laravel/framework": "^11" } } }, "blade"],
    [{ "composer.json": { require: { "laravel/framework": "^11" } }, "package.json": { dependencies: { vue: "^3" } } }, "vue"],
    [{ "package.json": {} }, "css"],
  ];
  for (const [files, expected] of cases) {
    assert.match(run(await project(files), "list", "--kind", "block"), new RegExp(`^framework: ${expected}$`, "m"));
  }
});

test("config framework wins over detection, the flag wins over config", async () => {
  const dir = await project({ "package.json": { dependencies: { vue: "^3" } }, "omnia.config.json": { framework: "react", content: [] } });
  assert.match(run(dir, "list"), /framework: react/);
  assert.match(run(dir, "list", "-f", "css"), /framework: css/);
});

test("vue: copies the component, sub-parts and composables", async () => {
  const dir = await project({ "package.json": { dependencies: { vue: "^3" } } });
  run(dir, "add", "accordion");
  for (const f of ["OcAccordion.vue", "OcAccordionItem.vue"]) assert.ok(await has(dir, `src/components/oc/components/${f}`), f);
  assert.ok(await has(dir, "src/components/oc/composables/useUid.ts"));
});

test("react: copies the component with utils and hooks next to it", async () => {
  const dir = await project({ "package.json": { dependencies: { react: "^18" } } });
  run(dir, "add", "modal", "--dir", "app/oc");
  for (const f of ["components/Modal.tsx", "components/Button.tsx", "hooks.tsx", "utils.ts"]) assert.ok(await has(dir, `app/oc/${f}`), f);
});

test("css: copies the HTML snippet; legacy `add block` keeps working", async () => {
  const dir = await project({ "package.json": {} });
  run(dir, "add", "button");
  assert.ok(await has(dir, "oc-snippets/button.html"));
  run(dir, "add", "block", "hero");
  assert.ok(await has(dir, "omnia/blocks/hero.html"));
});

test("blade: copies the views and rewrites <x-oc::> to <x-oc.>", async () => {
  const dir = await project({ "composer.json": { require: { "laravel/framework": "^11" } } });
  run(dir, "add", "hero", "--kind", "block", "--dry-run");
  assert.equal(await has(dir, "resources/views/components/oc"), false);
  run(dir, "add", "accordion", "block-hero");
  assert.ok(await has(dir, "resources/views/components/oc/accordion.blade.php"));
  assert.ok(await has(dir, "resources/views/components/oc/accordion/item.blade.php"));
  assert.ok(await has(dir, "resources/views/components/oc/block/hero.blade.php"));
  for (const f of await fs.readdir(path.join(dir, "resources/views/components/oc/block"))) {
    assert.doesNotMatch(await fs.readFile(path.join(dir, "resources/views/components/oc/block", f), "utf8"), /<\/?x-oc::/);
  }
});

test("--force overwrites, existing files are skipped otherwise", async () => {
  const dir = await project({ "package.json": { dependencies: { vue: "^3" } } });
  run(dir, "add", "button");
  const file = path.join(dir, "src/components/oc/components/OcButton.vue");
  await fs.writeFile(file, "mine");
  assert.match(run(dir, "add", "button"), /skip/);
  assert.equal(await fs.readFile(file, "utf8"), "mine");
  run(dir, "add", "button", "--force");
  assert.notEqual(await fs.readFile(file, "utf8"), "mine");
});

test("--import prints the import line and copies nothing", async () => {
  const dir = await project({ "package.json": {} });
  assert.match(run(dir, "add", "button", "-f", "vue", "--import"), /import \{ OcButton \} from "@birdycom\/omniaui-vue"/);
  assert.match(run(dir, "add", "button", "-f", "react", "--import"), /import \{ Button.*\} from "@birdycom\/omniaui-react"/);
  assert.match(run(dir, "add", "button", "-f", "blade", "--import"), /<x-oc::button \/>/);
  assert.equal((await fs.readdir(dir)).join(), "package.json");
});

test("unknown names and frameworks fail with a hint", async () => {
  const dir = await project({ "package.json": {} });
  assert.throws(() => run(dir, "add", "nope", "-f", "vue"), /Command failed/);
  assert.throws(() => run(dir, "add", "button", "-f", "svelte"), /Command failed/);
});

test("copy-js copies the installed scripts as oc-<name>.js into public/js", async () => {
  const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const dir = await project({ "public/.keep": "" });
  // The project's own @birdycom/omniaui: a link to this package.
  await fs.mkdir(path.join(dir, "node_modules/@birdycom"), { recursive: true });
  await fs.symlink(pkg, path.join(dir, "node_modules/@birdycom/omniaui"), "junction");
  const out = run(dir, "copy-js", "data-table");
  assert.ok(await has(dir, "public/js/oc-data-table.js"));
  assert.ok(!(await has(dir, "public/js/oc-carousel.js")), "only the named script");
  assert.match(out, /<script type="module" src="\/js\/oc-data-table\.js"><\/script>/);
  assert.match(run(dir, "copy-js", "data-table"), /exists, use --force/);
  assert.throws(() => run(dir, "copy-js", "nope"), /unknown script: nope/);
});
