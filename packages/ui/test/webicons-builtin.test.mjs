// File: packages/ui/test/webicons-builtin.test.mjs
// Guard: every webicon name the React, Vue and Blade components (and the vanilla JS in packages/ui/src) draw by
// themselves must be in the built-in set (scripts/build-webicons.mjs BUILTIN), so no app sees "Webicon … is not
// registered". Names in comments (doc examples such as "mdi:github") do not count.
// Map: read built-in names -> walk sources -> strip comments -> collect quoted names -> compare
// Author: Serge Cools | Framework: OmniaUI

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const builtinFiles = [
  "packages/ui/bin/lib/webicons-builtin.json",
  "php-packages/omniaui-laravel/resources/webicons/builtin.json",
];
const sourceDirs = [
  "packages/react/src",
  "packages/vue/src",
  "packages/ui/src",
  "php-packages/omniaui-laravel/resources/views",
  "php-packages/omniaui-laravel/src",
];
const exts = /\.(tsx?|vue|js|mjs|php)$/;
const iconName = /["'`]((?:mdi|mdi-light|material-symbols|svg-spinners|flag|vscode-icons):[a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (exts.test(entry.name) && !entry.name.endsWith(".d.ts") && !/webicons-builtin\./.test(entry.name)) out.push(p);
  }
  return out;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\{--[\s\S]*?--\}\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/(^|[\s;{}(),])\/\/.*$/gm, "$1");
}

function usedIcons() {
  const used = new Map();
  for (const dir of sourceDirs) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const code = stripComments(fs.readFileSync(file, "utf8"));
      for (const m of code.matchAll(iconName)) {
        if (!used.has(m[1])) used.set(m[1], path.relative(root, file).replace(/\\/g, "/"));
      }
    }
  }
  return used;
}

test("the built-in webicon sets are identical for the CLI and Laravel", () => {
  const [cli, laravel] = builtinFiles.map((f) => Object.keys(JSON.parse(fs.readFileSync(path.join(root, f), "utf8"))).sort());
  assert.deepEqual(laravel, cli);
});

test("every webicon the components draw by themselves is built in", () => {
  const builtin = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(root, builtinFiles[0]), "utf8"))));
  const used = usedIcons();
  assert.ok(used.size > 20, `expected to find the component icons, found ${used.size}`);
  const missing = [...used].filter(([name]) => !builtin.has(name)).map(([name, file]) => `${name} (${file})`);
  assert.deepEqual(missing, [], `not in BUILTIN (scripts/build-webicons.mjs): ${missing.join(", ")}`);
});
