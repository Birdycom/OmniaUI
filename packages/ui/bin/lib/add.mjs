// File: packages/ui/bin/lib/add.mjs
// The "add" and "list" commands of the omniaui CLI: copy components/blocks into a project (you own the code).
// Map: copyFiles -> importLine -> cmdAdd -> cmdList

import fs from "node:fs/promises";
import path from "node:path";
import { catalog, closure, findEntries, INSTALL_HINT, proBlockNames } from "./catalog.mjs";
import { cwd, defaultDir, ensureContentGlob, exists, pascal, posix, readJson, requireFromProject, resolveFramework } from "./project.mjs";

/** Copied Blade files call each other as <x-oc.name>, matching the folder they land in. */
const rewriteBlade = (text) => text.replace(/(<\/?)x-oc::/g, "$1x-oc.");

async function copyFiles(root, files, targetDir, fw, flags) {
  let copied = 0;
  for (const file of files) {
    // vue/react sources live in src/; keep their folder layout below it so relative imports stay valid
    const rel = fw === "blade" ? file : file.replace(/^src\//, "");
    const target = path.resolve(cwd, targetDir, rel);
    const shown = posix(path.relative(cwd, target));
    if (!flags.force && (await exists(target))) { console.log(`  skip    ${shown} (exists, use --force)`); continue; }
    if (!flags["dry-run"]) {
      await fs.mkdir(path.dirname(target), { recursive: true });
      if (fw === "blade") await fs.writeFile(target, rewriteBlade(await fs.readFile(path.join(root, file), "utf8")));
      else await fs.copyFile(path.join(root, file), target);
    }
    console.log(`  ${flags["dry-run"] ? "would copy" : "copied   "} ${shown}`);
    copied++;
  }
  return copied;
}

/** css flavour: copy the one HTML snippet straight into the target folder (no sub-folders). */
async function copySnippet(entry, dir, flags) {
  const target = path.resolve(cwd, dir, path.basename(entry.files[0]));
  const shown = posix(path.relative(cwd, target));
  if (!flags.force && (await exists(target))) { console.log(`  skip    ${shown} (exists, use --force)`); return 0; }
  if (!flags["dry-run"]) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(path.join(entry.root, entry.files[0]), target);
  }
  console.log(`  ${flags["dry-run"] ? "would copy" : "copied   "} ${shown}`);
  return 1;
}

/** The line a user pastes to use the npm package (or Blade tag) instead of copying code. */
async function importLine(fw, root, entry) {
  if (fw === "vue") {
    const names = (await readJson(path.join(root, "manifest.json"))).items
      .filter((i) => i.kind === entry.kind && i.snippet && path.basename(i.snippet, ".html") === entry.name).map((i) => i.name);
    return `import { ${names.join(", ")} } from "@birdycom/omniaui-vue";`;
  }
  if (fw === "react") {
    const names = [];
    for (const file of entry.files) {
      for (const m of (await fs.readFile(path.join(root, file), "utf8")).matchAll(/export\s+(?:const|function|class)\s+([A-Z]\w*)/g)) names.push(m[1]);
    }
    return `import { ${[...new Set(names)].join(", ")} } from "@birdycom/omniaui-react";`;
  }
  if (fw === "blade") return `<x-oc::${entry.kind === "block" ? "block." : ""}${entry.name} />`;
  return entry.kind === "block" ? `@birdycom/omniaui-blocks/blocks/${entry.name}.html` : `@birdycom/omniaui/snippets/${entry.name}.html`;
}

export async function cmdAdd(args, flags) {
  const names = [...args];
  let kind = flags.kind;
  let legacyKind; // `omniaui add block <name>` keeps working
  if (["block", "component", "blocks", "components"].includes(names[0]) && names.length > 1) legacyKind = kind = names.shift().replace(/s$/, "");
  if (kind && !["component", "block"].includes(kind)) throw new Error(`Unknown kind "${kind}". Use component or block.`);
  if (!names.length && !flags.all) throw new Error("Usage: omniaui add <name...> [-f css|vue|react|blade] [--kind component|block] [--dir dir] [--force] [--dry-run] [--import]");

  const fw = await resolveFramework(flags);
  const cat = await catalog(fw);
  const selected = [];
  if (flags.all) selected.push(...cat.entries.filter((e) => e.kind === (kind || "component")));
  for (const input of names) {
    const hits = findEntries(cat.entries, input, kind);
    if (!hits.length && (await proBlockNames()).includes(input.replace(/^block-/, ""))) {
      throw new Error(fw === "css"
        ? `"${input}" is an OmniaUI Pro block. Install @birdycom/omniaui-pro (licensed) to add it.`
        : `"${input}" is an OmniaUI Pro block: use it from @birdycom/omniaui-pro-${fw === "blade" ? "laravel" : fw} (licensed) instead of copying.`);
    }
    if (!hits.length) throw new Error(`Unknown ${kind || "component or block"} "${input}" for ${fw}. Run "omniaui list -f ${fw}" to see the options.`);
    if (hits.length > 1) throw new Error(`"${input}" exists as component and block. Pass --kind component or --kind block.`);
    selected.push(hits[0]);
  }

  if (flags.import) {
    for (const entry of selected) console.log(await importLine(fw, cat.root, entry));
    if (fw === "vue" || fw === "react") {
      try { requireFromProject.resolve(`@birdycom/omniaui-${fw}/package.json`); } catch { console.log(`Package not installed in this project. Install it with: ${INSTALL_HINT[fw]}`); }
    }
    return;
  }

  const dir = flags.dir || flags.to || (await defaultDir(fw, legacyKind));
  console.log(`${fw} → ${dir}${flags["dry-run"] ? " (dry run)" : ""}`);
  let total = 0;
  for (const entry of selected) {
    console.log(`${entry.kind} "${entry.name}"`);
    if (fw === "css") total += await copySnippet(entry, dir, flags);
    else total += await copyFiles(cat.root, await closure(fw, cat.root, entry, cat.entries), dir, fw, flags);
  }
  if (flags["dry-run"]) { console.log(`\n${total} file(s) would be copied.`); return; }
  const hasBlock = selected.some((e) => e.kind === "block");
  const glob = { css: "**/*.html", vue: "**/*.vue", react: "**/*.tsx", blade: "**/*.blade.php" }[fw];
  await ensureContentGlob(`${posix(path.normalize(dir)).replace(/\/$/, "")}/${glob}`, hasBlock);
  const hasPro = selected.some((e) => e.pro);
  console.log(`\n${total} file(s) copied. Styles come from @birdycom/omniaui${hasBlock ? " and @birdycom/omniaui-blocks" : ""}${hasPro ? " and @birdycom/omniaui-pro" : ""} ("omniacss build" includes them).`);
  if (fw === "vue" || fw === "react") console.log(`These files need ${fw} in your project (${fw === "vue" ? "3.4+" : "18+"}).`);
}

export async function cmdList(what, flags = {}) {
  const fw = await resolveFramework(flags);
  const kinds = flags.kind ? [flags.kind] : what ? [what.replace(/s$/, "")] : ["component", "block"];
  const cat = await catalog(fw);
  console.log(`framework: ${fw}`);
  for (const kind of kinds) {
    console.log(`\n${kind}s`);
    for (const e of cat.entries.filter((x) => x.kind === kind)) {
      const label = fw === "vue" ? `Oc${kind === "block" ? "Block" : ""}${pascal(e.name)}`
        : fw === "react" ? path.basename(e.files[0], ".tsx")
        : fw === "blade" ? `<x-oc::${kind === "block" ? "block." : ""}${e.name}>` : "";
      console.log(`  ${e.name.padEnd(18)} ${label.padEnd(fw === "css" ? 0 : 30)}${e.description || ""}`.trimEnd());
    }
  }
}
