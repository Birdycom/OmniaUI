// File: public/js/oc-icons-search.js
// Icon pages of the OmniaUI site: the search box look (magnifier, clear button, Escape clears) for every .oci-search,
// one search over all six webicon sets in [data-oci-search-all], and the active category in the sidebar.
// The result tiles are .oci-item, so a click opens the same code toolbar as everywhere (public/js/oc-icons.js).
// Map: sets -> search box (clear) -> load the sets once -> rank names -> render chips and results -> sidebar category
(function () {
  "use strict";

  var SETS = [
    { id: "mdi", title: "MDI", file: "mdi-collection.json" },
    { id: "mdi-light", title: "MDI Light", file: "mdi-light-icons.json" },
    { id: "material-symbols", title: "Material Symbols", file: "material-symbols-collection.json" },
    { id: "svg-spinners", title: "SVG Spinners", file: "svg-spinners-collection.json" },
    { id: "flag", title: "Flags", file: "flag-collection.json" },
    { id: "vscode-icons", title: "VSCode Icons", file: "vscode-icons-collection.json" }
  ];
  var LIMIT = 240;

  /* ---- Search box: the clear button shows while there is text; Escape clears ---- */
  function wireBox(box) {
    var input = box.querySelector("input");
    var clear = box.querySelector(".oci-search__clear");
    if (!input || !clear || box.hasAttribute("data-wired")) return;
    box.setAttribute("data-wired", "");
    var sync = function () { clear.hidden = input.value === ""; };
    input.addEventListener("input", sync);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && input.value) { e.preventDefault(); reset(); }
    });
    clear.addEventListener("click", reset);
    function reset() {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
    sync();
  }
  document.querySelectorAll(".oci-search").forEach(wireBox);

  /* ---- All names per set, loaded once (about 1 MB in all, so only when somebody searches) ---- */
  var loading = null;
  function loadSets() {
    if (loading) return loading;
    loading = Promise.all(SETS.map(function (set) {
      return fetch("/data/" + set.file)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data) return { set: set, names: [] };
          if (Array.isArray(data)) return { set: set, names: data };
          var names = new Set(data.uncategorized || []);
          Object.values(data.categories || {}).forEach(function (list) { list.forEach(function (n) { names.add(n); }); });
          Object.keys(data.aliases || {}).forEach(function (n) { names.add(n); });
          return { set: set, names: Array.from(names) };
        })
        .catch(function () { return { set: set, names: [] }; });
    }));
    return loading;
  }

  /* Exact name first, then names that start with the query, then the rest; shorter names first. */
  function rank(name, q, words) {
    for (var i = 0; i < words.length; i++) if (name.indexOf(words[i]) === -1) return -1;
    if (name === q) return 0;
    if (name.indexOf(q) === 0) return 1;
    if (name.indexOf("-" + words[0]) !== -1) return 2;
    return 3;
  }

  function mountSearchAll(root) {
    root.innerHTML =
      '<div class="oci-search oci-search--lg">' +
      '<iconify-icon icon="mdi:magnify" class="oci-search__icon" aria-hidden="true"></iconify-icon>' +
      '<input type="search" class="oc-input" placeholder="Search all webicons: home, arrow, pdf, spinner, be…" aria-label="Search all webicons" autocomplete="off">' +
      '<button type="button" class="oci-search__clear" aria-label="Clear search" hidden><iconify-icon icon="mdi:close" aria-hidden="true"></iconify-icon></button>' +
      "</div>" +
      '<div class="oci-sets" role="group" aria-label="Icon set" hidden></div>' +
      '<p class="oci-search-status" role="status"></p>' +
      '<div class="oci-grid oci-search-results"></div>';
    var box = root.querySelector(".oci-search");
    var input = root.querySelector("input");
    var chips = root.querySelector(".oci-sets");
    var status = root.querySelector(".oci-search-status");
    var grid = root.querySelector(".oci-search-results");
    var only = "";
    var timer = 0;
    wireBox(box);

    input.addEventListener("focus", loadSets, { once: true });
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(run, 120);
    });
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-set]");
      if (!b) return;
      only = b.getAttribute("data-set");
      run();
    });

    function run() {
      var q = input.value.trim().toLowerCase().replace(/\s+/g, "-");
      if (q.length < 2) {
        grid.replaceChildren();
        chips.hidden = true;
        status.textContent = q ? "Type at least 2 letters." : "";
        return;
      }
      var words = q.split("-").filter(Boolean);
      status.textContent = "Searching…";
      loadSets().then(function (sets) {
        if (input.value.trim().toLowerCase().replace(/\s+/g, "-") !== q) return;
        var hits = [];
        var perSet = {};
        sets.forEach(function (entry) {
          var count = 0;
          entry.names.forEach(function (name) {
            var r = rank(name, q, words);
            if (r < 0) return;
            count++;
            if (!only || only === entry.set.id) hits.push({ set: entry.set, name: name, r: r });
          });
          perSet[entry.set.id] = count;
        });
        hits.sort(function (a, b) { return a.r - b.r || a.name.length - b.name.length || a.name.localeCompare(b.name); });
        var total = Object.keys(perSet).reduce(function (sum, id) { return sum + perSet[id]; }, 0);
        renderChips(perSet, total);
        var shown = hits.slice(0, LIMIT);
        grid.replaceChildren.apply(grid, shown.map(function (hit) {
          var div = document.createElement("div");
          div.className = "oci-item" + (hit.set.id === "mdi-light" ? " oci-item--light" : "");
          div.setAttribute("data-name", hit.name);
          div.setAttribute("data-family", hit.set.id);
          div.innerHTML = '<iconify-icon icon="' + hit.set.id + ":" + hit.name + '" class="size-7" height="unset" aria-hidden="true"></iconify-icon>' +
            '<span class="oci-name">' + hit.name + '</span><span class="oci-set">' + hit.set.title + "</span>";
          return div;
        }));
        status.textContent = hits.length === 0
          ? "No webicon matches “" + input.value.trim() + "”."
          : hits.length > LIMIT
            ? "Showing the best " + LIMIT + " of " + hits.length + " icons; type more to narrow it down."
            : hits.length + (hits.length === 1 ? " icon" : " icons") + ". Click one for its code.";
      });
    }

    function renderChips(perSet, total) {
      chips.hidden = false;
      var make = function (id, label, n) {
        return '<button type="button" class="oci-set-chip" data-set="' + id + '" aria-pressed="' + (only === id) + '"' + (n === 0 && id ? " disabled" : "") + ">" +
          label + ' <span class="oci-set-chip__count">' + n + "</span></button>";
      };
      chips.innerHTML = make("", "All sets", total) + SETS.map(function (set) { return make(set.id, set.title, perSet[set.id] || 0); }).join("");
    }
  }
  document.querySelectorAll("[data-oci-search-all]").forEach(mountSearchAll);

  /* ---- Sidebar: every category page is category.html?c=<slug>, so mark the link of this slug ---- */
  var slug = new URLSearchParams(location.search).get("c");
  if (slug && /\/icons\/catalog\/category/.test(location.pathname)) {
    document.querySelectorAll('.oc-sidebar a[href*="category?c="], .oc-sidebar a[href*="category.html?c="]').forEach(function (a) {
      var match = new URL(a.href, location.href).searchParams.get("c") === slug;
      if (match) {
        a.setAttribute("aria-current", "page");
        a.setAttribute("data-ocd-active", "true");
        // Scroll only the sidebar (not the page) so the active category is in view.
        var box = a.parentElement;
        while (box && box !== document.body && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
        if (box && box !== document.body) box.scrollTop += a.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2;
      } else if (a.getAttribute("data-ocd-active") === "true") {
        a.removeAttribute("aria-current");
        a.removeAttribute("data-ocd-active");
      }
    });
  }
})();
