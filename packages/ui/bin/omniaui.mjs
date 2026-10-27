#!/usr/bin/env node
// File: packages/ui/bin/omniaui.mjs
// OmniaUI CLI — copy components and blocks into your project (css | vue | react | blade), list the registry.
// Map: args -> commands (add | list | help | version) -> lib/add.mjs (lib/catalog.mjs, lib/project.mjs)
// Author: Serge Cools | Framework: OmniaUI (on OmniaCSS)
//
// These commands used to be "omniacss add/list" (moved here in October 2026). The CSS build stays in
// the omniacss CLI: "npx omniacss build" (package @birdycom/omniacss-cli).

import { parseArgs } from "node:util";
import { cmdAdd, cmdList } from "./lib/add.mjs";
import { readJson } from "./lib/project.mjs";

const HELP = `
OmniaUI CLI

  omniaui add <name...> [-f css|vue|react|blade] [--kind component|block]
                                        copy components/blocks into your project (you own the code)
  omniaui add <name...> -f vue --import  print the import line for the npm package instead
  omniaui list [blocks|components] [-f vue]  show what can be added in a flavour

Options:
  -f, --framework <fw>   css | vue | react | blade (default: "framework" in omnia.config.json, else detected
                         from package.json / composer.json, else css)
  -k, --kind <kind>      component | block (needed when a name exists as both)
      --dir <dir>        target folder (alias --to); defaults per flavour:
                         vue/react: resources/js/components/oc (Laravel) or src/components/oc,
                         css: resources/views/oc-snippets (Laravel) or oc-snippets,
                         blade: resources/views/components/oc
      --all              add every component (or block with --kind block)
      --force            overwrite existing files
      --dry-run          show what would be copied
      --import           print the import line for the npm package, copy nothing

Blocks need @birdycom/omniaui-blocks, wrappers @birdycom/omniaui-vue / -react, Blade birdycom/omniaui-laravel.
Build only the CSS you use with the OmniaCSS CLI: npx omniacss build
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      to: { type: "string" },
      dir: { type: "string" },
      framework: { type: "string", short: "f" },
      kind: { type: "string", short: "k" },
      all: { type: "boolean" },
      force: { type: "boolean" },
      "dry-run": { type: "boolean" },
      import: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  const [command, ...rest] = positionals;
  if (values.version) {
    console.log((await readJson(new URL("../package.json", import.meta.url))).version);
    return;
  }
  switch (command) {
    case "add": return cmdAdd(rest, values);
    case "list": return cmdList(rest[0], values);
    default: console.log(HELP);
  }
}

main().catch((err) => {
  console.error(`omniaui: ${err.message}`);
  process.exit(1);
});
