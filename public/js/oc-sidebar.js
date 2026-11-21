// File: packages/ui/src/sidebar.js
// Map: storage key -> read / write the remembered state -> bind one provider (sidebars, triggers, rails, mobile overlay,
//      shortcut, oc-sidebar-change) -> init all -> boot
// Sidebar provider for plain HTML, Blade and Livewire (0.17.0). Markup:
//   <div class="oc-sidebar-provider" data-oc-sidebar-provider data-oc-persist="app">
//     <aside class="oc-sidebar">…</aside>
//     <button class="oc-sidebar-rail" type="button" data-oc-sidebar-rail aria-label="Toggle sidebar"></button>
//     <main class="oc-sidebar-inset"><button data-oc-sidebar-trigger aria-label="Toggle sidebar">…</button> …</main>
//   </div>
// Options on the provider: data-oc-persist (key; remembers the desktop state), data-oc-storage ("local" default or
// "cookie": oc-sidebar-<key>, readable by the server), data-oc-mobile-breakpoint (px, default 768, 0 = never),
// data-oc-shortcut (Ctrl/Cmd + key, default "b", "" = none), data-state="collapsed" (start collapsed).
// Below the breakpoint the sidebar opens over the page (.oc-sidebar--overlay) and starts closed; Escape or a click outside
// closes it. Every change fires oc-sidebar-change { collapsed, mobile } on the provider.

const controllers = new WeakMap();

/** localStorage key `oc-sidebar:<key>` or cookie name `oc-sidebar-<key>`; null without a key. */
export function sidebarStorageKey(key, storage = "local") {
  if (key == null || key === false || key === "") return null;
  const name = key === true ? "default" : String(key);
  return storage === "cookie" ? `oc-sidebar-${name}` : `oc-sidebar:${name}`;
}

function readState(name, storage) {
  if (!name) return undefined;
  try {
    const raw = storage === "cookie"
      ? document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1)
      : window.localStorage.getItem(name);
    return raw === "1" ? true : raw === "0" ? false : undefined;
  } catch {
    return undefined;
  }
}

function writeState(name, storage, collapsed) {
  if (!name) return;
  try {
    if (storage === "cookie") document.cookie = `${name}=${collapsed ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
    else window.localStorage.setItem(name, collapsed ? "1" : "0");
  } catch {
    // Private mode can block storage: the sidebar still works for this visit.
  }
}

/** Wire one provider. Returns { collapsed, isMobile, setCollapsed(bool), toggle() }; calling it again returns the same. */
export function bindSidebarProvider(root) {
  if (!root) return null;
  const known = controllers.get(root);
  if (known) return known;

  const storage = root.dataset.ocStorage === "cookie" ? "cookie" : "local";
  const storeName = sidebarStorageKey(root.dataset.ocPersist, storage);
  const breakpoint = root.dataset.ocMobileBreakpoint == null ? 768 : Number(root.dataset.ocMobileBreakpoint) || 0;
  const shortcut = root.dataset.ocShortcut == null ? "b" : root.dataset.ocShortcut;
  const own = (el) => el.closest("[data-oc-sidebar-provider]") === root;
  const sidebars = () => [...root.querySelectorAll(".oc-sidebar")].filter(own);
  const overlayAlways = new WeakSet(sidebars().filter((s) => s.classList.contains("oc-sidebar--overlay")));

  let desktop = root.dataset.state === "collapsed" || sidebars().some((s) => s.classList.contains("oc-sidebar--collapsed"));
  const saved = readState(storeName, storage);
  if (saved !== undefined) desktop = saved;
  let openMobile = false;
  const mq = breakpoint && typeof window.matchMedia === "function" ? window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`) : null;
  let mobile = !!mq?.matches;

  const state = () => (mobile ? !openMobile : desktop);

  function paint() {
    const collapsed = state();
    root.dataset.state = collapsed ? "collapsed" : "expanded";
    if (mobile) root.dataset.mobile = "";
    else delete root.dataset.mobile;
    for (const sidebar of sidebars()) {
      sidebar.classList.toggle("oc-sidebar--collapsed", collapsed);
      sidebar.classList.toggle("oc-sidebar--overlay", mobile || overlayAlways.has(sidebar));
    }
    root.querySelectorAll("[data-oc-sidebar-trigger]").forEach((btn) => {
      if (own(btn)) btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });
    controller.collapsed = collapsed;
    controller.isMobile = mobile;
  }

  function setCollapsed(next) {
    const before = state();
    if (mobile) openMobile = !next;
    else {
      desktop = !!next;
      writeState(storeName, storage, desktop);
    }
    paint();
    if (before !== state()) root.dispatchEvent(new CustomEvent("oc-sidebar-change", { bubbles: true, detail: { collapsed: state(), mobile } }));
  }

  const controller = { collapsed: false, isMobile: false, setCollapsed, toggle: () => setCollapsed(!state()) };

  root.addEventListener("click", (event) => {
    const hit = event.target.closest?.("[data-oc-sidebar-trigger], [data-oc-sidebar-rail]");
    if (!hit || !own(hit)) return;
    event.preventDefault();
    controller.toggle();
  });

  // Mobile overlay: Escape and a click outside the sidebar close it.
  document.addEventListener("keydown", (event) => {
    if (!root.isConnected) return;
    if (event.key === "Escape" && mobile && openMobile) {
      setCollapsed(true);
      return;
    }
    if (!shortcut || !(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== shortcut.toLowerCase()) return;
    if (event.target?.isContentEditable) return;
    event.preventDefault();
    controller.toggle();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!mobile || !openMobile || !root.isConnected) return;
    const t = event.target;
    if (t?.closest?.(".oc-sidebar") || t?.closest?.("[data-oc-sidebar-trigger], [data-oc-sidebar-rail]")) return;
    setCollapsed(true);
  });

  mq?.addEventListener?.("change", () => {
    mobile = mq.matches;
    openMobile = false;
    paint();
    root.dispatchEvent(new CustomEvent("oc-sidebar-change", { bubbles: true, detail: { collapsed: state(), mobile } }));
  });

  controllers.set(root, controller);
  paint();
  return controller;
}

/** The controller of a wired provider (or null). */
export function getSidebarProvider(root) {
  return controllers.get(root) ?? null;
}

/** Wire every [data-oc-sidebar-provider] under scope. */
export function initSidebarProviders(scope = document) {
  scope.querySelectorAll("[data-oc-sidebar-provider]").forEach((root) => bindSidebarProvider(root));
}

// Starts on its own when loaded straight from a <script type="module"> tag: as /js/oc-sidebar.js (`npx omniaui copy-js`),
// with ?auto in the URL, or with data-oc-auto on the tag. An import from a bundler does not scan the page: call
// initSidebarProviders() yourself there.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-sidebar") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initSidebarProviders(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
