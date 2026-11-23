// File: packages/ui/test/v0171-dark-class.test.mjs
// Map: the class .dark / .light (Tailwind / shadcn apps) themes like data-theme (color-scheme, so every light-dark()
//      token follows) -> the theme tokens put it in front too (oc-theme.css) -> --oc-info is a real token and the info
//      badge / alert / toast use it -> theme images and scopes know the class -> no rule resets color-scheme on .dark

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");
const theme = async () => (await fs.readFile(path.resolve(here, "../../../vendor/omniacss/dist/oc-theme.css"), "utf8")).replace(/\r\n/g, "\n");
const INFO_FALLBACK = "var(--oc-info, light-dark(var(--color-deepskyblue-70), var(--color-skyblue-50)))";

test(".dark and .light set color-scheme next to data-theme, so light-dark() follows the class", async () => {
  const css = await read("components.css");
  assert.match(css, /\[data-theme="light"\],\n\.light \{ color-scheme: light; \}/);
  assert.match(css, /\[data-theme="dark"\],\n\.dark,\n\.oc-theme-docs \{ color-scheme: dark; \}/);
  // a scope with its own class takes the text color of that theme, like a scope with data-theme
  assert.match(css, /\.oc-theme-scope:is\(\[data-theme="light"\], \[data-theme="dark"\], \.light, \.dark, :has\(/);
});

test("the theme tokens (oc-theme.css from OmniaCSS) also theme .dark / .light, for apps without the components", async () => {
  const css = await theme();
  assert.match(css, /:root \{\n  color-scheme: light dark;/);
  assert.match(css, /\[data-theme="light"\], \.light \{ color-scheme: light; \}/);
  assert.match(css, /\[data-theme="dark"\], \.dark \{ color-scheme: dark; \}/);
});

test("--oc-info is a theme token next to success / warning / destructive, with a foreground", async () => {
  const css = await theme();
  for (const t of ["success", "warning", "destructive", "info"]) {
    assert.match(css, new RegExp(`--oc-${t}: `), t);
    assert.match(css, new RegExp(`--oc-${t}-foreground: `), `${t}-foreground`);
  }
  assert.match(css, /--oc-info: light-dark\(var\(--color-deepskyblue-70\), var\(--color-skyblue-50\)\);/);
});

test("info badge, alert and toast use --oc-info (with the same fallback as the other info tones)", async () => {
  const css = await read("components.css");
  const badge = css.slice(css.indexOf(".oc-badge--info {"), css.indexOf("}", css.indexOf(".oc-badge--info {")));
  assert.ok(badge.includes(`--oc-badge-info: ${INFO_FALLBACK};`));
  // darker text in light mode (4.5:1 on its tint), the tone itself in dark mode
  assert.match(badge, /color: light-dark\(oklch\(from var\(--oc-badge-info\) min\(l, 0\.42\) c h\), var\(--oc-badge-info\)\);/);
  assert.doesNotMatch(badge, /--oc-primary/);
  const alert = css.slice(css.indexOf(".oc-alert--info {"), css.indexOf("}", css.indexOf(".oc-alert--info {")));
  assert.ok(alert.includes(`--oc-alert-tone: ${INFO_FALLBACK};`));
  assert.ok(css.includes(`.oc-toast--info { --oc-toast-color: ${INFO_FALLBACK}; }`));
  assert.match(css, /\.oc-toast--info \.oc-toast-icon \{ color: light-dark\(oklch\(from var\(--oc-toast-color\) min\(l, 0\.45\) c h\)/);
});

test("theme images follow the class .light / .dark too, also inside a scope", async () => {
  const css = await read("parts/app-0160-apps.css");
  assert.match(css, /:is\(\[data-theme="light"\], \.light, :root:has\(/);
  assert.match(css, /:is\(\[data-theme="dark"\], \.dark, :root:has\(/);
  assert.match(css, /\.oc-theme-scope\.oc-theme-scope:is\(\[data-theme="light"\], \.light, :has\(/);
  assert.match(css, /\.oc-theme-scope\.oc-theme-scope:is\(\[data-theme="dark"\], \.dark, :has\(/);
});

test("no component resets color-scheme on .dark / data-theme (that would make light-dark() pick light)", async () => {
  const files = ["components.css", "components-extra.css", "showcase.css", "docs-ui.css",
    ...(await fs.readdir(path.resolve(here, "../src/parts"))).filter((f) => f.endsWith(".css")).map((f) => `parts/${f}`)];
  for (const f of files) {
    const css = (await read(f)).replace(/\/\*[\s\S]*?\*\//g, "");
    // a rule whose selector list names .dark or data-theme="dark" and sets color-scheme to normal or light
    assert.doesNotMatch(css, /(\.dark\b|\[data-theme="dark"\])[^{};]*\{[^}]*color-scheme: (normal|light)/, f);
  }
});
