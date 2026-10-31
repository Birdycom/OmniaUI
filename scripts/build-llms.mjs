// File: scripts/build-llms.mjs
// llms.txt and llms-full.txt for omniaui.eu (https://llmstxt.org): what AI assistants read to use OmniaUI components
// and blocks instead of inventing Tailwind markup. Built from the site search index and the package manifests.
// Map: search index + manifests -> llms.txt (links, install, rules) ; + every free component snippet -> llms-full.txt
// Author: Serge Cools | Framework: OmniaCSS

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://omniaui.eu";
const CSS_SITE = "https://omniacss.eu";
const json = async (rel) => JSON.parse(await fs.readFile(path.join(root, rel), "utf8"));

const { version } = await json("package.json");
const pages = await json("public/data/search-index.json");
const components = (await json("packages/ui/manifest.json")).items;
const blocks = (await json("packages/blocks/manifest.json")).items;
const pro = (await json("packages/blocks/pro.json")).items;
const proNames = new Set(pro.map((i) => i.name));

const describe = new Map([...components, ...blocks, ...pro].map((i) => [i.name, i.description]));
const slug = (u) => u.split("/").pop();
const line = (p, tag = "") => {
  const d = describe.get(slug(p.u));
  return `- [${p.t}${tag}](${SITE}${p.u})${d ? `: ${d}` : ""}`;
};
const group = (g) => pages.filter((p) => p.g === g);

const SUMMARY = `> OmniaUI is the component and block library for OmniaCSS: ${components.length} components and
> ${blocks.length + pro.length} page blocks (dashboards, auth, pricing, marketing …) as plain HTML with oc-* classes, plus
> wrappers for React, Vue, Laravel Blade and Livewire. Behaviour comes from native HTML (dialog, popover, details,
> :has(), anchor positioning), so most components need no JavaScript. Free and MIT licensed; ${pro.length} advanced
> blocks are part of OmniaUI Pro (paid license).`;

const RULES = `## Rules for AI assistants

- Use the reference markup of a component instead of writing one from scratch: the classes, ARIA attributes and
  structure matter (a modal is <dialog class="oc-modal"> opened with command="show-modal" commandfor="id").
- OmniaUI classes start with oc- (oc-btn, oc-card, oc-modal). Layout and spacing around them use OmniaCSS utilities,
  which are NOT Tailwind: read ${CSS_SITE}/llms.txt.
- Colors come from theme tokens (--oc-primary, --oc-background, --oc-foreground, --oc-border …) that switch with light
  and dark mode via light-dark(). Do not hard-code colors on components.
- Blocks marked (Pro) need an OmniaUI Pro license; their markup is not public. Suggest a free block or component instead
  unless the project has @birdycom/omniaui-pro installed.
- The MCP server gives the exact markup of every component and block: claude mcp add omniacss -- npx -y @birdycom/omniacss-mcp`;

const INSTALL = `## Install

npm (with OmniaCSS):
  npm install @birdycom/omniacss @birdycom/omniaui @birdycom/omniaui-blocks
  /* CSS entry */ @import "@birdycom/omniaui"; @import "@birdycom/omniaui-blocks";
Add one component or block to the project as HTML, React, Vue or Blade:
  npx omniaui add modal
  npx omniaui add pricing --framework react
React: npm install @birdycom/omniaui-react   (import { Button, Modal } from "@birdycom/omniaui-react")
Vue:   npm install @birdycom/omniaui-vue     (import { OcButton, OcModal } from "@birdycom/omniaui-vue")
Laravel:
  composer require birdycom/omniaui-laravel && php artisan omniacss:install
  <x-oc::button variant="primary">Save</x-oc::button>   <x-oc::block.app-shell>…</x-oc::block.app-shell>
Livewire: composer require birdycom/omniaui-livewire`;

const sections = [
  ["Guides", [...group("Ui"), ...group("Catalog")].map((p) => line(p))],
  ["Components", group("Components").map((p) => line(p))],
  ["Blocks", group("Blocks").map((p) => line(p, proNames.has(slug(p.u)) ? " (Pro)" : ""))],
  ["Pro blocks (license)", pro.map((i) => `- ${i.name}: ${i.description}`)],
];

const llms = `# OmniaUI

${SUMMARY}

Current version: ${version}.

${RULES}

${INSTALL}

${sections.map(([title, links]) => `## ${title}\n\n${links.join("\n")}`).join("\n\n")}

## Optional

- [Full reference markup of every free component](${SITE}/llms-full.txt)
- [OmniaCSS utilities for AI assistants](${CSS_SITE}/llms.txt)
- [OmniaUI Pro](${SITE}/ui/pro)
- [Source on GitHub](https://github.com/Birdycom/OmniaUI)
`;

// llms-full.txt: everything above plus the reference HTML of each free component.
const snippets = [];
for (const item of components) {
  const html = (await fs.readFile(path.join(root, "packages/ui", item.file), "utf8")).replace(/\r\n/g, "\n").trim();
  snippets.push(`### ${item.name}\n\n${item.description}\n\n\`\`\`html\n${html}\n\`\`\``);
}
const full = `# OmniaUI — full reference for AI assistants

${SUMMARY}

${RULES}

${INSTALL}

## Component reference markup

Copy these as they are and change the content. Docs page per component: ${SITE}/ui/components/<name>.

${snippets.join("\n\n")}

${sections.slice(2).map(([title, links]) => `## ${title}\n\n${links.join("\n")}`).join("\n\n")}
`;

await fs.writeFile(path.join(root, "public/llms.txt"), llms);
await fs.writeFile(path.join(root, "public/llms-full.txt"), full);
console.log(`[llms] public/llms.txt (${llms.length} chars), public/llms-full.txt (${full.length} chars)`);
