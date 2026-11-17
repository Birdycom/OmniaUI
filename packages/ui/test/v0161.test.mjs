// File: packages/ui/test/v0161.test.mjs
// `omniaui webicons`: a subset file from the Iconify sets in node_modules (no network), by name and by scanning a folder.
// Map: helpers -> webicons by name (resolved, unknown) -> --scan -> .oc-icon sizes in the CSS -> card accent band

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const bin = path.resolve(here, "../bin/omniaui.mjs");
const repo = path.resolve(here, "../../..");
const run = (...args) => execFileSync(process.execPath, [bin, ...args], { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

test("webicons: named icons from the installed sets into one small file", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omniaui-webicons-"));
  const out = path.join(dir, "webicons.json");
  const log = run("webicons", "mdi:home", "flag:nl-4x3", "mdi:no-such-icon", "--out", out);
  const icons = JSON.parse(await fs.readFile(out, "utf8"));
  assert.deepEqual(Object.keys(icons).sort(), ["flag:nl-4x3", "mdi:home"]);
  assert.equal(icons["mdi:home"].width, 24);
  assert.match(icons["mdi:home"].body, /^<path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"\/>$/);
  assert.equal(icons["flag:nl-4x3"].width, 640);
  assert.equal(icons["flag:nl-4x3"].height, 480);
  assert.match(log, /not found: mdi:no-such-icon/);
});

test("webicons: --scan finds the names used in the source", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omniaui-webicons-"));
  await fs.mkdir(path.join(dir, "src"));
  await fs.writeFile(path.join(dir, "src", "App.tsx"), `<Webicon name="mdi:account-outline" /> <x flag="flag:be-4x3" /> "material-symbols:home-outline-rounded" "notaset:x"`);
  const json = JSON.parse(run("webicons", "--scan", path.join(dir, "src")));
  assert.deepEqual(Object.keys(json).sort(), ["flag:be-4x3", "material-symbols:home-outline-rounded", "mdi:account-outline"]);
});

test("webicons: built-in icons come from OmniaUI when their set is not installed (no 'not installed' message)", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omniaui-webicons-"));
  const out = execFileSync(process.execPath, [bin, "webicons", "flag:nl-4x3", "mdi:check", "flag:es-4x3"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const json = JSON.parse(out);
  assert.deepEqual(Object.keys(json).sort(), ["flag:nl-4x3", "mdi:check"]);
  assert.equal(json["flag:nl-4x3"].width, 640);
});

test("tooltip: shown on hover and keyboard focus, not left on after a mouse click (:focus-within)", async () => {
  const css = await fs.readFile(path.resolve(here, "../src/components.css"), "utf8");
  assert.doesNotMatch(css, /\.oc-tooltip:focus-within/);
  assert.match(css, /\.oc-tooltip:has\(:focus-visible\)::after/);
  assert.match(css, /\.oc-tooltip:has\(:focus-visible\) > \.oc-tooltip__content/);
});

test("css: .oc-icon sizes xs to xl and the ratio of a wide icon", async () => {
  const css = await fs.readFile(path.resolve(here, "../src/parts/site-base.css"), "utf8");
  for (const [size, rem] of [["xs", "0.875rem"], ["sm", "1rem"], ["md", "1.25rem"], ["lg", "1.5rem"], ["xl", "2rem"]]) {
    assert.match(css, new RegExp(`\\.oc-icon--${size} \\{ --oc-icon-size: ${rem.replace(".", "\\.")}; \\}`));
  }
  assert.match(css, /inline-size: calc\(var\(--oc-icon-size\) \* var\(--oc-icon-ratio, 1\)\)/);
});

test("card accent: the band runs to the border and has a minimum height; mode colors are tokens", async () => {
  const css = await fs.readFile(path.resolve(here, "../src/parts/app-mode-badge.css"), "utf8");
  assert.match(css, /\.oc-card\.oc-card--accent \{[^}]*padding: 0;/);
  assert.match(css, /\.oc-card-band \{[^}]*min-block-size: var\(--oc-card-band-min-h, 4\.25rem\);/);
  assert.match(css, /--oc-mode-test: var\(--color-orange-20\);/);
  // no fixed mode color outside the tokens
  assert.equal(css.replace(/:root \{[^}]*\}/, "").match(/--color-(orange|green)-/g), null);
});
