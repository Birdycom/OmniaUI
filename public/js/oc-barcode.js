// File: packages/ui/src/barcode.js
// Map: format guess -> EAN-13 / EAN-8 / UPC-A -> Code 128 (B, or C for even digit runs) -> QR (segment, Reed-Solomon, patterns, zigzag, mask) -> digit groups -> bars to SVG -> SVG file -> bind -> boot
// Barcode display without a dependency : <figure class="oc-barcode" data-value="5412345678908">
// gets an SVG with the bars and the digits under it. data-format="auto|EAN13|EAN8|UPC|CODE128|QR" (default auto).
// data-format="QR" (0.18.0): a QR code from the own encoder below (data-level L|M|Q|H, default M); the figure gets
// .oc-barcode--qr and keeps a white quiet zone (also with --bare), so it scans and prints in any theme.
// data-fallback="code128" (0.17.1): an EAN/UPC value with a wrong check digit is drawn as Code 128 instead of an error
// (the figure then gets data-fallback-used).
// The digits are grouped like on a product (EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1); data-group="false" keeps one run.

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

/** EAN-13, EAN-8 or UPC-A for plain digit strings of that length (with or without the check digit); else Code 128.
 *  12 digits (0.17.1): UPC-A when the last digit is its check digit, else the body of an EAN-13 (the check digit is added). */
export function guessFormat(value) {
  if (/^\d{12}$/.test(value) && eanCheck(value.slice(0, 11)) === value[11]) return "UPC";
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

/** Encode a value in a format (auto picks one). Returns the module string, the human-readable text and the format
 *  that was used (EAN13, EAN8, UPC or CODE128). fallback "code128" (0.17.1): when an EAN/UPC value cannot be encoded
 *  (a wrong check digit, a wrong length), draw it as Code 128 and report `fallback: true` instead of throwing. */
export function encodeBarcode(value, format = "auto", { fallback, level = "M" } = {}) {
  const code = String(value ?? "").trim();
  if (!code) throw new Error("empty value");
  const kind = format === "auto" ? guessFormat(code) : format.toUpperCase();
  if (kind === "QR") {
    const qr = encodeQr(code, { level });
    return { bits: "", text: code, format: "QR", qr };
  }
  if (fallback && String(fallback).toUpperCase() === "CODE128" && kind !== "CODE128") {
    try {
      return encodeBarcode(code, kind);
    } catch {
      return { ...encodeCode128(code), format: "CODE128", fallback: true };
    }
  }
  if (kind === "EAN13") return { ...encodeEan(code.padStart(code.length === 12 ? 12 : 13, "0"), 13), format: "EAN13" };
  if (kind === "UPC") {
    if (!/^\d{11,12}$/.test(code)) throw new Error("UPC-A takes 11 or 12 digits");
    return { ...encodeEan(`0${code}`, 13), format: "UPC" };
  }
  if (kind === "EAN8") return { ...encodeEan(code, 8), format: "EAN8" };
  return { ...encodeCode128(code), format: "CODE128" };
}

/* ---------- QR code (0.18.0): a small encoder of its own, no dependency ----------
   Numeric, alphanumeric or byte (UTF-8) mode in one segment, versions 1-40, error correction L, M, Q or H, the mask
   with the lowest penalty (ISO/IEC 18004). encodeQr returns the module matrix (true = dark), without the quiet zone. */

/** Error correction codewords per block and number of blocks, per level (L, M, Q, H) and version (index 0 unused). */
const QR_ECC = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
const QR_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];
/** Table row and the two format bits of each error correction level. */
const QR_LEVEL = { L: [0, 1], M: [1, 0], Q: [2, 3], H: [3, 2] };
const QR_ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

const bitAt = (x, i) => ((x >>> i) & 1) !== 0;

/** Data modules of a version (all modules minus finders, timing, alignment, format and version info). */
export function qrRawModules(ver) {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
}

/** Data codewords (bytes) of a version and level. */
export function qrDataCodewords(ver, level = "M") {
  const row = QR_LEVEL[level][0];
  return Math.floor(qrRawModules(ver) / 8) - QR_ECC[row][ver] * QR_BLOCKS[row][ver];
}

/** Multiply in GF(2^8) with the QR polynomial 0x11D. */
function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

/** Reed-Solomon generator polynomial of a degree (the leading 1 left out). */
export function rsDivisor(degree) {
  const poly = new Array(degree).fill(0);
  poly[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < poly.length; j++) {
      poly[j] = gfMul(poly[j], root);
      if (j + 1 < poly.length) poly[j] ^= poly[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return poly;
}

/** Reed-Solomon error correction bytes of a data block. */
export function rsRemainder(data, divisor) {
  const rest = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ rest.shift();
    rest.push(0);
    divisor.forEach((coef, i) => { rest[i] ^= gfMul(coef, factor); });
  }
  return rest;
}

/** The segment of a text: mode (1 numeric, 2 alphanumeric, 4 byte), its data bits, the length in characters or bytes
 *  and the widths of the length field (versions 1-9, 10-26, 27-40). */
export function qrSegment(text) {
  const t = String(text);
  const bits = [];
  const put = (value, len) => { for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  if (/^\d*$/.test(t)) {
    for (let i = 0; i < t.length; i += 3) {
      const chunk = t.slice(i, i + 3);
      put(Number(chunk), chunk.length * 3 + 1);
    }
    return { mode: 1, count: t.length, bits, widths: [10, 12, 14] };
  }
  if ([...t].every((ch) => QR_ALNUM.includes(ch))) {
    for (let i = 0; i + 1 < t.length; i += 2) put(QR_ALNUM.indexOf(t[i]) * 45 + QR_ALNUM.indexOf(t[i + 1]), 11);
    if (t.length % 2) put(QR_ALNUM.indexOf(t[t.length - 1]), 6);
    return { mode: 2, count: t.length, bits, widths: [9, 11, 13] };
  }
  const bytes = new TextEncoder().encode(t);
  bytes.forEach((b) => put(b, 8));
  return { mode: 4, count: bytes.length, bits, widths: [8, 16, 16] };
}

/** Alignment pattern centres of a version. */
export function qrAlignment(ver) {
  if (ver === 1) return [];
  const count = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (count * 2 - 2)) * 2;
  const out = [6];
  for (let pos = ver * 4 + 10; out.length < count; pos -= step) out.splice(1, 0, pos);
  return out;
}

/** The 15 format bits of a level and mask (BCH code, XOR 0x5412). */
export function qrFormatBits(level, mask) {
  const data = (QR_LEVEL[level][1] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

const QR_MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** Penalty score of a matrix (runs, 2x2 blocks, finder-like patterns, dark balance); the mask with the lowest wins. */
export function qrPenalty(m) {
  const size = m.length;
  let score = 0;
  const lines = [];
  for (let i = 0; i < size; i++) {
    lines.push(m[i]);
    lines.push(m.map((row) => row[i]));
  }
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) { run++; continue; }
      if (run >= 5) score += 3 + (run - 5);
      run = 1;
    }
    const s = line.map((v) => (v ? "1" : "0")).join("");
    for (let i = s.indexOf("1011101"); i !== -1; i = s.indexOf("1011101", i + 1)) {
      if (i >= 4 && s.slice(i - 4, i) === "0000") score += 40;
      if (s.slice(i + 7, i + 11) === "0000") score += 40;
    }
  }
  for (let y = 0; y + 1 < size; y++) {
    for (let x = 0; x + 1 < size; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
    }
  }
  const dark = m.reduce((n, row) => n + row.filter(Boolean).length, 0);
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

/** Encode a text as a QR code. level L|M|Q|H (default M), mask 0-7 (default: the one with the lowest penalty),
 *  minVersion 1-40. Returns { matrix (rows of booleans, true = dark), version, level, mask, size, text };
 *  throws when the text does not fit in version 40. */
export function encodeQr(text, { level = "M", mask = -1, minVersion = 1 } = {}) {
  const lvl = String(level).toUpperCase();
  if (!QR_LEVEL[lvl]) throw new Error("QR error correction is L, M, Q or H");
  const seg = qrSegment(text);
  const widthOf = (v) => seg.widths[v <= 9 ? 0 : v <= 26 ? 1 : 2];
  let ver = Math.max(1, Math.min(40, Number(minVersion) || 1));
  let capacity = 0;
  for (; ; ver++) {
    if (ver > 40) throw new Error("text too long for a QR code");
    capacity = qrDataCodewords(ver, lvl) * 8;
    if (seg.count < 2 ** widthOf(ver) && 4 + widthOf(ver) + seg.bits.length <= capacity) break;
  }
  const bits = [];
  const put = (value, len) => { for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  put(seg.mode, 4);
  put(seg.count, widthOf(ver));
  bits.push(...seg.bits);
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((b, v) => (b << 1) | v, 0));

  // blocks with their error correction, interleaved
  const row = QR_LEVEL[lvl][0];
  const numBlocks = QR_BLOCKS[row][ver];
  const eccLen = QR_ECC[row][ver];
  const raw = Math.floor(qrRawModules(ver) / 8);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const divisor = rsDivisor(eccLen);
  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const codewords = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((b, j) => { if (i !== shortLen - eccLen || j >= numShort) codewords.push(b[i]); });
  }

  // function patterns: timing, finders (with separators), alignment, format and version info
  const size = ver * 4 + 17;
  const grid = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => { grid[y][x] = dark; fixed[y][x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
    }
  }
  const align = qrAlignment(ver);
  const last = align.length - 1;
  align.forEach((ay, i) => align.forEach((ax, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const drawFormat = (m) => {
    const f = qrFormatBits(lvl, m);
    for (let i = 0; i <= 5; i++) set(8, i, bitAt(f, i));
    set(8, 7, bitAt(f, 6));
    set(8, 8, bitAt(f, 7));
    set(7, 8, bitAt(f, 8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bitAt(f, i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bitAt(f, i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bitAt(f, i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const v = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, bitAt(v, i));
      set(b, a, bitAt(v, i));
    }
  }

  // the codewords in the zigzag of two-module columns, from the bottom right, up and down
  let n = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!fixed[y][x] && n < codewords.length * 8) {
          grid[y][x] = bitAt(codewords[n >>> 3], 7 - (n & 7));
          n++;
        }
      }
    }
  }

  const masked = (m) => {
    const out = grid.map((r) => r.slice());
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fixed[y][x] && QR_MASKS[m](x, y)) out[y][x] = !out[y][x];
    return out;
  };
  let best = Number(mask);
  if (!(best >= 0 && best <= 7)) {
    let low = Infinity;
    for (let m = 0; m < 8; m++) {
      drawFormat(m);
      const score = qrPenalty(masked(m));
      if (score < low) { low = score; best = m; }
    }
  }
  drawFormat(best);
  return { matrix: masked(best), version: ver, level: lvl, mask: best, size, text: String(text) };
}

/** SVG markup of a QR matrix with a quiet zone of 4 modules (kept white by the CSS, also in --bare). currentColor. */
export function qrToSvg(matrix, label = "") {
  const quiet = 4;
  const width = matrix.length + quiet * 2;
  let d = "";
  matrix.forEach((row, y) => row.forEach((dark, x) => { if (dark) d += `M${x + quiet} ${y + quiet}h1v1h-1z`; }));
  return `<svg class="oc-barcode__qr" viewBox="0 0 ${width} ${width}" fill="currentColor" shape-rendering="crispEdges" role="img" aria-label="${escapeHtml(label)}" style="aspect-ratio:1/1"><path d="${d}"/></svg>`;
}

/** The human-readable text in groups, as printed on a product: EAN-13 1 · 6 · 6, EAN-8 4 · 4, UPC-A 1 · 5 · 5 · 1
 *  (the 12 UPC digits, without the leading 0 of its EAN-13 form). Code 128 stays one group. */
export function digitGroups(text, format) {
  const t = String(text ?? "");
  if (format === "EAN13" && t.length === 13) return [t.slice(0, 1), t.slice(1, 7), t.slice(7)];
  if (format === "EAN8" && t.length === 8) return [t.slice(0, 4), t.slice(4)];
  if (format === "UPC" && t.length === 13) {
    const u = t.slice(1);
    return [u.slice(0, 1), u.slice(1, 6), u.slice(6, 11), u.slice(11)];
  }
  return [t];
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

/** A standalone SVG file (white background, black bars, digits under it) to download, print or put on a label.
 *  The barcode maker form (download, live preview) is part of OmniaUI Pro: @birdycom/omniaui-pro/barcode-maker.js.
 *  moduleWidth and height are in px; throws like encodeBarcode for a value it cannot encode. */
export function barcodeFile(value, { format = "auto", digits = true, moduleWidth = 2, height = 70, level = "M" } = {}) {
  const { bits, text, qr } = encodeBarcode(value, format, { level });
  if (qr) {
    // QR (0.18.0): moduleWidth is the size of one module; 4 modules of white quiet zone, the text under it when digits
    const side = (qr.size + 8) * moduleWidth;
    const font = 14;
    const full = side + (digits ? font + 8 : 0);
    let path = "";
    qr.matrix.forEach((row, y) => row.forEach((dark, x) => { if (dark) path += `M${(x + 4) * moduleWidth} ${(y + 4) * moduleWidth}h${moduleWidth}v${moduleWidth}h-${moduleWidth}z`; }));
    const caption = digits ? `<text x="${side / 2}" y="${side + font}" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="${font}">${escapeHtml(text)}</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${full}" viewBox="0 0 ${side} ${full}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><g fill="#000"><path d="${path}"/>${caption}</g></svg>`;
  }
  const quiet = 10;
  const font = 14;
  const width = (bits.length + quiet * 2) * moduleWidth;
  const full = height + (digits ? font + 8 : 0) + 8;
  let rects = "";
  for (let i = 0; i < bits.length; ) {
    if (bits[i] !== "1") { i++; continue; }
    let w = 1;
    while (bits[i + w] === "1") w++;
    rects += `<rect x="${(i + quiet) * moduleWidth}" y="4" width="${w * moduleWidth}" height="${height}"/>`;
    i += w;
  }
  const caption = digits ? `<text x="${width / 2}" y="${height + font + 8}" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="${font}" letter-spacing="1">${escapeHtml(text)}</text>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${full}" viewBox="0 0 ${width} ${full}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects}${caption}</g></svg>`;
}

/** The figcaption with the digits: one span per group (textContent stays the plain number for copy and tests). */
export function digitsHtml(text, format, group = true) {
  const groups = group ? digitGroups(text, format) : [String(text)];
  return `<figcaption class="oc-barcode__digits">${groups.map((g) => `<span class="oc-barcode__group">${escapeHtml(g)}</span>`).join("")}</figcaption>`;
}

/** Draw one .oc-barcode from its data-value and data-format. Shows a short error instead of bars when it cannot. */
export function renderBarcode(el) {
  if (!el) return;
  const value = el.dataset.value ?? "";
  const digits = el.dataset.digits !== "false";
  try {
    const { bits, text, format, fallback, qr } = encodeBarcode(value, el.dataset.format || "auto", { fallback: el.dataset.fallback, level: el.dataset.level || "M" });
    el.removeAttribute("data-error");
    el.toggleAttribute("data-fallback-used", !!fallback);
    el.classList.toggle("oc-barcode--qr", !!qr);
    const svg = qr ? qrToSvg(qr.matrix, `QR code ${text}`) : barsToSvg(bits, `Barcode ${text}`);
    el.innerHTML = svg + (digits ? digitsHtml(text, format, !qr && el.dataset.group !== "false") : "");
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
