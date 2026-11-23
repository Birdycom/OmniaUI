#!/usr/bin/env node
/**
 * qa-site.mjs — QA-harness voor de docs-sites (ALLEEN lokaal: https://omniaui.test en https://omniacss.test).
 *
 * Controleert elke pagina uit de lokale sitemap (public/sitemap.xml, redirect-stubs met meta refresh overgeslagen)
 * in licht en donker (localStorage "oc-theme" + data-theme op <html>, net als ContentPage.astro) op 1280/768/390:
 *   1. console-fouten, pageerror, mislukte requests (>= 400 / requestfailed)
 *   2. horizontale scroll (+ veroorzakend element)              — 1280, 768, 390
 *   3. demo's (.oc-demo): krimp, gelijke hoogte, codetabs, overflow uit het demovak, screenshots
 *   4. links/assets/anchors (gededupliceerd, alleen *.test-hosts)
 *   5. toegankelijkheid basis (alt, toegankelijke naam, dubbele id's, h1, lege koppen)
 *   6. contrast (axe-core color-contrast als gevonden, anders eigen check op demotekst)
 *   7. tekstkwaliteit (TODO, lorem, undefined, NaN, null, [object, {{ }}, echte/bronapp-namen) buiten codevakken
 *
 * Gebruik:
 *   node scripts/qa/qa-site.mjs [--site omniaui|omniacss] [--pages a,b] [--out <map>] [--concurrency 4] [--no-shots]
 *                               [--sheets] [--diff <vorige-uitvoermap>]
 *   --pages: deel van het pad (bv. "components/card,docs/ai"); exacte padmatch wint.
 *   --out:   uitvoermap (standaard: %TEMP%/omnia-qa). Schrijft report.json, report.md, batches.json, shots/<site>/…
 *            Opnieuw draaien overschrijft (bij een volledige run worden shots/<site> eerst geleegd).
 *   --sheets: per pagina een contactblad (licht naast donker per demo) in sheets/<site>/<pagina>__sheet-N.png
 *            + batches-sheets.json, zodat reviewers sneller kijken.
 *   --diff:  vergelijkt de screenshots met die van een vorige uitvoermap (bytes, bij verschil pixels) en neemt in
 *            batches.json / contactbladen alleen pagina's op waarvan een screenshot veranderd, nieuw of weg is.
 *
 * Screenshots: tijdens het fotograferen laat het script het document zelf scrollen (de docs-shell scrolt anders in
 * een binnenste <main> met body overflow:hidden, waardoor hoge demo's en fullPage maar één viewport tonen), verbergt
 * het de vaste header/footer/zijbalken van de shell en de lokale Herd-balk. Demo's: element-screenshot van elk
 * .oc-demo__preview @1280. Mobiel: volledige pagina @390 in licht en donker (header bovenaan, footer onderaan).
 * Daarna wordt alles teruggezet, zodat de overige controles de echte pagina zien.
 * Omgeving: PLAYWRIGHT_PATH (standaard de Playwright van D:/webdev/questpost), AXE_PATH (anders gezocht in D:/webdev/*).
 *
 * NOOIT op .eu/.be/.com draaien: het script weigert elke host die niet op .test eindigt.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

// ---------- argumenten ----------
const argv = process.argv.slice(2);
const arg = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def; };
const flag = (name) => argv.includes(`--${name}`);
const SITES = {
  omniaui: { base: "https://omniaui.test", pub: "D:/webdev/omniaUI/public" },
  omniacss: { base: "https://omniacss.test", pub: "D:/webdev/omniacss/public" },
};
const siteArg = arg("site", "");
const siteKeys = siteArg ? siteArg.split(",") : Object.keys(SITES);
for (const k of siteKeys) if (!SITES[k]) { console.error(`Onbekende site: ${k}`); process.exit(1); }
const pageFilter = (arg("pages", "") || "").split(",").map((s) => s.trim().replace(/^\/|\.html$/g, "")).filter(Boolean);
const OUT = path.resolve(arg("out", path.join(os.tmpdir(), "omnia-qa")));
const CONC = Math.max(1, Math.min(4, Number(arg("concurrency", 4))));
const SHOTS = !flag("no-shots");
const SHEETS = SHOTS && flag("sheets");
const DIFF = arg("diff", "") ? path.resolve(arg("diff", "")) : "";
if (DIFF && !fs.existsSync(path.join(DIFF, "shots"))) { console.error(`--diff: geen shots/ in ${DIFF}`); process.exit(1); }
if (DIFF && DIFF === OUT) { console.error("--diff mag niet naar de uitvoermap zelf wijzen (die wordt overschreven); kies een andere --out."); process.exit(1); }
const THEMES = ["light", "dark"];
const MAX_PER_KIND = 25; // max bevindingen van één soort per pagina/thema/viewport (rest wordt samengevat)

const PW = process.env.PLAYWRIGHT_PATH || "D:/webdev/questpost/node_modules/playwright/index.mjs";
const { chromium, request: pwRequest } = await import(pathToFileURL(PW).href);

function findAxe() {
  if (process.env.AXE_PATH && fs.existsSync(process.env.AXE_PATH)) return process.env.AXE_PATH;
  for (const d of fs.readdirSync("D:/webdev")) {
    const p = path.join("D:/webdev", d, "node_modules/axe-core/axe.min.js");
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return null;
}
const AXE = findAxe();

const isLocal = (u) => { try { return new URL(u).hostname.endsWith(".test"); } catch { return false; } };

// ---------- paginalijst ----------
function pagesFor(key) {
  const { base, pub } = SITES[key];
  const xml = fs.readFileSync(path.join(pub, "sitemap.xml"), "utf8");
  let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  urls = urls.map((u) => { const x = new URL(u); return base + x.pathname; }); // altijd lokale host
  urls = urls.filter((u) => {
    const p = new URL(u).pathname.replace(/^\/|\/$/g, "") || "index";
    const file = path.join(pub, p + ".html");
    const idx = path.join(pub, p, "index.html");
    const f = fs.existsSync(file) ? file : fs.existsSync(idx) ? idx : null;
    if (f && /http-equiv=["']refresh["']/i.test(fs.readFileSync(f, "utf8"))) return false;
    return true;
  });
  if (pageFilter.length) {
    urls = urls.filter((u) => {
      const p = new URL(u).pathname.replace(/^\/|\/$/g, "") || "index";
      return pageFilter.some((f) => p === f || p.includes(f));
    });
  }
  return [...new Set(urls)];
}
const slug = (u) => (new URL(u).pathname.replace(/^\/|\/$/g, "") || "index").replace(/[\/\\]/g, "_");

// ---------- browserzijde ----------
/* eslint-disable */
function inPage({ mode, theme, vw }) {
  const sel = (el) => {
    if (!el || el.nodeType !== 1) return "";
    const parts = [];
    let e = el;
    for (let i = 0; e && e.nodeType === 1 && i < 5; i++) {
      let s = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(`${s}#${CSS.escape(e.id)}`); break; }
      if (e.classList.contains("oc-demo__preview") && e !== el) { parts.unshift(".oc-demo__preview"); break; }
      const cls = [...e.classList].filter((c) => !/^(oc-theme-scope)$/.test(c)).slice(0, 3);
      if (cls.length) s += "." + cls.map((c) => CSS.escape(c)).join(".");
      const p = e.parentElement;
      if (p) { const sib = [...p.children].filter((c) => c.tagName === e.tagName); if (sib.length > 1) s += `:nth-of-type(${sib.indexOf(e) + 1})`; }
      parts.unshift(s);
      e = p;
    }
    return parts.join(" > ");
  };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return false; return el.checkVisibility ? el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }) : true; };
  const cs = (el) => getComputedStyle(el);
  const clipsX = (el) => { const o = cs(el); return o.overflowX !== "visible"; };
  const clipsY = (el) => { const o = cs(el); return o.overflowY !== "visible"; };
  const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c === "transparent" ? 0 : 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  // Een .oc-demo genest in een andere .oc-demo (bv. een demo-panel in een demo) hoort bij de buitenste: niet apart tellen.
  const topLevel = (el) => !el.closest(".oc-demo")?.parentElement?.closest(".oc-demo");
  const demos = [...document.querySelectorAll(".oc-demo")].filter((d) => !d.parentElement?.closest(".oc-demo"));
  const demoTitle = (d, i) => (d.querySelector(".oc-demo__title")?.textContent || "").trim() || `demo ${i + 1}`;

  if (mode === "hscroll") {
    const de = document.documentElement;
    let W = innerWidth, sw = de.scrollWidth, where = "document";
    if (sw <= W + 1) {
      // de docs-shell scrolt in een binnenste <main> (body overflow:hidden): ook die paginascroller controleren
      const sc = [...document.body.querySelectorAll("main, [class*=content]")].find((e) => !e.closest(".oc-demo") && /auto|scroll/.test(cs(e).overflowX) && e.clientWidth >= innerWidth * 0.5 && e.scrollWidth > e.clientWidth + 1);
      if (!sc) return null;
      W = Math.round(sc.getBoundingClientRect().left + sc.clientLeft + sc.clientWidth); sw = Math.round(sc.getBoundingClientRect().left + sc.scrollWidth); where = sel(sc);
    }
    const bad = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right <= W + 1 || (r.width === 0 && r.height === 0)) continue;
      if (cs(el).position === "fixed") continue;
      // overflow-oorsprong: ouder valt zelf binnen de viewport en geen clippende voorouder
      let a = el.parentElement, clipped = false;
      while (a && a !== document.body) { if (clipsX(a)) { const ar = a.getBoundingClientRect(); if (ar.right <= W + 1) { clipped = true; break; } } a = a.parentElement; }
      if (clipped) continue;
      const pr = el.parentElement?.getBoundingClientRect();
      if (pr && pr.right > W + 1 && el.parentElement !== document.body) continue;
      bad.push({ selector: sel(el), right: Math.round(r.right), width: Math.round(r.width) });
    }
    bad.sort((a, b) => b.right - a.right);
    return { scrollWidth: sw, innerWidth: W, where, culprits: bad.slice(0, 5) };
  }

  if (mode === "demos") {
    const out = [];
    demos.forEach((d, i) => {
      const prev = d.querySelector(".oc-demo__preview");
      const title = demoTitle(d, i);
      if (!prev || !vis(prev)) return;
      const add = (category, message, selector, value) => out.push({ demo: i, demoTitle: title, category, message, selector, value });
      const pr = prev.getBoundingClientRect(), pcs = cs(prev);
      const inner = prev.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
      // a. KRIMP
      if (vw >= 1000) for (const c of prev.children) {
        const s = cs(c);
        const isGrid = /grid/.test(s.display), isFlexRow = /flex/.test(s.display) && !/column/.test(s.flexDirection);
        if (!isGrid && !isFlexRow) continue;
        const kids = [...c.children].filter(vis);
        if (kids.length < 3) continue;
        // a width set on purpose in the demo (style="inline-size: min(100%, 24rem)", max-inline-size) is not a shrink
        if (/(^|;|\s)(max-)?(inline-size|width)\s*:/i.test(c.getAttribute("style") || "")) continue;
        const w = c.getBoundingClientRect().width;
        const xs = kids.map((k) => Math.round(k.getBoundingClientRect().left));
        if (w < inner * 0.7 && xs.every((x) => Math.abs(x - xs[0]) <= 1))
          add("demo-shrink", `${isGrid ? "grid" : "flex"} met ${kids.length} kinderen staat gestapeld en is ${Math.round(w)}px breed (< 70% van ${Math.round(inner)}px)`, sel(c), { width: Math.round(w), inner: Math.round(inner), display: s.display, gridTemplateColumns: s.gridTemplateColumns });
      }
      // b. GELIJKE HOOGTE
      if (vw >= 1000) for (const g of prev.querySelectorAll("*")) {
        const s = cs(g);
        const isGrid = /grid/.test(s.display);
        const isWrapRow = /flex/.test(s.display) && !/column/.test(s.flexDirection) && /wrap/.test(s.flexWrap) && s.flexWrap !== "nowrap";
        if (!isGrid && !isWrapRow) continue;
        // the bars of a chart differ in height on purpose: marks, not cards
        if (g.matches('[class*="oc-chart"], [class*="oc-chart"] *')) continue;
        const kids = [...g.children].filter((k) => vis(k) && !/absolute|fixed/.test(cs(k).position));
        if (kids.length < 2) continue;
        const cardLike = (k) => {
          const ks = cs(k);
          if (/^(BUTTON|INPUT|SELECT|TEXTAREA|LABEL|IMG|SVG|A|SPAN|HR|PICTURE|VIDEO|CANVAS)$/i.test(k.tagName)) return false;
          if (/^inline|contents/.test(ks.display)) return false;
          if (/\boc-(btn|badge|chip|avatar|input|kbd|tag|skeleton|separator)\b/.test(k.className)) return false;
          if (k.getBoundingClientRect().height < 40) return false;
          if (/\boc-card\b|\boc-[\w-]+-card\b/.test(k.className)) return true;
          const bw = parseFloat(ks.borderTopWidth) >= 1 && parseFloat(ks.borderLeftWidth) >= 1 && alpha(ks.borderTopColor) > 0;
          const bg = alpha(ks.backgroundColor) > 0 && ks.backgroundColor !== cs(g).backgroundColor;
          return bw || bg;
        };
        if (!kids.every(cardLike)) continue;
        // één kolom (alles op dezelfde x) = interne opbouw of lijst, geen kaartraster
        if (new Set(kids.map((k) => Math.round(k.getBoundingClientRect().left))).size < 2) continue;
        // bewuste spans (row-span/col-span, grid-areas) en ongelijke breedtes zijn layout, geen kaartraster
        const spans = (k) => { const ks = cs(k); return /span|\//.test(ks.gridRowEnd + " " + ks.gridColumnEnd) || !/^auto$/.test(ks.gridRowStart) || /[a-z]/i.test(ks.gridArea.replace(/auto/g, "")); };
        const plain = kids.filter((k) => !spans(k));
        const byW = {};
        for (const k of plain) { const w = Math.round(k.getBoundingClientRect().width / 4) * 4; (byW[w] ||= []).push(k); }
        for (const grp of Object.values(byW)) {
          if (grp.length < 2) continue;
          const hs = grp.map((k) => k.getBoundingClientRect().height);
          const max = Math.max(...hs), min = Math.min(...hs);
          if (max - min <= 2) continue;
          const rows = new Set(grp.map((k) => Math.round(k.getBoundingClientRect().top))).size;
          add("demo-height", `${grp.length} even brede kaarten in ${isGrid ? "grid" : "flex-wrap"} verschillen ${Math.round(max - min)}px in hoogte (${rows} rij${rows > 1 ? "en" : ""})`, sel(g), { heights: hs.map(Math.round), rows, width: Math.round(grp[0].getBoundingClientRect().width) });
        }
      }
      // d. OVERFLOW uit het demovak / afgekapt
      const prevClips = clipsX(prev) || clipsY(prev);
      const prevScrolls = /auto|scroll/.test(pcs.overflowX + pcs.overflowY);
      const flagged = new Set();
      for (const el of prev.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width <= 1 && r.height <= 1) continue;
        if (!vis(el)) continue;
        const s = cs(el);
        if (s.position === "fixed") continue;
        const out_ = r.right > pr.right + 1 || r.left < pr.left - 1 || r.bottom > pr.bottom + 1 || r.top < pr.top - 1;
        if (!out_) continue;
        if (el.closest("[popover],dialog,.oc-tooltip__content,[role=tooltip],[role=menu],[role=listbox]") && s.position === "absolute") continue;
        let a = el.parentElement, skip = false;
        while (a && a !== prev) {
          if (flagged.has(a)) { skip = true; break; }
          const as = cs(a);
          if (as.overflowX !== "visible" || as.overflowY !== "visible") { skip = true; break; } // bewust clip/scroll-vak
          a = a.parentElement;
        }
        if (skip) continue;
        flagged.add(el);
        if (prevScrolls) continue; // bewust scrollend demovak
        add("demo-overflow", prevClips ? "element wordt afgekapt door het demovak" : "element steekt buiten het demovak", sel(el),
          { el: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], preview: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)] });
      }
    });
    return { count: demos.length, findings: out };
  }

  if (mode === "codetabs") {
    const out = [];
    demos.forEach((d, i) => {
      const title = demoTitle(d, i);
      const radios = [...d.querySelectorAll(".oc-demo__tablist input[type=radio]")].filter((r) => r.closest(".oc-demo") === d);
      const prevRadio = radios.find((r) => r.value === "preview");
      for (const r of radios) {
        if (!/^code-/.test(r.value)) continue;
        const n = r.value.slice(5);
        const label = (r.closest("label")?.textContent || r.value).trim();
        r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true }));
        const pane = d.querySelector(`.oc-demo__code[data-code="${n}"]`);
        const add = (message, value) => out.push({ demo: i, demoTitle: title, category: "codetab", message: `${label}: ${message}`, selector: pane ? sel(pane) : sel(d), value });
        if (!pane) { add("codevak ontbreekt"); continue; }
        const rr = pane.getBoundingClientRect();
        if (!vis(pane) || rr.height < 10) { add("codevak niet zichtbaar na klikken", { height: Math.round(rr.height) }); continue; }
        if (!pane.querySelector("pre") && /OmniaUI Pro/.test(pane.textContent)) continue; // Pro-slot: code bewust afgeschermd
        const code = pane.querySelector("pre.code-preview code, pre code, pre:not(.oc-code-block__gutter)");
        const txt = (code?.textContent || "").trim();
        const lang = pane.querySelector("[data-lang]")?.getAttribute("data-lang") || "";
        if (!txt) { add("codevak is leeg", { lang }); continue; }
        if (/^(tsx|vue|blade|livewire|html)$/.test(lang) && !pane.querySelector('span[class^="hl-"],span[class*=" hl-"]')) add("geen gekleurde tokens (span.hl-*)", { lang });
        // &amp; / &lt; in HTML-broncode is vaak terecht (code-in-code); echt dubbel = &amp;lt; of een vak dat met &lt; begint
        if (/&amp;(lt|gt|amp|quot|#\d+);/.test(txt) || /^&lt;/.test(txt)) add("dubbel ge-escaped (&amp;lt; of &lt;tag zichtbaar)", { lang, sample: txt.match(/.{0,30}&(amp;)?(lt|gt|amp|quot);.{0,30}/)?.[0] });
        if (/\[object Object\]/.test(txt)) add("bevat [object Object]", { lang });
        if (!/^(tsx|vue|js|ts)$/.test(lang) && /\bundefined\b/.test(txt)) add("bevat 'undefined'", { lang, sample: txt.match(/.{0,40}\bundefined\b.{0,20}/)?.[0] });
      }
      if (prevRadio) { prevRadio.checked = true; prevRadio.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    return out;
  }

  if (mode === "a11y") {
    const out = [];
    const add = (category, message, el, value) => out.push({ category, message, selector: sel(el), value });
    for (const img of document.querySelectorAll("img")) if (!img.hasAttribute("alt")) add("a11y-img-alt", "img zonder alt-attribuut", img, img.getAttribute("src"));
    const accName = (el) => {
      if ((el.getAttribute("aria-label") || "").trim()) return true;
      const lb = el.getAttribute("aria-labelledby");
      if (lb && lb.split(/\s+/).some((id) => (document.getElementById(id)?.textContent || "").trim())) return true;
      if ((el.getAttribute("title") || "").trim()) return true;
      if ((el.textContent || "").trim()) return true;
      if ([...el.querySelectorAll("img[alt]")].some((i) => i.alt.trim())) return true;
      if ([...el.querySelectorAll("svg title, svg[aria-label]")].some((t) => (t.textContent || t.getAttribute("aria-label") || "").trim())) return true;
      if (el.tagName === "INPUT" && (el.value || "").trim()) return true;
      if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent.trim()) return true;
      return false;
    };
    for (const el of document.querySelectorAll("button, a[href], [role=button], input[type=button], input[type=submit]")) {
      if (el.closest("[aria-hidden=true]")) continue;
      if (!accName(el)) add("a11y-name", `${el.tagName.toLowerCase()} zonder toegankelijke naam`, el, el.getAttribute("href") || el.outerHTML.slice(0, 120));
    }
    const ids = {};
    for (const el of document.querySelectorAll("[id]")) (ids[el.id] ||= []).push(el);
    for (const [id, els] of Object.entries(ids)) if (els.length > 1) add("a11y-dup-id", `id "${id}" komt ${els.length}x voor`, els[1], id);
    const h1 = [...document.querySelectorAll("h1")].filter((h) => !h.closest(".oc-demo"));
    const h1demo = document.querySelectorAll(".oc-demo h1").length;
    if (h1.length !== 1) add("a11y-h1", `${h1.length} h1 op de pagina (buiten demo's)`, h1[1] || document.body, h1.map((h) => h.textContent.trim().slice(0, 60)));
    if (h1demo) add("a11y-h1", `${h1demo} h1 binnen demo's (pagina heeft dan > 1 h1)`, document.querySelector(".oc-demo h1"), h1demo);
    for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) if (!(h.textContent || "").trim() && !h.getAttribute("aria-label")) add("a11y-empty-heading", `lege ${h.tagName.toLowerCase()}`, h, h.outerHTML.slice(0, 120));
    return out;
  }

  if (mode === "text") {
    const out = [];
    const bad = [
      // undefined/NaN/null only as a leaked value: the whole text, or glued to a unit/number ("undefinedpx", "NaN%").
      // In prose ("leaves the behavior undefined", "number | null") they are words, not bugs.
      [/\bTODO\b/, "text", "TODO"], [/\blorem\b/i, "text", "lorem"], [/^\s*(undefined|NaN|null)\s*$|\b(undefined|NaN|null)(px|rem|em|%|ms|s)\b|\d(undefined|NaN)\b/, "text", "undefined/NaN/null"],
      [/\[object/, "text", "[object"], [/\{\{|\}\}/, "text", "{{ }}"],
      [/\b(OmniaDesk|Korrekt|MySubStream|QuestPost|Verdavita|Acme|Northwind)\b/i, "names", "naam"],
    ];
    const skip = "pre, code, kbd, samp, script, style, noscript, template, .oc-demo__code, .oc-code-block, textarea";
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue; if (!t || !t.trim()) continue;
      const p = n.parentElement; if (!p || p.closest(skip)) continue;
      for (const [re, cat, label] of bad) {
        const m = t.match(re); if (!m) continue;
        if (!vis(p)) continue;
        const key = cat + label + t.trim().slice(0, 80);
        if (seen.has(key)) continue; seen.add(key);
        const at = m.index;
        out.push({ category: cat, message: `"${m[0]}" in zichtbare tekst`, selector: sel(p), value: t.slice(Math.max(0, at - 50), at + 50).replace(/\s+/g, " ").trim(), inDemo: !!p.closest(".oc-demo") });
      }
    }
    // ook alt/title/aria-label/placeholder op namen
    for (const el of document.querySelectorAll("[alt],[title],[aria-label],[placeholder]")) {
      if (el.closest(skip)) continue;
      for (const a of ["alt", "title", "aria-label", "placeholder"]) {
        const v = el.getAttribute(a); if (!v) continue;
        const m = v.match(/\b(OmniaDesk|Korrekt|MySubStream|QuestPost|Verdavita|Acme|Northwind)\b/i);
        if (m) out.push({ category: "names", message: `"${m[0]}" in ${a}`, selector: sel(el), value: v.slice(0, 100) });
        if (/\bundefined\b|\[object|\bNaN\b/.test(v)) out.push({ category: "text", message: `verdachte waarde in ${a}`, selector: sel(el), value: v.slice(0, 100) });
      }
    }
    return out;
  }

  if (mode === "links") {
    const urls = new Set();
    const push = (u) => { if (!u) return; try { const x = new URL(u, location.href); if (/^https?:$/.test(x.protocol)) urls.add(x.href); } catch {} };
    const demoUrls = new Set();
    for (const a of document.querySelectorAll("a[href]")) { const h = a.getAttribute("href"); if (/^(mailto|tel|javascript|data):/i.test(h)) continue; if (a.closest(".oc-demo__code, pre, code")) continue; push(h); if (a.closest(".oc-demo__preview")) { try { demoUrls.add(new URL(h, location.href).href); } catch {} } }
    for (const e of document.querySelectorAll("img[src], script[src], source[src], video[src], audio[src]")) push(e.getAttribute("src"));
    for (const e of document.querySelectorAll("link[href]")) { const rel = e.getAttribute("rel") || ""; if (/preconnect|dns-prefetch|canonical|alternate/.test(rel)) continue; push(e.getAttribute("href")); }
    for (const e of document.querySelectorAll("img[srcset], source[srcset]")) for (const part of e.getAttribute("srcset").split(",")) push(part.trim().split(/\s+/)[0]);
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id).concat([...document.querySelectorAll("a[name]")].map((e) => e.getAttribute("name")));
    return { urls: [...urls], ids, demoUrls: [...demoUrls] };
  }

  if (mode === "contrast-fallback") {
    // eenvoudige check: tekstkleur vs eerste niet-transparante achtergrond (geen alpha-blending van tussenlagen)
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
    const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const out = [];
    for (const prev of [...document.querySelectorAll(".oc-demo__preview")].filter(topLevel)) {
      for (const el of prev.querySelectorAll("*")) {
        if (![...el.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim())) continue;
        if (!vis(el)) continue;
        const s = cs(el); const fg = parse(s.color); if (!fg || fg[3] < 0.1) continue;
        let a = el, bg = null;
        while (a) { const b = parse(cs(a).backgroundColor); if (b && b[3] > 0.9) { bg = b; break; } if (cs(a).backgroundImage !== "none") { bg = null; break; } a = a.parentElement; }
        if (!bg) continue;
        const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && parseInt(s.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5) && !el.closest("[disabled],[aria-disabled=true]")) out.push({ category: "contrast", message: `contrast ${ratio.toFixed(2)}:1`, selector: sel(el), value: { fg: s.color, bg: `rgb(${bg.slice(0, 3).join(",")})`, text: el.textContent.trim().slice(0, 40) }, inDemo: true });
      }
    }
    return out;
  }
  return null;
}
/* eslint-enable */

// ---------- run ----------
const findings = []; // vlakke lijst
const pageRecords = [];
const shots = [];
const linkSources = new Map(); // url -> Set(paginas)
const demoLinks = new Set(); // "url|pagina|site" voor links in demo-previews (placeholders)
const pageIds = new Map(); // url zonder hash -> Set(ids) (uit gerenderde pagina's)
let demoTotal = 0;

function capFindings(list, ctx) {
  const byKind = {};
  const res = [];
  for (const f of list) {
    const k = f.category + "|" + (f.demo ?? "");
    byKind[k] = (byKind[k] || 0) + 1;
    if (byKind[k] <= MAX_PER_KIND) res.push({ ...ctx, ...f });
    else if (byKind[k] === MAX_PER_KIND + 1) res.push({ ...ctx, category: f.category, demo: f.demo, demoTitle: f.demoTitle, message: `(meer bevindingen van deze soort weggelaten)`, selector: "", value: null });
  }
  return res;
}

async function settle(page) {
  await page.evaluate(async () => {
    for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = "eager";
    await Promise.race([
      Promise.all([document.fonts?.ready, ...[...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))]),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
  }).catch(() => {});
  await page.waitForTimeout(150);
}

/**
 * Screenshot-modus (alleen tijdens het fotograferen; null zet alles terug).
 *   "demo": document laat scrollen + alle vaste/kleverige site-chrome buiten demo's onzichtbaar (layout blijft gelijk)
 *   "page": document laat scrollen + vaste header bovenaan het document, vaste footer onderaan, rest verborgen
 * In beide gevallen verdwijnt de lokale Herd-balk (#herd-ai-host). Fixed/sticky binnen een .oc-demo blijft staan.
 */
async function shotMode(page, mode) {
  await page.evaluate((mode) => {
    document.getElementById("qa-shot-style")?.remove();
    for (const el of document.querySelectorAll("[data-qa-scroller]")) el.style.removeProperty("--qa-pe");
    for (const a of ["data-qa-unscroll", "data-qa-scroller", "data-qa-hide", "data-qa-top", "data-qa-static"]) for (const el of document.querySelectorAll(`[${a}]`)) el.removeAttribute(a);
    if (!mode) return;
    const all = [...document.body.querySelectorAll("*")].filter((el) => !el.closest(".oc-demo"));
    // 1. binnenste paginascroller (min-inline-size:0 zodat een grid-item niet openduwt tot zijn min-content) (docs-shell: <main> scrolt, body overflow:hidden) → het document laten scrollen
    for (const el of all) {
      const s = getComputedStyle(el);
      if (!/auto|scroll/.test(s.overflowY) || el.scrollHeight <= el.clientHeight + 4 || el.clientHeight < innerHeight * 0.5) continue;
      // de verdwijnende scrollbalk als padding houden, anders wordt de inhoud breder dan op de echte pagina
      const sb = el.offsetWidth - el.clientWidth - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
      el.style.setProperty("--qa-pe", `${parseFloat(s.paddingRight) + Math.max(0, sb)}px`);
      el.setAttribute("data-qa-scroller", "");
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) a.setAttribute("data-qa-unscroll", "");
    }
    // (fly-in-kaarten: een volledige paginafoto ziet ze niet in beeld scrollen en data-oc-fly-repeat laat ze weer wegvliegen, dus in de foto staan ze altijd op hun plaats)
    // 2. vaste/kleverige site-chrome
    for (const el of all) {
      const s = getComputedStyle(el);
      if (!/fixed|sticky/.test(s.position)) continue;
      if (el.parentElement?.closest("[data-qa-hide],[data-qa-top],[data-qa-static]")) continue;
      if (mode === "demo") { el.setAttribute("data-qa-hide", ""); continue; }
      if (s.position === "sticky") continue; // in een volledige paginafoto staat sticky gewoon op zijn plek
      const r = el.getBoundingClientRect();
      if (el.tagName === "HEADER" || (r.top <= 1 && r.width >= innerWidth * 0.9 && r.height > 0 && r.height < 200)) el.setAttribute("data-qa-top", "");
      else if (el.tagName === "FOOTER") el.setAttribute("data-qa-static", "");
      else el.setAttribute("data-qa-hide", "");
    }
    const st = document.createElement("style");
    st.id = "qa-shot-style";
    st.textContent = `html,body{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
[data-qa-unscroll]{height:auto!important;max-height:none!important;overflow:visible!important;min-inline-size:0!important}
[data-qa-scroller]{padding-right:var(--qa-pe)!important}
[data-qa-hide]{visibility:hidden!important}
[data-qa-top]{position:absolute!important;top:0!important}
[data-qa-static]{position:static!important;transform:none!important}
#herd-ai-host,[id^="herd-"]{display:none!important}
html.oc-fly-ready .oc-reveal--fly:not(.is-visible){opacity:1!important;filter:none!important;transform:none!important}`;
    document.head.appendChild(st);
  }, mode);
  await page.waitForTimeout(mode ? 200 : 50);
}

async function checkPage(ctxs, site, url) {
  const name = slug(url);
  const rec = { site, page: new URL(url).pathname, url, slug: name, demos: 0, findings: [], demoShots: [], mobileShots: {} };
  const local = [];
  for (const theme of THEMES) {
    const page = await ctxs[theme].newPage();
    let vp = "1280";
    const base = { site, page: rec.page, theme };
    const add = (f) => local.push({ ...base, viewport: vp, ...f });
    page.on("console", (m) => { if (m.type() === "error") add({ category: "console", message: m.text().slice(0, 300), selector: "", value: m.location()?.url || "" }); });
    page.on("pageerror", (e) => add({ category: "pageerror", message: String(e.message || e).slice(0, 300), selector: "", value: (e.stack || "").split("\n").slice(0, 3).join(" | ") }));
    page.on("response", (r) => {
      const t = r.request().resourceType();
      if (r.status() >= 400 && /stylesheet|script|image|font|fetch|xhr|document|media/.test(t)) add({ category: "request", message: `${r.status()} ${t}`, selector: "", value: r.url() });
    });
    let mainNavs = 0;
    page.on("request", (r) => { if (r.isNavigationRequest() && r.frame() === page.mainFrame()) mainNavs++; });
    page.on("requestfailed", (r) => {
      const t = r.resourceType(); const err = r.failure()?.errorText || "";
      if (/ERR_ABORTED/.test(err) && t === "media") return;
      // A JS redirect (location.replace, e.g. /ui/icons/catalog/category without ?c=) aborts the requests still in flight:
      // the page left on purpose, so those aborts are not broken assets. The target page is checked on its own.
      if (/ERR_ABORTED/.test(err) && mainNavs > 1) return;
      add({ category: "request", message: `requestfailed ${t}: ${err}`, selector: "", value: r.url() });
    });
    try {
      await page.setViewportSize({ width: 1280, height: 900 });
      const resp = await page.goto(url, { waitUntil: "load", timeout: 45000 });
      if (!resp || resp.status() >= 400) add({ category: "request", message: `pagina gaf ${resp?.status()}`, selector: "", value: url });
      const t = await page.evaluate(() => document.documentElement.dataset.theme || "");
      if (t !== theme) { add({ category: "theme", message: `data-theme was "${t}" na laden, verwacht "${theme}" — handmatig gezet`, selector: "html", value: t }); await page.evaluate((th) => { document.documentElement.dataset.theme = th; }, theme); }
      await settle(page);

      // 2. horizontale scroll @1280
      const hs = await page.evaluate(inPage, { mode: "hscroll", theme, vw: 1280 });
      if (hs) add({ category: "hscroll", message: `scrollWidth ${hs.scrollWidth} > ${hs.innerWidth}${hs.where !== "document" ? ` (in ${hs.where})` : ""}`, selector: hs.culprits[0]?.selector || "", value: hs.culprits });

      // 3. demo's
      const dm = await page.evaluate(inPage, { mode: "demos", theme, vw: 1280 });
      rec.demos = dm.count;
      for (const f of dm.findings) add(f);
      const ct = await page.evaluate(inPage, { mode: "codetabs", theme, vw: 1280 });
      for (const f of ct) add(f);

      // 6. contrast
      if (AXE) {
        await page.addScriptTag({ path: AXE });
        const res = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] }, resultTypes: ["violations"] });
          const out = [];
          for (const v of r.violations) for (const n of v.nodes) {
            const d = n.any?.[0]?.data || {};
            const el = document.querySelector(n.target[0]);
            out.push({ category: "contrast", message: `contrast ${d.contrastRatio ?? "?"}:1 (nodig ${d.expectedContrastRatio ?? "?"})`, selector: n.target.join(" "), value: { fg: d.fgColor, bg: d.bgColor, fontSize: d.fontSize, text: (el?.textContent || "").trim().slice(0, 50) }, inDemo: !!el?.closest(".oc-demo") });
          }
          return out;
        }).catch((e) => [{ category: "contrast", message: `axe faalde: ${e.message}`, selector: "", value: null }]);
        for (const f of res) add(f);
      } else {
        for (const f of await page.evaluate(inPage, { mode: "contrast-fallback", theme, vw: 1280 })) add(f);
      }

      if (theme === "light") {
        for (const f of await page.evaluate(inPage, { mode: "a11y", theme, vw: 1280 })) add(f);
        for (const f of await page.evaluate(inPage, { mode: "text", theme, vw: 1280 })) add(f);
        const lk = await page.evaluate(inPage, { mode: "links", theme, vw: 1280 });
        pageIds.set(url.split("#")[0], new Set(lk.ids));
        for (const u of lk.demoUrls) demoLinks.add(`${u}|${rec.page}|${site}`);
        for (const u of lk.urls) { if (!linkSources.has(u)) linkSources.set(u, new Set()); linkSources.get(u).add(rec.page + "|" + site); }
      }

      // 3e. screenshots van elke demo-preview @1280
      if (SHOTS && dm.count) {
        const dir = path.join(OUT, "shots", site);
        const widths = () => page.evaluate(() => [...document.querySelectorAll(".oc-demo__preview")].filter((p) => !p.closest(".oc-demo")?.parentElement?.closest(".oc-demo")).map((p) => Math.round(p.getBoundingClientRect().width)));
        const w0 = await widths();
        await shotMode(page, "demo");
        try {
          const w1 = await widths();
          if (w0.join() !== w1.join()) add({ category: "screenshot", message: "screenshotmodus veranderde de demobreedte (screenshots wijken af van de echte pagina)", selector: ".oc-demo__preview", value: { echt: w0.slice(0, 5), shot: w1.slice(0, 5) } });
          // alleen previews van buitenste demo's (een geneste demo staat al in de shot van de buitenste)
          const previews = [];
          for (const h of await page.$$(".oc-demo__preview")) if (await h.evaluate((p) => !p.closest(".oc-demo")?.parentElement?.closest(".oc-demo"))) previews.push(h);
          const titles = await page.evaluate(() => [...document.querySelectorAll(".oc-demo__preview")].filter((p) => !p.closest(".oc-demo")?.parentElement?.closest(".oc-demo")).map((p, i) => (p.closest(".oc-demo")?.querySelector(".oc-demo__title")?.textContent || "").trim() || `demo ${i + 1}`));
          for (let i = 0; i < previews.length; i++) {
            const file = path.join(dir, `${name}__${String(i + 1).padStart(2, "0")}__${theme}.png`);
            try {
              const box = await previews[i].boundingBox();
              if (!box || box.width < 2 || box.height < 2) continue;
              await previews[i].screenshot({ path: file, timeout: 20000, animations: "disabled" });
              shots.push(file);
              const ds = (rec.demoShots[i] ||= { demo: i, title: titles[i] || `demo ${i + 1}` });
              ds[theme] = file;
            } catch (e) { add({ category: "screenshot", demo: i, message: `screenshot mislukt: ${e.message.split("\n")[0]}`, selector: ".oc-demo__preview", value: file }); }
          }
        } finally { await shotMode(page, null); }
      }

      // 768 en 390
      for (const w of [768, 390]) {
        vp = String(w);
        await page.setViewportSize({ width: w, height: w === 390 ? 844 : 1024 });
        await page.waitForTimeout(200);
        const h = await page.evaluate(inPage, { mode: "hscroll", theme, vw: w });
        if (h) add({ category: "hscroll", message: `scrollWidth ${h.scrollWidth} > ${h.innerWidth}${h.where !== "document" ? ` (in ${h.where})` : ""}`, selector: h.culprits[0]?.selector || "", value: h.culprits });
        if (w === 390) {
          const d2 = await page.evaluate(inPage, { mode: "demos", theme, vw: w });
          for (const f of d2.findings) add(f);
          if (SHOTS) {
            // volledige pagina @390, licht en donker
            const file = path.join(OUT, "shots", site, `${name}__mobile__${theme}.png`);
            await shotMode(page, "page");
            try { await page.screenshot({ path: file, fullPage: true, timeout: 45000, animations: "disabled" }); shots.push(file); rec.mobileShots[theme] = file; }
            catch (e) { add({ category: "screenshot", message: `mobiele screenshot mislukt: ${e.message.split("\n")[0]}`, selector: "", value: file }); }
            finally { await shotMode(page, null); }
          }
        }
      }
    } catch (e) {
      add({ category: "harness", message: `pagina-check afgebroken: ${e.message.split("\n")[0]}`, selector: "", value: url });
    } finally {
      await page.close().catch(() => {});
    }
  }
  // per viewport/thema/soort begrenzen
  const groups = {};
  for (const f of local) (groups[`${f.theme}|${f.viewport}`] ||= []).push(f);
  for (const g of Object.values(groups)) rec.findings.push(...capFindings(g, {}));
  demoTotal += rec.demos;
  findings.push(...rec.findings);
  pageRecords.push(rec);
}

async function checkLinks() {
  const req = await pwRequest.newContext({ ignoreHTTPSErrors: true });
  const status = new Map();
  const htmlIds = new Map();
  const targets = [...linkSources.keys()].filter(isLocal);
  const byBase = new Map();
  for (const u of targets) { const b = u.split("#")[0]; if (!byBase.has(b)) byBase.set(b, []); byBase.get(b).push(u); }
  const bases = [...byBase.keys()];
  let i = 0;
  const needIds = (b) => byBase.get(b).some((u) => u.includes("#") && u.split("#")[1]);
  async function worker() {
    while (i < bases.length) {
      const b = bases[i++];
      if (!isLocal(b)) continue;
      try {
        let r;
        if (needIds(b) && !pageIds.has(b)) r = await req.get(b, { timeout: 20000, maxRedirects: 5 });
        else { r = await req.head(b, { timeout: 20000, maxRedirects: 5 }); if (r.status() === 405 || r.status() === 501) r = await req.get(b, { timeout: 20000 }); }
        status.set(b, r.status());
        if (needIds(b) && !pageIds.has(b) && /html/.test(r.headers()["content-type"] || "")) {
          const html = await r.text();
          htmlIds.set(b, new Set([...html.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)].map((m) => m[1])));
        }
      } catch (e) { status.set(b, `ERR ${e.message.split("\n")[0]}`); }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  await req.dispose();
  const out = [];
  for (const [b, us] of byBase) {
    const st = status.get(b);
    const from = [...new Set(us.flatMap((u) => [...linkSources.get(u)]))];
    if (typeof st !== "number" || st >= 400) {
      for (const f of from) { const [pg, site] = f.split("|"); const inDemo = us.every((u) => !linkSources.get(u).has(f) || demoLinks.has(`${u}|${f}`)); out.push({ site, page: pg, theme: "light", viewport: "1280", category: inDemo ? "link-demo" : "link", message: `${st} voor ${b}`, selector: `[href="${b}"], [src="${b}"]`, value: b }); }
      continue;
    }
    for (const u of us) {
      const h = u.split("#")[1];
      if (!h) continue;
      const ids = pageIds.get(b) || htmlIds.get(b);
      if (!ids) continue;
      const id = decodeURIComponent(h);
      if (ids.has(id)) continue;
      // "#demo-3-contact": a placeholder link in a demo, given its own fragment by the build (apps/site/src/lib/transform.mjs)
      // so it never scrolls the docs page. It points nowhere on purpose (a click does not move the page).
      if (/^demo-\d+-/.test(id)) continue;
      for (const f of linkSources.get(u)) { const [pg, site] = f.split("|"); out.push({ site, page: pg, theme: "light", viewport: "1280", category: demoLinks.has(`${u}|${f}`) ? "anchor-demo" : "anchor", message: `anker #${id} bestaat niet op ${b}`, selector: `a[href*="#${id}"]`, value: u }); }
    }
  }
  return { results: out, checked: bases.length };
}

const t0 = Date.now();
fs.mkdirSync(OUT, { recursive: true });
const allPages = [];
for (const k of siteKeys) {
  for (const u of pagesFor(k)) { if (!isLocal(u)) throw new Error(`Weiger niet-lokale URL ${u}`); allPages.push([k, u]); }
  const sd = path.join(OUT, "shots", k);
  if (!pageFilter.length) { fs.rmSync(sd, { recursive: true, force: true }); fs.rmSync(path.join(OUT, "sheets", k), { recursive: true, force: true }); }
  fs.mkdirSync(sd, { recursive: true });
}
console.log(`QA: ${allPages.length} pagina's (${siteKeys.join(", ")}), ${CONC} parallel, axe: ${AXE ? AXE : "niet gevonden (eigen check)"}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const mkCtx = async (theme) => {
  const c = await browser.newContext({ ignoreHTTPSErrors: true, colorScheme: theme, deviceScaleFactor: 1, viewport: { width: 1280, height: 900 } });
  await c.addInitScript((t) => { try { localStorage.setItem("oc-theme", t); } catch {} }, theme);
  // nooit live hosts benaderen: alles wat niet *.test is, afbreken (externe fonts/cdn's tellen niet als fout)
  await c.route((u) => !u.hostname.endsWith(".test") && /^https?:$/.test(u.protocol), (r) => r.abort("blockedbyclient"));
  return c;
};
let next = 0, done = 0;
async function worker() {
  const ctxs = { light: await mkCtx("light"), dark: await mkCtx("dark") };
  while (next < allPages.length) {
    const [site, url] = allPages[next++];
    await checkPage(ctxs, site, url);
    done++;
    if (done % 10 === 0 || done === allPages.length) console.log(`  ${done}/${allPages.length}  (${Math.round((Date.now() - t0) / 1000)}s)`);
  }
  await ctxs.light.close(); await ctxs.dark.close();
}
await Promise.all(Array.from({ length: CONC }, worker));
for (const r of pageRecords) r.demoShots = r.demoShots.filter(Boolean);

// ---------- --diff: welke pagina's hebben veranderde screenshots ----------
const pngSize = (buf) => (buf.length > 24 && buf.toString("ascii", 12, 16) === "IHDR" ? [buf.readUInt32BE(16), buf.readUInt32BE(20)] : [0, 0]);
const dataUri = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
let diffInfo = null;
if (DIFF && SHOTS) {
  console.log(`Screenshots vergelijken met ${DIFF} …`);
  const cmpCtx = await browser.newContext({ deviceScaleFactor: 1 });
  const cmpPage = await cmpCtx.newPage();
  // bytes gelijk = gelijk; anders (zelfde afmeting) pixels vergelijken in een canvas: > 20 pixels met een kanaalverschil > 16 = veranderd
  async function pixelsDiffer(a, b) {
    const ba = fs.readFileSync(a), bb = fs.readFileSync(b);
    if (ba.equals(bb)) return false;
    const [wa, ha] = pngSize(ba), [wb, hb] = pngSize(bb);
    if (wa !== wb || ha !== hb) return true;
    return cmpPage.evaluate(async ([ua, ub]) => {
      const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
      const [ia, ib] = await Promise.all([load(ua), load(ub)]);
      const px = (img) => { const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight); const x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
      const da = px(ia), db = px(ib);
      let n = 0;
      for (let k = 0; k < da.length; k += 4) if (Math.abs(da[k] - db[k]) > 16 || Math.abs(da[k + 1] - db[k + 1]) > 16 || Math.abs(da[k + 2] - db[k + 2]) > 16 || Math.abs(da[k + 3] - db[k + 3]) > 16) { if (++n > 20) return true; }
      return false;
    }, [`data:image/png;base64,${ba.toString("base64")}`, `data:image/png;base64,${bb.toString("base64")}`]).catch(() => true);
  }
  const changed = [], unchanged = [];
  for (const r of pageRecords) {
    const prefix = `${r.slug}__`;
    const cur = shots.filter((f) => path.dirname(f) === path.join(OUT, "shots", r.site) && path.basename(f).startsWith(prefix)).map((f) => path.basename(f));
    const prevDir = path.join(DIFF, "shots", r.site);
    const prev = fs.existsSync(prevDir) ? fs.readdirSync(prevDir).filter((f) => f.startsWith(prefix) && f.endsWith(".png")) : [];
    const reasons = [];
    for (const f of cur) {
      if (!prev.includes(f)) reasons.push(`nieuw: ${f}`);
      else if (await pixelsDiffer(path.join(OUT, "shots", r.site, f), path.join(prevDir, f))) reasons.push(`veranderd: ${f}`);
    }
    for (const f of prev) if (!cur.includes(f)) reasons.push(`weg: ${f}`);
    r.shotChanges = reasons;
    (reasons.length ? changed : unchanged).push(r);
  }
  await cmpCtx.close();
  diffInfo = { against: DIFF, changedPages: changed.map((r) => `${r.site} ${r.page}`), unchangedPages: unchanged.length };
  console.log(`  ${changed.length} pagina's met veranderde screenshots, ${unchanged.length} ongewijzigd`);
}
const reviewRecords = diffInfo ? pageRecords.filter((r) => r.shotChanges?.length) : pageRecords;
const reviewShots = diffInfo ? shots.filter((f) => reviewRecords.some((r) => path.dirname(f) === path.join(OUT, "shots", r.site) && path.basename(f).startsWith(`${r.slug}__`))) : shots;

// ---------- --sheets: contactbladen (licht naast donker per demo) ----------
const sheets = [];
if (SHEETS) {
  console.log("Contactbladen maken …");
  const sheetCtx = await browser.newContext({ deviceScaleFactor: 1, viewport: { width: 1600, height: 900 } });
  const sp = await sheetCtx.newPage();
  const COLW = 776, MAXH = 5000; // kolombreedte op het blad; max. hoogte per blad (anders opgesplitst)
  const escH = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  for (const r of [...reviewRecords].sort((a, b) => (a.site + a.page).localeCompare(b.site + b.page))) {
    if (!r.demoShots.length) continue;
    // in blokken van max. ~MAXH px geschaalde hoogte
    const chunks = [[]];
    let h = 0;
    for (const d of r.demoShots) {
      const dims = ["light", "dark"].map((t) => (d[t] ? pngSize(fs.readFileSync(d[t])) : [0, 0]));
      const rowH = 40 + Math.max(...dims.map(([w, hh]) => (w ? hh * Math.min(1, COLW / w) : 0)));
      if (chunks.at(-1).length && h + rowH > MAXH) { chunks.push([]); h = 0; }
      chunks.at(-1).push(d); h += rowH;
    }
    const dir = path.join(OUT, "sheets", r.site);
    fs.mkdirSync(dir, { recursive: true });
    for (let c = 0; c < chunks.length; c++) {
      const cell = (d, t) => d[t] ? `<figure><figcaption>${t === "light" ? "licht" : "donker"}</figcaption><img src="${dataUri(d[t])}"></figure>` : `<figure><figcaption>${t === "light" ? "licht" : "donker"}: geen screenshot</figcaption></figure>`;
      const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;padding:16px;width:1600px;background:#fff;color:#111;font:14px/1.4 system-ui,sans-serif}
h1{font-size:18px;margin:0 0 12px}h2{font-size:14px;margin:0 0 6px}section{margin:0 0 20px}
.pair{display:grid;grid-template-columns:${COLW}px ${COLW}px;gap:16px;align-items:start}
figure{margin:0;border:1px solid #bbb;background:#f4f4f4}
figcaption{font-size:12px;padding:2px 6px;background:#f3f3f3;color:#444;border-bottom:1px solid #bbb}img{display:block;max-width:100%;height:auto}
</style><h1>${escH(r.site)} ${escH(r.page)}${chunks.length > 1 ? ` (${c + 1}/${chunks.length})` : ""}</h1>
${chunks[c].map((d) => `<section><h2>${d.demo + 1}. ${escH(d.title)}</h2><div class="pair">${cell(d, "light")}${cell(d, "dark")}</div></section>`).join("\n")}`;
      const file = path.join(dir, `${r.slug}__sheet-${c + 1}.png`);
      try {
        await sp.setContent(html, { waitUntil: "load", timeout: 30000 });
        await sp.screenshot({ path: file, fullPage: true, timeout: 30000 });
        sheets.push(file);
      } catch (e) { console.warn(`  contactblad mislukt voor ${r.page}: ${e.message.split("\n")[0]}`); }
    }
  }
  await sheetCtx.close();
}
await browser.close();

// geblokkeerde externe requests zijn geen fout van de site: apart houden
const external = findings.filter((f) => f.category === "request" && /blockedbyclient|ERR_BLOCKED_BY_CLIENT/i.test(f.message));
const externalHosts = [...new Set(external.map((f) => { try { return new URL(f.value).host; } catch { return f.value; } }))];
for (const r of pageRecords) r.findings = r.findings.filter((f) => !(f.category === "request" && /blockedbyclient|ERR_BLOCKED_BY_CLIENT/i.test(f.message)) && !(f.category === "console" && /ERR_BLOCKED_BY_CLIENT/.test(f.message)));

console.log("Links controleren …");
const lk = await checkLinks();
for (const f of lk.results) { const r = pageRecords.find((p) => p.page === f.page && p.site === f.site); if (r) r.findings.push(f); }

// ---------- rapport ----------
pageRecords.sort((a, b) => (a.site + a.page).localeCompare(b.site + b.page));
const all = pageRecords.flatMap((r) => r.findings);
const cats = {};
for (const f of all) cats[f.category] = (cats[f.category] || 0) + 1;
const secs = Math.round((Date.now() - t0) / 1000);
shots.sort();
const report = {
  generated: new Date().toISOString(), durationSeconds: secs, sites: siteKeys, pages: pageRecords.length, demos: demoTotal,
  screenshots: shots.length, linksChecked: lk.checked, axe: AXE, categories: cats, blockedExternalHosts: externalHosts,
  diff: diffInfo, reviewScreenshots: reviewShots.length, sheets, pagesDetail: pageRecords,
};
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

// 4 batches voor de visuele review (met --diff alleen de pagina's met veranderde screenshots)
const toBatches = (list) => { const b = [[], [], [], []]; const per = Math.max(1, Math.ceil(list.length / 4)); [...list].sort().forEach((s, i) => b[Math.min(3, Math.floor(i / per))].push(s)); return b; };
fs.writeFileSync(path.join(OUT, "batches.json"), JSON.stringify(toBatches(reviewShots), null, 2));
if (SHEETS) fs.writeFileSync(path.join(OUT, "batches-sheets.json"), JSON.stringify(toBatches(sheets), null, 2));

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const short = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v)).slice(0, 160);
let md = `# QA-rapport docs-sites\n\n${report.generated} · ${secs}s · ${report.pages} pagina's · ${demoTotal} demo's · ${shots.length} screenshots · ${lk.checked} unieke link-doelen · contrast: ${AXE ? "axe-core" : "eigen check"}\n\n`;
if (diffInfo) md += `Vergeleken met ${diffInfo.against}: ${diffInfo.changedPages.length} pagina's met veranderde screenshots (${reviewShots.length} screenshots in batches.json), ${diffInfo.unchangedPages} ongewijzigd.

`;
if (SHEETS) md += `Contactbladen: ${sheets.length} in ${path.join(OUT, "sheets")} (batches-sheets.json).

`;
if (externalHosts.length) md += `Externe requests geblokkeerd (bewust, nooit live hosts): ${externalHosts.join(", ")}\n\n`;
md += `## Per categorie\n\n| Categorie | Aantal | Pagina's |\n|---|---:|---:|\n`;
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) md += `| ${c} | ${n} | ${new Set(all.filter((f) => f.category === c).map((f) => f.site + f.page)).size} |\n`;
md += `\n## Per pagina\n\n`;
for (const r of pageRecords) {
  if (!r.findings.length) continue;
  md += `### ${r.site} ${r.page} (${r.findings.length})\n\n| Cat | Thema/vp | Demo | Wat | Selector | Waarde |\n|---|---|---|---|---|---|\n`;
  for (const f of r.findings) md += `| ${f.category} | ${f.theme}/${f.viewport} | ${f.demo != null ? esc(`${f.demo + 1} ${f.demoTitle || ""}`) : ""} | ${esc(f.message)} | \`${esc(f.selector).slice(0, 120)}\` | ${esc(short(f.value))} |\n`;
  md += `\n`;
}
// terugkerende bevindingen (site-chrome): zelfde soort+selector+melding op >= 5 pagina's
const rec_ = {};
for (const f of all) { const k = `${f.site}|${f.category}|${f.selector}|${f.message}`; (rec_[k] ||= new Set()).add(f.page); }
const recurring = Object.entries(rec_).filter(([, s]) => s.size >= 5).sort((a, b) => b[1].size - a[1].size);
if (recurring.length) {
  md += `## Terugkerend op veel pagina's (site-chrome, ${recurring.length})

| Site | Cat | Wat | Selector | Pagina's |
|---|---|---|---|---:|
`;
  for (const [k, s] of recurring) { const [site, cat, selector, msg] = k.split("|"); md += `| ${site} | ${cat} | ${esc(msg)} | \`${esc(selector).slice(0, 120)}\` | ${s.size} |
`; }
  md += `
`;
}
if (diffInfo && diffInfo.changedPages.length) {
  md += `## Veranderde screenshots (${diffInfo.changedPages.length})

`;
  for (const r of reviewRecords) md += `- ${r.site} ${r.page}: ${r.shotChanges.slice(0, 6).join(", ")}${r.shotChanges.length > 6 ? ` (+${r.shotChanges.length - 6})` : ""}
`;
  md += `
`;
}
const clean = pageRecords.filter((r) => !r.findings.length).map((r) => `${r.site} ${r.page}`);
md += `## Zonder bevindingen (${clean.length})\n\n${clean.join(", ")}\n`;
fs.writeFileSync(path.join(OUT, "report.md"), md);

console.log(`Klaar in ${secs}s: ${report.pages} pagina's, ${demoTotal} demo's, ${shots.length} screenshots${SHEETS ? `, ${sheets.length} contactbladen` : ""}${diffInfo ? `, ${diffInfo.changedPages.length} pagina's veranderd` : ""}.`);
console.log(Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => `  ${c}: ${n}`).join("\n"));
console.log(`Rapport: ${path.join(OUT, "report.md")}`);
