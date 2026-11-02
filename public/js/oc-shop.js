// File: packages/pro/src/shop.js
// Map: money -> catalog (read filters, filter + sort cards, count) -> cart (line totals, summary, remove, empty) -> bind -> boot
// OmniaUI Pro shop: instant filters on the catalog and live totals in the cart. Without this script the catalog filter
// panel is a normal GET form (filter on the server) and the cart shows the totals the server rendered.
// Events: oc-shop-filter { shown } on the catalog, oc-cart-change { lines, subtotal, total } on the cart.

/** Format an amount like the server does (data-oc-currency / data-oc-locale on the root, default EUR / nl-BE). */
export function money(amount, currency = "EUR", locale = "nl-BE") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

/** Does a card pass the filters? card: { category, price, stock, rating }, filters: { categories, min, max, inStock, rating }. */
export function cardPasses(card, filters) {
  if (filters.categories.length && !filters.categories.includes(card.category)) return false;
  if (Number.isFinite(filters.min) && card.price < filters.min) return false;
  if (Number.isFinite(filters.max) && card.price > filters.max) return false;
  if (filters.inStock && !(card.stock > 0)) return false;
  if (filters.rating && card.rating < filters.rating) return false;
  return true;
}

/** Cart totals: lines [{ price, quantity }], shipping, free shipping from, VAT rate (prices incl. VAT). */
export function cartTotals(lines, { shipping = 0, freeFrom = Infinity, vat = 0.21 } = {}) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const ship = subtotal === 0 || subtotal >= freeFrom ? 0 : shipping;
  const total = subtotal + ship;
  return { subtotal, shipping: ship, vat: total - total / (1 + vat), total };
}

function bindCatalog(root) {
  const form = root.querySelector("[data-oc-shop-filters]");
  const cards = [...root.querySelectorAll("[data-oc-card]")];
  const count = root.querySelector("[data-oc-shop-count]");
  const none = root.querySelector(".oc-block-shop-none");
  const sort = root.querySelector("[data-oc-shop-sort]");
  const list = cards[0]?.parentElement;
  if (!form || !list) return;
  const read = () => {
    const data = new FormData(form);
    const num = (name) => (data.get(name) === "" || data.get(name) == null ? NaN : Number(data.get(name)));
    return { categories: data.getAll("category").map(String), min: num("min"), max: num("max"), inStock: data.get("stock") === "1", rating: Number(data.get("rating") || 0) };
  };
  const apply = () => {
    const filters = read();
    let shown = 0;
    for (const card of cards) {
      const d = card.dataset;
      const pass = cardPasses({ category: d.category, price: Number(d.price), stock: Number(d.stock), rating: Number(d.rating) }, filters);
      card.hidden = !pass;
      if (pass) shown++;
    }
    const order = sort?.value || "";
    const key = (card) => (order.startsWith("price") ? Number(card.dataset.price) : order === "rating" ? -Number(card.dataset.rating) : Number(card.dataset.order || 0));
    const sorted = [...cards].sort((a, b) => (order === "price-desc" ? key(b) - key(a) : key(a) - key(b)));
    for (const card of sorted) list.append(card);
    if (count) count.textContent = (count.dataset.ocTemplate || "{n} products").replace("{n}", String(shown));
    if (none) none.hidden = shown > 0;
    root.dispatchEvent(new CustomEvent("oc-shop-filter", { bubbles: true, detail: { shown } }));
  };
  cards.forEach((card, i) => { card.dataset.order ??= String(i); });
  form.addEventListener("input", apply);
  form.addEventListener("change", apply);
  form.addEventListener("submit", (event) => { event.preventDefault(); apply(); });
  form.addEventListener("reset", () => setTimeout(apply));
  sort?.addEventListener("change", apply);
  apply();
}

function bindCart(root) {
  const currency = root.dataset.ocCurrency || "EUR";
  const locale = root.dataset.ocLocale || "nl-BE";
  const options = { shipping: Number(root.dataset.ocShipping || 0), freeFrom: Number(root.dataset.ocFreeFrom || Infinity), vat: Number(root.dataset.ocVat || 0.21) };
  const set = (name, text) => root.querySelectorAll(`[data-oc-cart="${name}"]`).forEach((el) => { el.textContent = text; });
  const update = () => {
    const lines = [...root.querySelectorAll("[data-oc-line]")].map((line) => {
      const quantity = Math.max(0, Number(line.querySelector(".oc-quantity__input")?.value) || 0);
      const price = Number(line.dataset.price);
      const total = line.querySelector(".oc-block-shop-line-total");
      if (total) total.textContent = money(price * quantity, currency, locale);
      return { key: line.dataset.ocLine, price, quantity };
    });
    const t = cartTotals(lines, options);
    set("subtotal", money(t.subtotal, currency, locale));
    set("shipping", t.shipping ? money(t.shipping, currency, locale) : (root.dataset.ocFreeLabel || "Free"));
    set("vat", money(t.vat, currency, locale));
    set("total", money(t.total, currency, locale));
    set("count", String(lines.reduce((sum, line) => sum + line.quantity, 0)));
    const empty = root.querySelector("[data-oc-cart-empty]");
    if (empty) empty.hidden = lines.length > 0;
    root.querySelectorAll("[data-oc-cart-full]").forEach((el) => { el.hidden = lines.length === 0; });
    root.dispatchEvent(new CustomEvent("oc-cart-change", { bubbles: true, detail: { lines, subtotal: t.subtotal, total: t.total } }));
  };
  root.addEventListener("input", (event) => { if (event.target.matches?.(".oc-quantity__input")) update(); });
  root.addEventListener("change", (event) => { if (event.target.matches?.(".oc-quantity__input")) update(); });
  root.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-oc-cart-remove]");
    if (!remove || !root.contains(remove)) return;
    event.preventDefault();
    remove.closest("[data-oc-line]")?.remove();
    update();
  });
  update();
}

/** Wire every catalog ([data-oc-shop-catalog]) and cart ([data-oc-cart-root]) under scope. */
export function initShop(scope = document) {
  scope.querySelectorAll("[data-oc-shop-catalog]").forEach((root) => { if (!root.dataset.ocBound) { root.dataset.ocBound = ""; bindCatalog(root); } });
  scope.querySelectorAll("[data-oc-cart-root]").forEach((root) => { if (!root.dataset.ocBound) { root.dataset.ocBound = ""; bindCart(root); } });
}

// Starts on its own as /js/oc-shop.js (`npx omniaui copy-js`), with ?auto or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-shop.js") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initShop(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
