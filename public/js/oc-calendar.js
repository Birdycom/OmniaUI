// File: packages/ui/src/calendar.js
// Map: days of a root -> pick (single: one day, range: start then end) -> paint (aria-selected, --range-*) -> summary line
//      -> arrow keys between days -> bind one [data-oc-calendar] -> init every one -> boot
// Behaviour for the CSS calendar (.oc-calendar, button.oc-calendar-day[data-date]) in plain HTML and Blade: a click or
// Enter picks a day, the arrow keys move between the days (one day, one week; Home / End: start / end of the week).
// The root carries data-oc-calendar="single" (default) or "range"; it may hold more than one month (two calendars side by
// side), a range then runs over both. An element with data-oc-calendar-summary in the root shows the choice, with its
// data-template ("{start} – {end} ({days} days)", "{date}"); dates are written with Intl in the language of the page. An
// input[data-oc-calendar-value] in the root gets the ISO date (or "start/end") for a form.
// Event on the root: oc-calendar-change { mode, date } or { mode, start, end }.

const DAY = "button.oc-calendar-day[data-date]";

/** "2026-10-20" -> a Date at noon (no time zone jumps). */
const toDate = (iso) => new Date(`${iso}T12:00:00`);
/** A Date -> "2026-10-20". */
const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The date `days` after (or before) an ISO date. */
export function shiftDate(iso, days) {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** Classes and aria-selected for the days of a choice: one day, or a range from start to end. */
export function dayState(iso, start, end) {
  if (!start) return { selected: false, cls: [] };
  if (!end || end === start) return { selected: iso === start, cls: iso === start && end ? ["oc-calendar-day--range-start", "oc-calendar-day--range-end"] : [] };
  if (iso === start) return { selected: true, cls: ["oc-calendar-day--range-start"] };
  if (iso === end) return { selected: true, cls: ["oc-calendar-day--range-end"] };
  if (iso > start && iso < end) return { selected: false, cls: ["oc-calendar-day--range-middle"] };
  return { selected: false, cls: [] };
}

const RANGE = ["oc-calendar-day--range-start", "oc-calendar-day--range-middle", "oc-calendar-day--range-end"];

/** The weeks of a month for a calendar grid: 6 rows of 7 ISO dates, Monday first (weekStart 1) or Sunday (0), with
 *  `outside` for the days of the months before and after. month: "2026-10". */
export function monthGrid(month, weekStart = 1) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1, 12);
  const lead = (first.getDay() - weekStart + 7) % 7;
  const start = toIso(new Date(y, m - 1, 1 - lead, 12));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const iso = shiftDate(start, w * 7 + d);
    return { iso, day: Number(iso.slice(8)), outside: iso.slice(0, 7) !== month };
  }));
}

/** "2026-10" plus or minus some months. */
export function shiftMonth(month, by) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Date picker: closes the nearest open [popover] around a calendar root (the popover wraps the calendar). */
export function closePicker(root) {
  const pop = root.closest?.("[popover]");
  if (!pop) return false;
  try {
    if (!pop.matches(":popover-open")) return false;
    pop.hidePopover();
    return true;
  } catch { return false; /* closed or no popover support */ }
}

/** Starts one calendar root. Returns a function that stops it. */
export function bindCalendar(root) {
  if (root.dataset.ocBound != null) return () => {};
  root.dataset.ocBound = "";
  const mode = root.dataset.ocCalendar === "range" ? "range" : "single";
  const days = () => [...root.querySelectorAll(DAY)].filter((b) => !b.disabled);
  const lang = root.closest("[lang]")?.getAttribute("lang") || document.documentElement.lang || undefined;
  // data-format on the summary: short (12 Oct 2026, default), long (12 October 2026), full (Monday 12 October 2026).
  const FORMATS = {
    short: { day: "numeric", month: "short", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  };
  const fmtFor = (el) => new Intl.DateTimeFormat(lang, FORMATS[el?.dataset.format] ?? FORMATS.short);

  // Start from what the markup already shows.
  const marked = days().filter((b) => b.getAttribute("aria-selected") === "true" || RANGE.some((c) => b.classList.contains(c)));
  const isoOf = (b) => b.dataset.date;
  let start = marked.find((b) => b.classList.contains("oc-calendar-day--range-start"))?.dataset.date ?? (marked[0] && isoOf(marked[0]));
  let end = marked.find((b) => b.classList.contains("oc-calendar-day--range-end"))?.dataset.date ?? (mode === "range" && marked.length > 1 ? isoOf(marked[marked.length - 1]) : undefined);

  const paint = () => {
    // Two months side by side show some dates twice (as a grey outside day in the other month): only the real day
    // is painted.
    const inMonth = new Set([...root.querySelectorAll(DAY)].filter((b) => !b.classList.contains("oc-calendar-day--outside")).map((b) => b.dataset.date));
    for (const b of root.querySelectorAll(DAY)) {
      const twin = b.classList.contains("oc-calendar-day--outside") && inMonth.has(b.dataset.date);
      const s = twin ? { selected: false, cls: [] } : dayState(b.dataset.date, start, mode === "range" ? end : undefined);
      b.classList.remove(...RANGE);
      b.classList.add(...s.cls);
      if (s.selected) b.setAttribute("aria-selected", "true");
      else b.removeAttribute("aria-selected");
    }
    for (const out of root.querySelectorAll("[data-oc-calendar-summary]")) {
      if (!start) break;
      const fmt = fmtFor(out);
      const tpl = out.dataset.template || (mode === "range" ? "{start} – {end}" : "{date}");
      const days = end ? Math.round((toDate(end) - toDate(start)) / 86400000) + 1 : 1;
      out.textContent = tpl.replace("{date}", fmt.format(toDate(start))).replace("{start}", fmt.format(toDate(start))).replace("{end}", end ? fmt.format(toDate(end)) : "…").replace("{days}", String(days));
    }
    const field = root.querySelector("input[data-oc-calendar-value]");
    if (field && start) field.value = mode === "range" ? `${start}/${end ?? ""}` : start;
  };

  const pick = (iso) => {
    if (mode === "single") { start = iso; end = undefined; }
    else if (!start || end) { start = iso; end = undefined; }
    else if (iso < start) { end = start; start = iso; }
    else end = iso;
    paint();
    const detail = mode === "single" ? { mode, date: start } : { mode, start, end };
    root.dispatchEvent(new CustomEvent("oc-calendar-change", { bubbles: true, detail }));
  };

  const onClick = (e) => {
    // Presets: a button with data-oc-calendar-days="1" picks the day that many days after today (the --today day of
    // the calendar, else the real today).
    const preset = e.target.closest("[data-oc-calendar-days]");
    if (preset && root.contains(preset)) {
      const today = root.querySelector(".oc-calendar-day--today")?.dataset.date ?? toIso(new Date());
      const iso = shiftDate(today, Number(preset.dataset.ocCalendarDays) || 0);
      if (mode === "range") { start = undefined; end = undefined; }
      pick(iso);
      return;
    }
    const b = e.target.closest(DAY);
    if (!b || !root.contains(b) || b.disabled) return;
    pick(b.dataset.date);
    // A date picker: the calendar sits in a popover; a complete choice closes it (single: the day, range: the end).
    if (mode === "single" || end) closePicker(root);
  };
  const onKey = (e) => {
    const b = e.target.closest(DAY);
    if (!b || !root.contains(b)) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    let target;
    if (step) target = shiftDate(b.dataset.date, step);
    else if (e.key === "Home" || e.key === "End") {
      const dow = (toDate(b.dataset.date).getDay() + 6) % 7; // Monday = 0
      target = shiftDate(b.dataset.date, e.key === "Home" ? -dow : 6 - dow);
    } else return;
    const next = days().find((x) => x.dataset.date === target);
    if (!next) return;
    e.preventDefault();
    for (const x of days()) x.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  };

  // One day in the tab order: the chosen one, else today, else the first day of the month.
  const first = days().find((b) => b.getAttribute("aria-selected") === "true") ?? days().find((b) => b.classList.contains("oc-calendar-day--today")) ?? days().find((b) => !b.classList.contains("oc-calendar-day--outside"));
  for (const b of days()) b.tabIndex = b === first ? 0 : -1;

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  paint();
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKey);
    delete root.dataset.ocBound;
  };
}

/** Starts every [data-oc-calendar] under `scope`. */
export function initCalendar(scope = document) {
  return [...scope.querySelectorAll("[data-oc-calendar]")].map(bindCalendar);
}

// Starts on its own as /js/oc-calendar.js (`npx omniaui copy-js calendar`), with ?auto in the URL or data-oc-auto on the
// tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-calendar") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initCalendar(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
