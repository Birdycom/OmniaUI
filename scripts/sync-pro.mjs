// File: scripts/sync-pro.mjs
// Fetches the current OmniaUI Pro CSS and block scripts for the live previews on this site, so they are never older
// than the Pro repo. Map: ../omniaUI-pro present? -> there: build:css (dist) + sync:site (-> vendor/omniaui-pro, public/js)
// Run: first step of "npm run build:packages". Without ../omniaUI-pro (CI, other machines) it does nothing and the
// committed copies in vendor/omniaui-pro are used.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const pro = path.resolve(process.cwd(), "../omniaUI-pro");
if (!fs.existsSync(path.join(pro, "package.json"))) {
  console.log("[sync:pro] ../omniaUI-pro not found: the committed vendor/omniaui-pro is used.");
  process.exit(0);
}
// One command string with shell: true (npm is a .cmd file on Windows; an args array next to shell: true is deprecated).
for (const script of ["build:css", "sync:site"]) {
  const r = spawnSync(`npm run ${script} --silent`, { cwd: pro, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`[sync:pro] "npm run ${script}" failed in ../omniaUI-pro.`);
    process.exit(1);
  }
}
