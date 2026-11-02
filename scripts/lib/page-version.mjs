// File: scripts/lib/page-version.mjs
// Which release brought a docs page, and which pages are new: shared by the sidebar (build-nav.mjs) and the
// overview galleries (build-galleries.mjs), so both mark the same pages.
// Map: introduced version (section header badge, else the badge of the first demo) -> newest version -> isNew

/** "0.12.6" from the version badge in the Demo header, else from the first demo title (demo-1); "" when neither has one.
 *  A badge further down (a new variant of an older component) does not make the page new. */
export function introducedIn(src) {
  const m = src.match(/oc-section-header__badge-version oc-badge-version">v(\d+\.\d+\.\d+)</)
    || src.match(/id="demo-1">[^<]*<span class="oc-badge-version">v(\d+\.\d+\.\d+)</);
  return m ? m[1] : "";
}

const parts = (v) => v.split(".").map(Number);
/** Compare two "x.y.z" versions (sort order). */
export const byVersion = (a, b) => { const [x, y] = [parts(a), parts(b)]; return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };

/** The newest version in the list ("" for none): pages brought by it are "new", so the badge moves on by itself. */
export const newestVersion = (versions) => versions.filter(Boolean).sort(byVersion).at(-1) || "";
