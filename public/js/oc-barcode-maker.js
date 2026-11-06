// OmniaUI Pro v0.14.4 - commercial software, NOT open source and NOT under the MIT license.
// Copyright (c) 2026 Serge Cools (Birdycom). All rights reserved.
// Use only with a valid OmniaUI Pro license: https://omniaui.eu/legal/pro-license (buy: https://omniaui.eu/ui/pro).
// File: packages/pro/src/barcode-maker.js
// Map: bind one maker (value, format, preview, download) -> init -> boot
// OmniaUI Pro barcode maker: a form [data-oc-barcode-maker] with a value field (name="value"), an optional format select
// (name="format"), a preview figure.oc-barcode and a[data-oc-barcode-download] that saves a print-ready SVG. Redraws
// while typing. Builds on the free barcode.js of @birdycom/omniaui (the encoder and barcodeFile()).

import { barcodeFile, renderBarcode } from "/js/oc-barcode.js";

/** [data-oc-barcode-maker]: a value field (name="value"), an optional format select (name="format"), a preview
 *  figure.oc-barcode and a[data-oc-barcode-download] that saves the SVG file. Redraws while typing. */
export function bindBarcodeMaker(root) {
  if (!root || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const value = root.querySelector('[name="value"]');
  const format = root.querySelector('[name="format"]');
  const out = root.querySelector(".oc-barcode");
  const save = root.querySelector("[data-oc-barcode-download]");
  if (!value || !out) return;
  let url = "";
  const draw = () => {
    out.dataset.value = value.value;
    out.dataset.format = format?.value || "auto";
    renderBarcode(out);
    const failed = out.hasAttribute("data-error");
    value.setAttribute("aria-invalid", String(failed && value.value.trim() !== ""));
    if (!save) return;
    if (url) URL.revokeObjectURL(url);
    url = "";
    save.removeAttribute("href");
    save.setAttribute("aria-disabled", "true");
    if (failed) return;
    url = URL.createObjectURL(new Blob([barcodeFile(value.value, { format: out.dataset.format })], { type: "image/svg+xml" }));
    save.href = url;
    save.download = `barcode-${value.value.trim().replace(/[^\w-]+/g, "_").slice(0, 40)}.svg`;
    save.removeAttribute("aria-disabled");
  };
  value.addEventListener("input", draw);
  format?.addEventListener("change", draw);
  root.addEventListener("submit", (event) => event.preventDefault());
  draw();
}

/** Wire every barcode maker under scope. */
export function initBarcodeMakers(scope = document) {
  scope.querySelectorAll("[data-oc-barcode-maker]").forEach(bindBarcodeMaker);
}

// Starts on its own as /js/oc-barcode-maker.js (`npx omniaui copy-js`), with ?auto or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-barcode-maker") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initBarcodeMakers(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
