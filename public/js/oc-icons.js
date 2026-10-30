// File: public/js/oc-icons.js
// Icon pages of the OmniaUI site (ui/icons/catalog, catalog/category, settings): click a tile (.oci-item) for a toolbar
// to use that icon — size, color, label, code format, copy. Tiles made later (category page) work too (delegation).
// Map: options + remembered choice -> tile helpers -> toolbar markup -> code -> place, open, close -> events
(function () {
  "use strict";

  var SIZES = [4, 5, 6, 8, 10, 12];
  // Keep in step with the "Colors" demo on settings.html: the on-demand site CSS only has utilities used in a page.
  var COLORS = ["", "text-blue-60", "text-green-60", "text-orange-60", "text-red-60", "text-violet-60"];
  var FORMATS = { html: "HTML", react: "React", vue: "Vue", name: "Name" };
  var KEY = "oc-icons-toolbar";

  var state = { size: 6, color: "", label: false, format: "html" };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  function remember() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---- Tiles ---- */
  function iconOf(tile) {
    // <iconify-icon icon="…"> (web component); the older <span class="iconify" data-icon="…"> still reads.
    var el = tile.querySelector("iconify-icon[icon], [data-icon]");
    return el ? el.getAttribute("icon") || el.getAttribute("data-icon") : "";
  }
  function words(icon) {
    var name = icon.split(":").pop().replace(/-4x3$/, "").replace(/-/g, " ");
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  function enhance(tile) {
    if (tile.hasAttribute("tabindex")) return;
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-haspopup", "dialog");
    tile.setAttribute("aria-expanded", "false");
    tile.setAttribute("aria-label", iconOf(tile) + ", options");
  }
  document.querySelectorAll(".oci-item").forEach(enhance);
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches(".oci-item")) enhance(n);
        n.querySelectorAll(".oci-item").forEach(enhance);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  /* ---- Toolbar ---- */
  var bar = document.createElement("div");
  bar.className = "oci-tb";
  bar.hidden = true;
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Use this icon");
  bar.innerHTML =
    '<div class="oci-tb__head"><span class="oci-tb__preview"></span>' +
    '<span class="oci-tb__title"><span class="oci-tb__name"></span><span class="oci-tb__set"></span></span>' +
    '<button type="button" class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--xs oci-tb__close" aria-label="Close">✕</button></div>' +
    row("Size", "size", SIZES.map(function (n) { return '<button type="button" data-v="' + n + '">' + n + "</button>"; }).join("")) +
    row("Color", "color", COLORS.map(function (c) {
      return '<button type="button" data-v="' + c + '" aria-label="' + (c || "Inherit") + '" title="' + (c || "Inherit (currentColor)") + '">' +
        '<span class="oci-tb__dot ' + (c || "oci-tb__dot--inherit") + '"></span></button>';
    }).join(""), "oci-tb__seg--colors") +
    row("Use", "label", '<button type="button" data-v="0">Decorative</button><button type="button" data-v="1">With label</button>') +
    row("Code", "format", Object.keys(FORMATS).map(function (f) { return '<button type="button" data-v="' + f + '">' + FORMATS[f] + "</button>"; }).join("")) +
    '<pre class="oci-tb__code"><code></code></pre>' +
    '<div class="oci-tb__foot"><span class="oci-tb__status" aria-live="polite"></span>' +
    '<button type="button" class="oc-btn oc-btn--sm oci-tb__copy">Copy</button></div>';
  document.body.appendChild(bar);

  function row(label, opt, buttons, extra) {
    return '<div class="oci-tb__row"><span class="oci-tb__label">' + label + "</span>" +
      '<div class="oci-tb__seg ' + (extra || "") + '" data-opt="' + opt + '" role="group" aria-label="' + label + '">' + buttons + "</div></div>";
  }

  var tile = null;
  var icon = "";
  var q = function (s) { return bar.querySelector(s); };

  /* ---- Code ---- */
  function code() {
    var cls = ["size-" + state.size, state.color].filter(Boolean).join(" ");
    var a11y = state.label ? 'role="img" aria-label="' + words(icon) + '"' : 'aria-hidden="true"';
    if (state.format === "name") return icon;
    if (state.format === "react") {
      return 'import { Icon } from "@iconify/react";\n\n<Icon icon="' + icon + '" className="' + cls + '" ' + a11y + " />";
    }
    if (state.format === "vue") {
      return 'import { Icon } from "@iconify/vue";\n\n<Icon icon="' + icon + '" class="' + cls + '" ' + a11y + " />";
    }
    return '<iconify-icon icon="' + icon + '" class="' + cls + '" height="unset" ' + a11y + "></iconify-icon>";
  }

  function render() {
    bar.querySelectorAll("[data-opt]").forEach(function (seg) {
      var opt = seg.getAttribute("data-opt");
      var cur = opt === "label" ? (state.label ? "1" : "0") : String(state[opt]);
      seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === cur)); });
    });
    var preview = q(".oci-tb__preview");
    preview.textContent = "";
    if (icon) {
      var el = document.createElement("iconify-icon");
      el.setAttribute("icon", icon);
      el.setAttribute("height", "unset");
      el.setAttribute("aria-hidden", "true");
      el.className = ["size-" + Math.min(state.size, 12), state.color].filter(Boolean).join(" ");
      preview.appendChild(el);
    }
    q(".oci-tb__name").textContent = icon;
    q(".oci-tb__set").textContent = "Set: " + icon.split(":")[0];
    q(".oci-tb__code code").textContent = code();
    q(".oci-tb__status").textContent = "";
  }

  /* ---- Place, open, close ---- */
  function place() {
    if (!tile) return;
    // Between the fixed top bar and footer: below the tile when it fits, else above; when neither fits, the
    // larger side and the toolbar scrolls.
    var r = tile.getBoundingClientRect();
    var gap = 8;
    var minTop = edge(".oc-topbar", "bottom", 0) + gap;
    var maxBottom = edge(".oc-footerbar--fixed", "top", innerHeight) - gap;
    bar.style.maxHeight = "";
    var w = bar.offsetWidth, h = bar.offsetHeight;
    var below = maxBottom - r.bottom - gap, above = r.top - gap - minTop;
    var down = h <= below || (h > above && below >= above);
    if (h > (down ? below : above)) bar.style.maxHeight = (down ? below : above) + "px";
    h = Math.min(h, down ? below : above);
    bar.style.top = (down ? r.bottom + gap : r.top - gap - h) + "px";
    bar.style.left = Math.min(Math.max(gap, r.left + r.width / 2 - w / 2), innerWidth - w - gap) + "px";
  }
  function edge(sel, side, fallback) {
    var el = document.querySelector(sel);
    return el ? el.getBoundingClientRect()[side] : fallback;
  }
  function open(t) {
    if (tile === t) { close(true); return; }
    if (tile) tile.setAttribute("aria-expanded", "false");
    tile = t;
    icon = iconOf(t);
    tile.setAttribute("aria-expanded", "true");
    render();
    bar.hidden = false;
    // No room above or below: scroll the tile up first, so the whole toolbar fits under it.
    var r = t.getBoundingClientRect(), h = bar.offsetHeight;
    var room = edge(".oc-footerbar--fixed", "top", innerHeight) - edge(".oc-topbar", "bottom", 0) - 32;
    if (h + r.height <= room && h > r.top - edge(".oc-topbar", "bottom", 0) - 16 && h > edge(".oc-footerbar--fixed", "top", innerHeight) - r.bottom - 16) {
      t.style.scrollMarginTop = edge(".oc-topbar", "bottom", 0) + 16 + "px";
      t.scrollIntoView({ block: "start" });
    }
    place();
    q(".oci-tb__copy").focus({ preventScroll: true });
  }
  function close(focusTile) {
    if (!tile) return;
    var t = tile;
    tile = null;
    bar.hidden = true;
    t.setAttribute("aria-expanded", "false");
    if (focusTile) t.focus({ preventScroll: true });
  }

  /* ---- Events ---- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".oci-item");
    if (t && !bar.contains(e.target)) { open(t); return; }
    if (tile && !bar.contains(e.target)) close(false);
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target.closest && e.target.closest(".oci-item");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(t); return; }
    if (e.key === "Escape" && tile) { e.preventDefault(); close(true); }
  });
  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.classList.contains("oci-tb__close")) { close(true); return; }
    if (b.classList.contains("oci-tb__copy")) {
      var text = code();
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
        .then(function () { q(".oci-tb__status").textContent = "Copied"; b.textContent = "Copied"; })
        .catch(function () { q(".oci-tb__status").textContent = "Select the code and copy it"; })
        .finally(function () { setTimeout(function () { b.textContent = "Copy"; }, 1400); });
      return;
    }
    var seg = b.closest("[data-opt]");
    if (!seg) return;
    var opt = seg.getAttribute("data-opt"), v = b.getAttribute("data-v");
    state[opt] = opt === "size" ? Number(v) : opt === "label" ? v === "1" : v;
    remember();
    render();
    place();
  });
  // Follow the tile while the page (or the docs content pane) scrolls; close when it leaves the screen.
  addEventListener("scroll", function (e) {
    if (!tile || bar.contains(e.target)) return;
    var r = tile.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) close(false); else place();
  }, { capture: true, passive: true });
  addEventListener("resize", place);
})();
