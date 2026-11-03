// File: packages/ui/src/particles.js
// Map: options (data attributes) -> colors from CSS (re-read on a theme change) -> size (the canvas box x device pixels)
//      -> particles -> frame (move, dot, lines to close neighbours) -> pause when hidden -> boot
// Particle field (canvas.oc-particles): slowly drifting points with thin lines between points that are close together.
// Colors come from the canvas's CSS: color (points and lines) and border-color (a second point color), so a theme
// switch (data-theme or a class on <html>, or the OS setting) recolors it. With "reduce motion" it draws one still frame.
// Options (data attributes on the canvas): data-count (110), data-speed (0.35), data-link (115, the line distance in px).

/** Numbers from the canvas's data attributes, with the defaults. */
export function particleOptions(canvas) {
  const num = (name, fallback) => {
    const n = parseFloat(canvas.dataset?.[name] ?? "");
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return { count: Math.round(num("count", 110)), speed: num("speed", 0.35), link: num("link", 115) };
}

/** Start the field on one canvas (once). Returns a function that stops it. */
export function initParticles(canvas, options = {}) {
  if (!canvas || canvas.dataset.ocBound !== undefined) return () => {};
  const ctx = canvas.getContext?.("2d");
  const win = canvas.ownerDocument?.defaultView;
  if (!ctx || !win) return () => {};
  canvas.dataset.ocBound = "";
  const { count, speed, link } = { ...particleOptions(canvas), ...options };
  const still = win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  let width = 0, height = 0;
  const resize = () => {
    const ratio = win.devicePixelRatio || 1;
    width = canvas.clientWidth || win.innerWidth;
    height = canvas.clientHeight || win.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();

  let lineColor = "", colors = [];
  const readColors = () => {
    const cs = win.getComputedStyle(canvas);
    lineColor = cs.color;
    colors = [cs.color, cs.borderTopColor, cs.color];
  };
  readColors();

  const particles = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    r: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.55 + 0.1,
    tone: i % 3,
  }));

  const frame = (move) => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      if (move) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colors[p.tone];
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      // Lines only to the next few points: cheap, and enough to look like a network.
      for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d >= link) continue;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = (1 - d / link) * 0.1;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  };

  let raf = 0;
  const loop = () => { frame(true); raf = win.requestAnimationFrame(loop); };
  const start = () => { if (!still && !raf) raf = win.requestAnimationFrame(loop); };
  const pause = () => { win.cancelAnimationFrame(raf); raf = 0; };
  const onVisibility = () => (canvas.ownerDocument.hidden ? pause() : start());
  const onResize = () => { resize(); if (still) frame(false); };
  const recolor = () => { readColors(); if (still) frame(false); };

  const themeObserver = new win.MutationObserver(recolor);
  themeObserver.observe(canvas.ownerDocument.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
  const scheme = win.matchMedia?.("(prefers-color-scheme: dark)");
  scheme?.addEventListener?.("change", recolor);
  const sizeObserver = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(onResize) : null;
  if (sizeObserver) sizeObserver.observe(canvas); else win.addEventListener("resize", onResize);
  canvas.ownerDocument.addEventListener("visibilitychange", onVisibility);

  if (still) frame(false); else start();
  return () => {
    pause();
    themeObserver.disconnect();
    scheme?.removeEventListener?.("change", recolor);
    sizeObserver?.disconnect();
    win.removeEventListener("resize", onResize);
    canvas.ownerDocument.removeEventListener("visibilitychange", onVisibility);
    delete canvas.dataset.ocBound;
  };
}

/** Start every canvas.oc-particles under scope. Returns a function that stops them all. */
export function initParticleFields(scope = document) {
  const stops = [...scope.querySelectorAll("canvas.oc-particles")].map((c) => initParticles(c));
  return () => stops.forEach((stop) => stop());
}

// Starts on its own as /js/oc-particles.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-particles") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initParticleFields(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
