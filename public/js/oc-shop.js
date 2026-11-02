// File: packages/pro/src/shop.js
// Map: money -> catalog (read filters, filter + sort cards, count, columns, view) -> cart (line totals, delivery choice, summary, remove, empty)
//      -> product page (choice names, price and stock per choice, favorite) -> bind -> boot
// OmniaUI Pro shop: instant filters on the catalog and live totals in the cart. Without this script the catalog filter
// panel is a normal GET form (filter on the server) and the cart shows the totals the server rendered.
// Events: oc-shop-filter { shown } on the catalog, oc-cart-change { lines, subtotal, total } on the cart,
// oc-shop-choice { name, value, stock } on a product page, oc-favorite-change { pressed } on a favorite button.

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
  const base = { shipping: Number(root.dataset.ocShipping || 0), freeFrom: Number(root.dataset.ocFreeFrom || Infinity), vat: Number(root.dataset.ocVat || 0.21) };
  // Checkout: the chosen delivery (input[name="delivery"][data-oc-price]) sets the shipping cost, free-from no longer applies.
  const options = () => {
    const chosen = root.querySelector('input[name="delivery"][data-oc-price]:checked');
    return chosen ? { ...base, shipping: Number(chosen.dataset.ocPrice) || 0, freeFrom: Infinity } : base;
  };
  const set = (name, text) => root.querySelectorAll(`[data-oc-cart="${name}"]`).forEach((el) => { el.textContent = text; });
  const update = () => {
    const lines = [...root.querySelectorAll("[data-oc-line]")].map((line) => {
      const input = line.querySelector(".oc-quantity__input");
      // A cart line has a quantity field; a checkout summary line only data-quantity.
      const quantity = Math.max(0, Number(input ? input.value : line.dataset.quantity ?? 1) || 0);
      const price = Number(line.dataset.price);
      const total = line.querySelector(".oc-block-shop-line-total");
      if (total) total.textContent = money(price * quantity, currency, locale);
      return { key: line.dataset.ocLine, price, quantity };
    });
    const t = cartTotals(lines, options());
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
  root.addEventListener("change", (event) => { if (event.target.matches?.('.oc-quantity__input, input[name="delivery"]')) update(); });
  root.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-oc-cart-remove]");
    if (!remove || !root.contains(remove)) return;
    event.preventDefault();
    remove.closest("[data-oc-line]")?.remove();
    update();
  });
  update();
}

/** Stock text and level for a number of pieces: [text, level] (level "" = in stock). */
export function stockState(stock, low = 5) {
  if (!(stock > 0)) return ["Out of stock", "out"];
  if (stock <= low) return [`Only ${stock} left`, "low"];
  return ["In stock", ""];
}

/** Product page ([data-oc-shop-product]): the name of the chosen option next to its legend ([data-oc-choice="name"]),
 *  and a choice with data-oc-price / data-oc-stock sets the price ([data-oc-shop-price]), the stock ([data-oc-shop-stock]),
 *  the quantity limit and the add button ([data-oc-shop-add], off when out of stock). A choice with data-oc-images
 *  ("a.svg b.svg …") swaps the photos: img[data-oc-variant="0"] gets the first, "1" the second (slides and thumbs). */
function bindProduct(root) {
  const currency = root.dataset.ocCurrency || "EUR";
  const locale = root.dataset.ocLocale || "nl-BE";
  const stockEl = root.querySelector("[data-oc-shop-stock]");
  const priceEl = root.querySelector("[data-oc-shop-price]");
  const add = root.querySelector("[data-oc-shop-add]");
  const qty = root.querySelector(".oc-quantity__input");
  const baseStock = Number(stockEl?.dataset.ocStock ?? NaN);
  const basePrice = Number(priceEl?.dataset.ocPrice ?? NaN);
  const page = root.closest(".oc-block-shop") || root.parentElement || root;
  const update = () => {
    let stock = baseStock;
    let price = basePrice;
    for (const label of root.querySelectorAll("[data-oc-choice]")) {
      const checked = root.querySelector(`input[name="${label.dataset.ocChoice}"]:checked`);
      label.textContent = checked ? (checked.dataset.ocName || checked.closest("label")?.textContent.trim() || checked.value) : "";
    }
    for (const checked of root.querySelectorAll("input[type=radio]:checked")) {
      if (checked.dataset.ocStock != null) stock = Number(checked.dataset.ocStock);
      if (checked.dataset.ocPrice != null) price = Number(checked.dataset.ocPrice);
      if (checked.dataset.ocImages) {
        const list = checked.dataset.ocImages.split(/\s+/).filter(Boolean);
        page.querySelectorAll("img[data-oc-variant]").forEach((img) => {
          const src = list[Number(img.dataset.ocVariant)];
          if (src && img.getAttribute("src") !== src) img.src = src;
        });
      }
    }
    if (stockEl && Number.isFinite(stock)) {
      const [text, level] = stockState(stock);
      stockEl.textContent = text;
      if (level) stockEl.dataset.level = level; else stockEl.removeAttribute("data-level");
    }
    if (priceEl && Number.isFinite(price)) priceEl.textContent = money(price, currency, locale);
    const out = Number.isFinite(stock) && !(stock > 0);
    if (add) add.disabled = out;
    if (qty && Number.isFinite(stock) && stock > 0) {
      qty.max = String(stock);
      if (Number(qty.value) > stock) qty.value = String(stock);
    }
  };
  root.addEventListener("change", (event) => {
    if (!event.target.matches?.("input[type=radio]")) return;
    update();
    root.dispatchEvent(new CustomEvent("oc-shop-choice", { bubbles: true, detail: { name: event.target.name, value: event.target.value, stock: Number(event.target.dataset.ocStock ?? NaN) } }));
  });
  update();
}

/** Favorite / wishlist toggle ([data-oc-favorite]): aria-pressed, the filled icon (data-oc-icon-on / -off on the
 *  iconify-icon, default mdi:heart / mdi:heart-outline) and the label (data-oc-label-on / -off). */
export function toggleFavorite(button, pressed = button.getAttribute("aria-pressed") !== "true") {
  button.setAttribute("aria-pressed", String(pressed));
  const icon = button.querySelector("iconify-icon");
  if (icon) icon.setAttribute("icon", pressed ? icon.dataset.ocIconOn || "mdi:heart" : icon.dataset.ocIconOff || "mdi:heart-outline");
  const label = pressed ? button.dataset.ocLabelOn : button.dataset.ocLabelOff;
  if (label) { button.setAttribute("aria-label", label); button.title = label; }
  button.dispatchEvent(new CustomEvent("oc-favorite-change", { bubbles: true, detail: { pressed } }));
  return pressed;
}

/** Wire every catalog ([data-oc-shop-catalog]), cart or checkout ([data-oc-cart-root]), product page ([data-oc-shop-product])
 *  and favorite button ([data-oc-favorite]) under scope. */
export function initShop(scope = document) {
  scope.querySelectorAll("[data-oc-shop-catalog]").forEach((root) => { if (!root.dataset.ocBound) { root.dataset.ocBound = ""; bindCatalog(root); } });
  scope.querySelectorAll("[data-oc-cart-root]").forEach((root) => { if (!root.dataset.ocBound) { root.dataset.ocBound = ""; bindCart(root); } });
  scope.querySelectorAll("[data-oc-shop-product]").forEach((root) => { if (!root.dataset.ocBound) { root.dataset.ocBound = ""; bindProduct(root); } });
  scope.querySelectorAll("[data-oc-favorite]").forEach((button) => {
    if (button.dataset.ocBound) return;
    button.dataset.ocBound = "";
    button.addEventListener("click", (event) => { event.preventDefault(); toggleFavorite(button); });
  });
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
