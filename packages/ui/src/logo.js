// File: packages/ui/src/logo.js
// Map: luminance of a pixel -> plate from the pixels (pure, testable) -> measure an image once (canvas, cached)
//      -> bind one .oc-logo[data-plate="auto"] -> init -> boot
// Logo: an uploaded logo is shown as it is (own colors, own ratio, never filtered). Only where it would disappear does it
// get a calm neutral plate: a (nearly) white logo in the light theme, a dark logo in the dark theme. This script looks at
// the pixels once per image and writes the answer in data-plate ("light", "dark", "both" or "none"); the CSS does the
// rest. The image must come from the same origin (or send CORS headers), otherwise the canvas cannot be read and the
// logo stays without a plate. Set data-plate by hand ("light" / "dark" / "both" / "none") to skip the measuring.

/** Relative luminance (WCAG) of an sRGB color with channels 0 to 255. */
export function luminance(r, g, b) {
  const lin = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Which theme needs a plate, from RGBA pixel data (Uint8ClampedArray, 4 bytes per pixel):
 * "light" = the logo is mostly white (a plate in the light theme), "dark" = a large part is too dark for a dark page
 * (a plate in the dark theme), "both" = it has both, "none" = it reads on both, or it brings its own background.
 */
export function plateFromPixels(data) {
  let seen = 0, opaque = 0, whiteish = 0, darkish = 0;
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha > 0.95) opaque++;
    if (alpha < 0.5) continue;
    seen++;
    const l = luminance(data[i], data[i + 1], data[i + 2]);
    // Contrast with a white page below 1.35:1 = disappears in the light theme; with a dark page below 2.5:1 = in the dark.
    if (1.05 / (l + 0.05) < 1.35) whiteish++;
    if ((l + 0.05) / 0.06 < 2.5) darkish++;
  }
  // Nothing visible, or a logo on its own opaque background: it is its own plate.
  if (!seen || opaque / total > 0.9) return "none";
  const white = whiteish / seen, dark = darkish / seen;
  if (white > 0.2 && dark > 0.2) return "both";
  if (white > 0.5) return "light";
  if (dark > 0.25) return "dark";
  return "none";
}

const cache = new Map();

/** Measures an image URL once (cached per URL). Resolves "light" | "dark" | "both" | "none". */
export function measureLogo(src) {
  if (!src) return Promise.resolve("none");
  if (cache.has(src)) return cache.get(src);
  const job = new Promise((done) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const w = 64, h = Math.max(1, Math.round((64 * img.naturalHeight) / Math.max(1, img.naturalWidth)));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const g = canvas.getContext("2d", { willReadFrequently: true });
        if (!g) return done("none");
        g.drawImage(img, 0, 0, w, h);
        done(plateFromPixels(g.getImageData(0, 0, w, h).data));
      } catch {
        done("none"); // another origin without CORS: the canvas is locked
      }
    };
    img.onerror = () => done("none");
    img.src = src;
  });
  cache.set(src, job);
  return job;
}

/** Measures one .oc-logo[data-plate="auto"] and writes the answer in data-plate. */
export async function bindLogo(root) {
  const img = root.querySelector("img");
  if (!img || root.dataset.plate !== "auto") return;
  root.dataset.plate = await measureLogo(img.currentSrc || img.src);
}

/** Measures every .oc-logo[data-plate="auto"] in scope. */
export function initLogos(scope = document) {
  return Promise.all([...scope.querySelectorAll('.oc-logo[data-plate="auto"]')].map(bindLogo));
}

// Starts on its own as /js/oc-logo.js (`npx omniaui copy-js logo`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-logo") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initLogos(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
