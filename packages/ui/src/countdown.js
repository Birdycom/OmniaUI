// File: packages/ui/src/countdown.js
// Map: format seconds -> state of a moment (left, fraction, low, done) -> bind one [data-oc-countdown] (tick, write,
//      end event) -> init every one -> boot
// Behaviour for the CSS countdown (.oc-countdown) in plain HTML and Blade. The element carries the end time
// (data-oc-countdown-end="2026-11-17T20:00:00", an ISO date or a timestamp in ms) or a duration from now
// (data-oc-countdown-seconds="90"); data-oc-countdown-total is the full time in seconds for the bar (default: the
// starting time), data-oc-countdown-low the seconds from which it turns orange (default 20% of the total, at most 60).
// The script writes the time into .oc-countdown-time, --oc-countdown-left and data-state (low, done).
// Event on the element: oc-countdown-end, once, when the time is up.

/** 90 -> "1:30", 3725 -> "1:02:05", never below 0. */
export function formatCountdown(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const two = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

/** The state at one moment: seconds left, the part of the total that is left (0..1), and "low" / "done" / "". */
export function countdownState(left, total, low) {
  const l = Math.max(0, left);
  const t = total > 0 ? total : l || 1;
  const lowAt = low ?? Math.min(60, t * 0.2);
  return { left: l, fraction: Math.min(1, l / t), state: l <= 0 ? "done" : l <= lowAt ? "low" : "" };
}

/** Starts one countdown element. Returns a function that stops it. */
export function bindCountdown(el) {
  if (el.dataset.ocBound != null) return () => {};
  el.dataset.ocBound = "";
  const d = el.dataset;
  const now = Date.now();
  const rawEnd = d.ocCountdownEnd;
  const end = rawEnd ? (/^\d+$/.test(rawEnd) ? Number(rawEnd) : Date.parse(rawEnd)) : now + Number(d.ocCountdownSeconds || 0) * 1000;
  const total = Number(d.ocCountdownTotal) || Math.max(1, (end - now) / 1000);
  const low = d.ocCountdownLow != null ? Number(d.ocCountdownLow) : undefined;
  const time = el.querySelector(".oc-countdown-time");
  let ended = false;
  const tick = () => {
    const s = countdownState((end - Date.now()) / 1000, total, low);
    if (time) time.textContent = formatCountdown(s.left);
    el.style.setProperty("--oc-countdown-left", String(s.fraction));
    if (s.state) el.dataset.state = s.state;
    else delete el.dataset.state;
    if (s.state === "done" && !ended) {
      ended = true;
      clearInterval(timer);
      el.dispatchEvent(new CustomEvent("oc-countdown-end", { bubbles: true }));
    }
  };
  const timer = setInterval(tick, 250);
  tick();
  return () => { clearInterval(timer); delete el.dataset.ocBound; };
}

/** Starts every [data-oc-countdown] under `scope`. */
export function initCountdown(scope = document) {
  return [...scope.querySelectorAll("[data-oc-countdown]")].map(bindCountdown);
}

// Starts on its own as /js/oc-countdown.js (`npx omniaui copy-js countdown`), with ?auto in the URL or data-oc-auto on
// the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-countdown") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initCountdown(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
