// File: packages/ui/src/barcode.js
// Map: format guess -> EAN-13 / EAN-8 / UPC-A -> Code 128 (B, or C for even digit runs) -> bars to SVG -> bind -> boot
// Barcode display without a dependency : <figure class="oc-barcode" data-value="5412345678908">
// gets an SVG with the bars and the digits under it. data-format="auto|EAN13|EAN8|UPC|CODE128" (default auto).

/** Module widths of the Code 128 symbols 0–105 (6 elements, 11 modules each) and the stop (7 elements, 13 modules). */
export const CODE128 = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232",
];
const STOP = "2331112";
const START_B = 104;
const START_C = 105;

const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = L.map((code) => code.replace(/./g, (bit) => (bit === "1" ? "0" : "1")));
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

/** EAN-13, EAN-8 or UPC-A for plain digit strings of that length (with or without the check digit); else Code 128. */
export function guessFormat(value) {
  if (/^\d{12,13}$/.test(value)) return "EAN13";
  if (/^\d{7,8}$/.test(value)) return "EAN8";
  if (/^\d{11}$/.test(value)) return "UPC";
  return "CODE128";
}

/** Check digit of an EAN/UPC body: weights 3 and 1 from the right. */
export function eanCheck(body) {
  let sum = 0;
  [...body].reverse().forEach((d, i) => { sum += Number(d) * (i % 2 === 0 ? 3 : 1); });
  return String((10 - (sum % 10)) % 10);
}

/** Bars (a "1010…" module string) and the full digits for EAN-13 / EAN-8; throws on a wrong check digit. */
export function encodeEan(value, length) {
  const body = value.slice(0, length - 1);
  const check = eanCheck(body);
  if (value.length === length && value[length - 1] !== check) throw new Error(`check digit should be ${check}`);
  const digits = body + check;
  if (length === 8) {
    const left = [...digits.slice(0, 4)].map((d) => L[d]).join("");
    const right = [...digits.slice(4)].map((d) => R[d]).join("");
    return { bits: `101${left}01010${right}101`, text: digits };
  }
  const parity = PARITY[digits[0]];
  const left = [...digits.slice(1, 7)].map((d, i) => (parity[i] === "L" ? L : G)[d]).join("");
  const right = [...digits.slice(7)].map((d) => R[d]).join("");
  return { bits: `101${left}01010${right}101`, text: digits };
}

/** Code 128 symbol values for a text: code C for an all-digit text of even length (4+), else code B (ASCII 32–126). */
export function code128Values(text) {
  let values;
  if (/^(\d\d){2,}$/.test(text)) {
    values = [START_C, ...text.match(/\d\d/g).map(Number)];
  } else {
    if (/[^\x20-\x7e]/.test(text)) throw new Error("Code 128 B takes ASCII characters 32–126 only");
    values = [START_B, ...[...text].map((ch) => ch.charCodeAt(0) - 32)];
  }
  const check = values.reduce((sum, v, i) => sum + v * (i === 0 ? 1 : i), 0) % 103;
  return [...values, check];
}

/** Module string ("1" = bar) for Code 128. */
export function encodeCode128(text) {
  const widths = code128Values(text).map((v) => CODE128[v]).join("") + STOP;
  let bits = "";
  [...widths].forEach((w, i) => { bits += (i % 2 === 0 ? "1" : "0").repeat(Number(w)); });
  return { bits, text };
}

/** Encode a value in a format (auto picks one). Returns the module string and the human-readable text. */
export function encodeBarcode(value, format = "auto") {
  const code = String(value ?? "").trim();
  if (!code) throw new Error("empty value");
  const kind = format === "auto" ? guessFormat(code) : format.toUpperCase();
  if (kind === "EAN13") return encodeEan(code.padStart(code.length === 12 ? 12 : 13, "0"), 13);
  if (kind === "UPC") return encodeEan(`0${code}`, 13);
  if (kind === "EAN8") return encodeEan(code, 8);
  return encodeCode128(code);
}

/** Text for HTML: the value can come from user input (Code 128 encodes < > & " too). */
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** SVG markup of the bars, with a quiet zone of 10 modules on both sides. Bars use currentColor. */
export function barsToSvg(bits, label = "") {
  const quiet = 10;
  let rects = "";
  for (let i = 0; i < bits.length; ) {
    if (bits[i] !== "1") { i++; continue; }
    let w = 1;
    while (bits[i + w] === "1") w++;
    rects += `<rect x="${i + quiet}" y="0" width="${w}" height="50"/>`;
    i += w;
  }
  const width = bits.length + quiet * 2;
  return `<svg viewBox="0 0 ${width} 50" preserveAspectRatio="none" fill="currentColor" role="img" aria-label="${escapeHtml(label)}" style="aspect-ratio:${width}/50">${rects}</svg>`;
}

/** Draw one .oc-barcode from its data-value and data-format. Shows a short error instead of bars when it cannot. */
export function renderBarcode(el) {
  if (!el) return;
  const value = el.dataset.value ?? "";
  const digits = el.dataset.digits !== "false";
  try {
    const { bits, text } = encodeBarcode(value, el.dataset.format || "auto");
    el.removeAttribute("data-error");
    el.innerHTML = barsToSvg(bits, `Barcode ${text}`) + (digits ? `<figcaption class="oc-barcode__digits">${escapeHtml(text)}</figcaption>` : "");
  } catch (err) {
    el.setAttribute("data-error", "");
    el.innerHTML = `<figcaption class="oc-barcode__digits">${escapeHtml(value)}: ${escapeHtml(err.message)}</figcaption>`;
  }
}

/** Draw every .oc-barcode[data-value] under scope. */
export function initBarcodes(scope = document) {
  scope.querySelectorAll(".oc-barcode[data-value]").forEach(renderBarcode);
}

// Starts on its own as /js/oc-barcode.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-barcode") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initBarcodes(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
