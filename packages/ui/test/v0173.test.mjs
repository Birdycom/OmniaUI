// File: packages/ui/test/v0173.test.mjs
// Map: contact-form block keeps --oc-block-gap on a phone -> display titles break a long word (overflow-wrap + hyphens)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

test("contact form: the phone padding follows --oc-block-gap (0.5rem only as fallback)", async () => {
  const css = await read("../../blocks/src/parts/site-contact-form.css");
  assert.match(css, /@media \(max-width: 30rem\) \{\s*\.oc-block-contact-form \{ padding-inline: var\(--oc-block-gap, 0\.5rem\); \}/);
  assert.doesNotMatch(css, /\.oc-block-contact-form \{ padding-inline: 0\.5rem; \}/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

test("blocks: no section sets a fixed side padding on a phone that ignores --oc-block-gap", async () => {
  const dir = path.resolve(here, "../../blocks/src/parts");
  for (const f of await fs.readdir(dir)) {
    if (!f.endsWith(".css")) continue;
    const css = await read(path.join(dir, f));
    // the outer section rules use var(--oc-block-gap, ...) for their side room; a media override must too
    const sections = [...css.matchAll(/^(\.oc-block-[\w-]+) \{[^}]*padding: [^;]*var\(--oc-block-gap/gm)].map((m) => m[1]);
    for (const sel of sections) {
      const esc = sel.replace(/[.-]/g, "\\$&");
      const fixed = new RegExp(`@media[^{]*\\{\\s*${esc} \\{ padding-inline: (?!var\\(--oc-block-gap)`);
      assert.doesNotMatch(css, fixed, `${f}: ${sel} sets a fixed padding-inline in a media query`);
    }
  }
});

test("display titles: a long word breaks instead of running off a 390px screen", async () => {
  const css = await read("../src/showcase.css");
  assert.match(css, /:is\(\.oc-display, \.oc-display--page\) \{[^}]*overflow-wrap: break-word;[^}]*hyphens: auto;/);
  assert.match(css, /hyphenate-limit-chars: 10 4 4;/);
});
