// File: packages/ui/test/css-encoding.test.mjs
// Map: every CSS source of OmniaUI (+ the built dist files) -> no raw non-ASCII character in a `content` value.
// Why: the stylesheets are served as text/css without a charset. A page or preview that is not UTF-8 then read the
// bytes of "→" as windows-1252 and showed "â†’" (product card "Discover"). Write "\002192" instead.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const dirs = ["packages/ui/src", "packages/ui/dist", "packages/blocks/src", "packages/blocks/dist"];
const files = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }) : [])
  .filter((f) => String(f).endsWith(".css")).map((f) => path.join(dir, String(f)));

test("CSS content values use escapes, never raw non-ASCII characters", () => {
  const bad = [];
  for (const file of dirs.flatMap((d) => files(path.join(root, d)))) {
    for (const m of fs.readFileSync(file, "utf8").matchAll(/\bcontent\s*:([^;}]*)/g)) {
      if (/[^\x00-\x7F]/u.test(m[1])) bad.push(`${path.relative(root, file)}: content:${m[1].trim().slice(0, 40)}`);
    }
  }
  assert.deepEqual(bad, [], `write these as CSS escapes ("\\002192"):\n${bad.join("\n")}`);
});
