#!/usr/bin/env node
/* File: scripts/build-code-syntax-theme.mjs */
/* Map: read omniathememain.json -> nearest Omnia color token (OKLCH) per color -> update :root in code-block.css */
/*
 * Reads scripts/data/omniathememain.json (Birdycom Omnia Dark), maps tokenColors and
 * editor colors to --oc-syntax-* variables, and updates the :root block in
 * packages/ui/src/code-block.css in place. Every theme color becomes the nearest
 * Omnia palette token (OKLCH), e.g. #98C379 -> var(--color-green-2) — never a hex value.
 * Run: npm run code-syntax-theme
 * See docs/code-syntax-theme.html for per-language mapping.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nearestOmnia } from './lib/omnia-color.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const themePath = path.join(rootDir, 'scripts/data/omniathememain.json');
const cssPath = path.join(rootDir, 'packages/ui/src/code-block.css');

/**
 * Find tokenColor where name includes the search string (case-insensitive).
 * If multiple match, returns the last one (later entries are often more specific, e.g. [VSCODE-CUSTOM]).
 * Returns settings.foreground or null.
 */
function findForegroundByTokenName(tokenColors, ...nameSubstrings) {
  let found = null;
  for (const entry of tokenColors) {
    const name = (entry.name || '').toLowerCase();
    if (nameSubstrings.some(s => name.includes(s.toLowerCase()))) {
      found = entry.settings?.foreground ?? null;
    }
  }
  return found;
}

/**
 * Find first tokenColor where scope (string or array) contains the given scope substring.
 */
function findForegroundByScope(tokenColors, scopeSubstring) {
  const lower = scopeSubstring.toLowerCase();
  for (const entry of tokenColors) {
    const scopes = Array.isArray(entry.scope) ? entry.scope : (entry.scope ? [entry.scope] : []);
    if (scopes.some(s => String(s).toLowerCase().includes(lower))) {
      return entry.settings?.foreground ?? null;
    }
  }
  return null;
}

const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
const { colors = {}, tokenColors = [] } = theme;

const vars = {
  '--oc-syntax-bg': colors['editor.background'] ?? '#1F1F1F',
  '--oc-syntax-bg-preview': '#0a0f1e',
  '--oc-syntax-fg': colors['editor.foreground'] ?? '#ABB2BF',
  '--oc-syntax-comment': findForegroundByTokenName(tokenColors, 'Comment') ?? '#97A2B6',
  '--oc-syntax-string': findForegroundByTokenName(tokenColors, 'HTML String') ?? findForegroundByTokenName(tokenColors, 'Tag Value') ?? '#98C379',
  '--oc-syntax-keyword': findForegroundByTokenName(tokenColors, 'Keyword') ?? '#C678DD',
  '--oc-syntax-variable': findForegroundByTokenName(tokenColors, 'Variable') ?? '#E06C75',
  '--oc-syntax-function': findForegroundByTokenName(tokenColors, 'Entity Name Function', 'Support Function') ?? '#61AFEF',
  '--oc-syntax-number': findForegroundByTokenName(tokenColors, 'Constant Numeric', 'Constant ') ?? '#D19A66',
  '--oc-syntax-operator': findForegroundByTokenName(tokenColors, 'Keyword Operator') ?? '#56B6C2',
  '--oc-syntax-constant': findForegroundByScope(tokenColors, 'constant.language') ?? findForegroundByTokenName(tokenColors, 'Constant') ?? '#56B6C2',
  '--oc-syntax-storage': findForegroundByTokenName(tokenColors, 'Storage') ?? '#C678DD',
  '--oc-syntax-tag': findForegroundByTokenName(tokenColors, 'HTML Entity Name Tag') ?? '#E06C75',
  '--oc-syntax-attr': findForegroundByTokenName(tokenColors, 'Entity Other Attribute Name') ?? '#51A0C7',
  '--oc-syntax-prop': findForegroundByTokenName(tokenColors, '[VSCODE-CUSTOM] Css Property Name') ?? findForegroundByTokenName(tokenColors, 'meta.property-name.css') ?? '#98C379',
  '--oc-syntax-value': findForegroundByTokenName(tokenColors, '[VSCODE-CUSTOM] Css Property Value') ?? '#56B6C2',
  '--oc-syntax-cls': findForegroundByTokenName(tokenColors, 'Css Entity Other Attribute Name Class') ?? '#D7BA7D',
  '--oc-syntax-id': findForegroundByTokenName(tokenColors, 'Entity Other Attribute Name Id', 'Css Entity Other Attribute Name Id') ?? '#61AFEF',
  '--oc-syntax-unit': findForegroundByTokenName(tokenColors, 'Css Keyword Other Unit', 'Keyword Other Unit') ?? '#D19A66',
  '--oc-syntax-key': findForegroundByTokenName(tokenColors, 'JSON Property Name', 'support.type.property-name.json') ?? '#E06C75',
};

const cssVars = Object.entries(vars)
  .map(([key, value]) => {
    const { token, oklch } = nearestOmnia(value, rootDir);
    return `  ${key}: var(${token}); /* ${oklch} */`;
  })
  .join('\n');
const newRootBlock = ':root {\n' + cssVars +
  '\n\n  /* oc-code-block: line numbers and tab size (match editor: 2 spaces) */' +
  '\n  --oc-code-block-tab-size: 2;' +
  '\n  --oc-code-block-line-number-color: oklch(from var(--color-white-2) l c h / 0.25);\n}';

let css = fs.readFileSync(cssPath, 'utf8');
/* Match :root { ... } where closing brace is at start of line */
const rootRegex = /:root\s*\{[\s\S]*?^\}/m;
// Test for the block first: an unchanged result just means the theme is already up to date.
if (!rootRegex.test(css)) {
  console.error('Could not find :root { ... } in', cssPath);
  process.exit(1);
}
css = css.replace(rootRegex, newRootBlock);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated :root in', cssPath);
