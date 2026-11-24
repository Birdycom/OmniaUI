// File: packages/ui/src/combobox.js
// Map: label/value of an option -> filter -> option markup from data (setOptions) -> active option (arrows, Home/End)
//      -> choose (Enter, click; clear and custom rows) -> server search (event or URL, debounced) -> portal (list in body)
//      -> open/close -> bind one .oc-combobox -> init every [data-oc-combobox] -> boot
// Behaviour for the CSS combobox (.oc-combobox) in plain HTML and Blade: typing filters the list, the arrow keys move
// the active option (aria-activedescendant), Enter or a click chooses, Escape closes. The chosen option gets
// aria-selected, its label goes into the field and its icon (.oc-combobox-option-icon, or its image / emoji) into the
// field's .oc-combobox-icon. A hidden input in the wrapper (input[type=hidden]) gets the option's data-value, for forms.
// Catalog mode (0.17.0), all optional, on the wrapper:
//   data-oc-search="event"        no local filter; event oc-combobox-search { query } (debounced, loading row on); answer with root.ocSetOptions(items, query)
//   data-oc-search-url="/x?q="    no local filter; fetches url + query, JSON [{ value, label, description, icon, image, emoji, disabled }]
//   data-oc-search-delay="250"    debounce in ms
//   data-oc-portal                the list floats above everything (position: fixed under the field). 0.18.0: where the
//                                 browser has popovers the list stays in place as popover="manual" in the top layer, so
//                                 it also works inside a modal <dialog> (body content is inert there); elsewhere it moves
//                                 to document.body while open
//   li.oc-combobox-clear          a row with data-value="" that clears the choice
//   li.oc-combobox-custom         a row that takes what was typed (data-oc-custom-label='Use "{query}"'), shown when nothing matches exactly
//   .oc-combobox-footer > a       a manage link under the list (event oc-combobox-manage)
// Events on the wrapper: oc-combobox-change { value, label, custom }, oc-combobox-search { query }, oc-combobox-manage.

const OPTION = ".oc-combobox-option";
const VISUAL = ".oc-combobox-option-icon, .oc-combobox-option-image, .oc-combobox-option-emoji";

/** Text label of an option (without the icon, image, emoji or description). */
export function optionLabel(option) {
  const own = option.querySelector(".oc-combobox-option-label");
  if (own) return own.textContent.trim();
  return [...option.childNodes].filter((n) => !(n.nodeType === 1 && n.matches(VISUAL))).map((n) => n.textContent).join("").trim();
}

/** Value of an option: data-value, else its label. */
export function optionValue(option) {
  return option.dataset.value ?? optionLabel(option);
}

/** True when the label contains the query (case and accents ignored). */
export function matches(label, query) {
  return fold(label).includes(fold(query).trim());
}
const fold = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** One <li class="oc-combobox-option"> from data: { value, label, description, icon, image, emoji, disabled }. */
export function optionElement(item, doc = document) {
  const li = doc.createElement("li");
  li.className = "oc-combobox-option";
  li.setAttribute("role", "option");
  li.tabIndex = -1;
  li.dataset.value = String(item.value ?? item.label ?? "");
  li.setAttribute("aria-selected", "false");
  if (item.disabled) li.setAttribute("aria-disabled", "true");
  if (item.icon) {
    const span = doc.createElement("span");
    span.className = "oc-combobox-option-icon";
    span.setAttribute("aria-hidden", "true");
    const icon = doc.createElement("iconify-icon");
    icon.setAttribute("icon", String(item.icon));
    icon.setAttribute("aria-hidden", "true");
    span.append(icon);
    li.append(span);
  } else if (item.image) {
    const img = doc.createElement("img");
    img.className = "oc-combobox-option-image";
    img.src = String(item.image);
    img.alt = "";
    li.append(img);
  } else if (item.emoji) {
    const span = doc.createElement("span");
    span.className = "oc-combobox-option-emoji";
    span.setAttribute("aria-hidden", "true");
    span.textContent = String(item.emoji);
    li.append(span);
  }
  if (item.description) {
    const text = doc.createElement("span");
    text.className = "oc-combobox-option-text";
    const label = doc.createElement("span");
    label.className = "oc-combobox-option-label";
    label.textContent = String(item.label ?? "");
    const desc = doc.createElement("span");
    desc.className = "oc-combobox-option-description";
    desc.textContent = String(item.description);
    text.append(label, desc);
    li.append(text);
  } else li.append(doc.createTextNode(String(item.label ?? "")));
  return li;
}

/** Markup for the field icon of an option: its icon, image or emoji (empty when it has none). */
function visualHtml(option) {
  const icon = option.querySelector(":scope > .oc-combobox-option-icon");
  if (icon) return icon.innerHTML;
  const other = option.querySelector(":scope > .oc-combobox-option-image, :scope > .oc-combobox-option-emoji");
  return other ? other.outerHTML : null;
}

let uid = 0;

/** Starts one .oc-combobox. Returns a function that stops it. */
export function bindCombobox(root) {
  const input = root.querySelector(".oc-combobox-input");
  const popup = root.querySelector(":scope > .oc-combobox-list") ?? root.querySelector(".oc-combobox-list");
  if (!input || !popup || root.dataset.ocBound != null) return () => {};
  const list = popup.matches('[role="listbox"]') ? popup : popup.querySelector('[role="listbox"]') ?? popup;
  root.dataset.ocBound = "";
  const doc = root.ownerDocument;
  const win = doc.defaultView ?? globalThis;
  // data-oc-fixed on the icon slot (0.17.2, an icon-only trigger with a code such as "NL"): the slot keeps its content.
  const slot = root.querySelector(":scope > .oc-combobox-icon:not([data-oc-fixed])");
  const placeholderIcon = slot ? slot.innerHTML : "";
  const hidden = root.querySelector(':scope > input[type="hidden"]');
  const empty = list.querySelector(".oc-combobox-empty");
  const custom = list.querySelector(".oc-combobox-custom");
  const customTemplate = custom?.dataset.ocCustomLabel || 'Use "{query}"';
  const searchUrl = root.dataset.ocSearchUrl;
  const remote = root.dataset.ocSearch != null || searchUrl != null;
  const delay = Number(root.dataset.ocSearchDelay ?? 250);
  const portal = root.dataset.ocPortal != null;
  const options = () => [...list.querySelectorAll(OPTION)];
  const plain = () => options().filter((o) => !o.matches(".oc-combobox-clear, .oc-combobox-custom"));
  const enabled = () => options().filter((o) => !o.hidden && o.getAttribute("aria-disabled") !== "true");
  const ids = () => options().forEach((o) => { if (!o.id) o.id = `oc-combobox-option-${++uid}`; });
  ids();

  // Portal. 0.18.0: with popover support the popup stays in the wrapper as popover="manual" and is shown in the top
  // layer (fixed to the viewport, above a modal dialog, not cut off by a transformed or clipping parent). A manual
  // popover has no light dismiss: blur and Escape close it below. Without popover support the popup leaves the wrapper
  // while open and comes back when it closes (a marker keeps its place).
  const topLayer = portal && typeof popup.showPopover === "function";
  if (topLayer) {
    popup.setAttribute("popover", "manual");
    popup.classList.add("oc-combobox-list--portal");
    if (root.dataset.module) popup.dataset.module = root.dataset.module;
  }
  const marker = portal && !topLayer ? doc.createComment("oc-combobox-list") : null;
  const place = () => {
    const r = root.getBoundingClientRect();
    // A header (or icon-only) trigger is narrow (0.17.2): the list gets at least 12rem and stays inside the viewport.
    const header = root.classList.contains("oc-combobox--header");
    const width = header ? Math.max(r.width, 192) : r.width;
    const left = header ? Math.max(8, Math.min(r.left, (win.innerWidth || width + 16) - width - 8)) : r.left;
    Object.assign(popup.style, { position: "fixed", top: `${r.bottom + 4}px`, left: `${left}px`, width: `${width}px` });
  };
  // While open the list follows the field: scroll and resize, and (0.18.0) every frame during the first second, so it
  // keeps up with a sheet or drawer that is still sliding in (a dialog focuses the field before its panel has arrived).
  let following = false;
  let frame = 0;
  let last = "";
  let until = 0;
  const track = (now) => {
    const r = root.getBoundingClientRect();
    const key = `${r.left},${r.bottom},${r.width}`;
    if (key !== last) { last = key; place(); }
    if (!until) until = now + 1000;
    if (now < until) frame = win.requestAnimationFrame(track);
  };
  const follow = (on) => {
    if (on === following) return;
    following = on;
    const fn = on ? "addEventListener" : "removeEventListener";
    win[fn]("scroll", place, true);
    win[fn]("resize", place);
    if (typeof win.requestAnimationFrame !== "function") return;
    if (on) { last = ""; until = 0; frame = win.requestAnimationFrame(track); }
    else win.cancelAnimationFrame(frame);
  };
  const shown = () => { try { return popup.matches(":popover-open"); } catch { return false; } };
  const showPortal = (open) => {
    if (!portal) return;
    if (topLayer) {
      if (open) {
        place();
        try { if (!shown()) popup.showPopover(); } catch { /* not connected */ }
        popup.dataset.open = "";
      } else {
        popup.dataset.open = "false";
        try { if (shown()) popup.hidePopover(); } catch { /* already closed */ }
      }
      follow(open);
      return;
    }
    if (open) {
      if (popup.parentNode !== doc.body) {
        popup.before(marker);
        popup.classList.add("oc-combobox-list--portal");
        if (root.dataset.module) popup.dataset.module = root.dataset.module;
        doc.body.append(popup);
        follow(true);
      }
      place();
      popup.dataset.open = "";
    } else if (popup.parentNode === doc.body) {
      popup.dataset.open = "false";
      marker.replaceWith(popup);
      follow(false);
    } else popup.dataset.open = "false";
  };

  const focused = () => root.contains(doc.activeElement);
  const setOpen = (open) => {
    if (open) root.removeAttribute("data-open");
    else root.dataset.open = "false";
    input.setAttribute("aria-expanded", String(open && focused()));
    showPortal(open && focused());
  };
  const setActive = (option) => {
    options().forEach((o) => o.toggleAttribute("data-active", o === option));
    if (option) {
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView?.({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  };
  const setLoading = (on) => {
    list.toggleAttribute("aria-busy", on);
    if (on) list.setAttribute("aria-busy", "true");
    let row = list.querySelector(".oc-combobox-loading");
    if (on && !row) {
      row = doc.createElement("li");
      row.className = "oc-combobox-loading";
      row.setAttribute("role", "presentation");
      row.textContent = root.dataset.ocLoadingText || "Loading...";
      list.append(row);
    }
    if (row) row.hidden = !on;
    if (on && empty) empty.hidden = true;
  };
  const updateCustom = (q) => {
    if (!custom) return false;
    const query = q.trim();
    const show = query !== "" && !plain().some((o) => fold(optionLabel(o)) === fold(query));
    custom.hidden = !show;
    custom.dataset.value = query;
    custom.textContent = customTemplate.replace("{query}", query);
    return show;
  };
  const filter = () => {
    const q = input.value;
    let shown = 0;
    plain().forEach((o) => { o.hidden = remote ? false : !matches(optionLabel(o), q); if (!o.hidden) shown++; });
    const withCustom = updateCustom(q);
    if (empty) empty.hidden = shown > 0 || withCustom || list.getAttribute("aria-busy") === "true";
    if (slot && !q) slot.innerHTML = placeholderIcon;
    setActive(enabled().find((o) => !o.matches(".oc-combobox-clear")) ?? null);
  };
  const choose = (option) => {
    if (!option || option.getAttribute("aria-disabled") === "true") return;
    const isClear = option.matches(".oc-combobox-clear");
    const isCustom = option.matches(".oc-combobox-custom");
    options().forEach((o) => o.setAttribute("aria-selected", String(o === option && !isClear)));
    const value = isClear ? "" : isCustom ? option.dataset.value ?? "" : optionValue(option);
    const label = isClear ? "" : isCustom ? value : optionLabel(option);
    input.value = label;
    if (hidden) hidden.value = value;
    if (slot) slot.innerHTML = (!isClear && !isCustom && visualHtml(option)) || placeholderIcon;
    plain().forEach((o) => { o.hidden = false; });
    if (custom) custom.hidden = true;
    if (empty) empty.hidden = true;
    setOpen(false);
    root.dispatchEvent(new win.CustomEvent("oc-combobox-change", { bubbles: true, detail: { value, label, custom: isCustom } }));
  };

  /** Replaces the plain options with new ones from data (server search results). With `query`, an answer for an older
   *  question than what is in the field now is dropped. */
  const setOptions = (items, query) => {
    if (query != null && query !== input.value) return;
    plain().forEach((o) => o.remove());
    const before = custom ?? empty ?? list.querySelector(".oc-combobox-loading");
    const current = hidden?.value;
    for (const item of items ?? []) {
      const li = optionElement(item, doc);
      if (current != null && current !== "" && li.dataset.value === current) li.setAttribute("aria-selected", "true");
      if (before && before.parentNode === list) list.insertBefore(li, before);
      else list.append(li);
    }
    ids();
    setLoading(false);
    filter();
  };
  root.ocSetOptions = setOptions;

  // Server search, debounced; an older answer that arrives after a newer question is dropped.
  let timer;
  let asked = 0;
  const search = () => {
    clearTimeout(timer);
    const query = input.value;
    timer = setTimeout(async () => {
      const ticket = ++asked;
      if (!searchUrl) {
        // The listener answers with root.ocSetOptions(items, query); that also ends the loading row.
        setLoading(true);
        root.dispatchEvent(new win.CustomEvent("oc-combobox-search", { bubbles: true, detail: { query } }));
        return;
      }
      setLoading(true);
      try {
        const url = searchUrl + encodeURIComponent(query);
        const init = { headers: { Accept: "application/json" } };
        const res = await (win.fetch ? win.fetch(url, init) : fetch(url, init));
        const items = await res.json();
        if (ticket === asked) setOptions(Array.isArray(items) ? items : items?.data ?? []);
      } catch {
        if (ticket === asked) setLoading(false);
      }
    }, delay);
  };

  const onInput = () => {
    setOpen(true);
    if (remote) { search(); updateCustom(input.value); }
    filter();
  };
  const onKey = (e) => {
    const items = enabled();
    const at = items.findIndex((o) => o.hasAttribute("data-active"));
    const move = (i) => { setOpen(true); setActive(items[(i + items.length) % items.length] ?? null); e.preventDefault(); };
    if (e.key === "ArrowDown") move(root.dataset.open === "false" ? Math.max(at, 0) : at + 1);
    else if (e.key === "ArrowUp") move(at <= 0 ? items.length - 1 : at - 1);
    else if (e.key === "Home" && root.dataset.open !== "false") move(0);
    else if (e.key === "End" && root.dataset.open !== "false") move(items.length - 1);
    else if (e.key === "Enter" && at >= 0 && root.dataset.open !== "false") { e.preventDefault(); choose(items[at]); }
    else if (e.key === "Escape" && root.dataset.open !== "false") { e.preventDefault(); setOpen(false); }
  };
  const onClickInput = () => { if (root.dataset.open === "false") setOpen(true); };
  // A press in the list (an option, the scrollbar, the footer) keeps the focus in the field; a link still follows its click.
  const onDown = (e) => e.preventDefault();
  const onClick = (e) => {
    const link = e.target.closest(".oc-combobox-footer a");
    if (link) {
      root.dispatchEvent(new win.CustomEvent("oc-combobox-manage", { bubbles: true, detail: { href: link.getAttribute("href") } }));
      setOpen(false);
      return;
    }
    choose(e.target.closest(OPTION));
  };
  const onFocus = () => {
    input.setAttribute("aria-expanded", String(root.dataset.open !== "false"));
    if (root.dataset.open !== "false") showPortal(true);
  };
  const onBlur = (e) => {
    if (root.contains(e.relatedTarget) || popup.contains(e.relatedTarget)) return;
    input.setAttribute("aria-expanded", "false");
    root.removeAttribute("data-open");
    showPortal(false);
    setActive(null);
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKey);
  input.addEventListener("click", onClickInput);
  popup.addEventListener("mousedown", onDown);
  popup.addEventListener("click", onClick);
  root.addEventListener("focusin", onFocus);
  root.addEventListener("focusout", onBlur);
  const chosen = options().find((o) => o.getAttribute("aria-selected") === "true");
  if (chosen && slot) slot.innerHTML = visualHtml(chosen) ?? placeholderIcon;
  if (custom) custom.hidden = true;
  return () => {
    clearTimeout(timer);
    showPortal(false);
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", onKey);
    input.removeEventListener("click", onClickInput);
    popup.removeEventListener("mousedown", onDown);
    popup.removeEventListener("click", onClick);
    root.removeEventListener("focusin", onFocus);
    root.removeEventListener("focusout", onBlur);
    delete root.ocSetOptions;
    delete root.dataset.ocBound;
  };
}

/** Starts every .oc-combobox[data-oc-combobox] in scope. Returns a function that stops them. */
export function initCombobox(scope = document) {
  const stops = [...scope.querySelectorAll(".oc-combobox[data-oc-combobox]")].map(bindCombobox);
  return () => stops.forEach((stop) => stop());
}

// Starts on its own as /js/oc-combobox.js (`npx omniaui copy-js combobox`), with ?auto in the URL or data-oc-auto on
// the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-combobox") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initCombobox(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
