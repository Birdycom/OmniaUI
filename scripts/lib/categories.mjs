// File: scripts/lib/categories.mjs
// The groups of the components and blocks, in display order, with the line shown on the overview galleries.
// Used by scripts/build-nav.mjs (sidebar order) and scripts/build-galleries.mjs (ui/components.html, ui/blocks.html).
// A page picks its group with "category" in its meta line; a name that is not listed here still works and
// comes after these groups.

export const COMPONENT_CATEGORIES = {
  Actions: "Buttons, toggles and the controls people press.",
  Forms: "Inputs, pickers and fields on native form elements.",
  Overlays: "Dialogs, sheets, popovers and menus on dialog and popover.",
  Navigation: "Headers, sidebars, tabs, breadcrumbs and steppers.",
  Feedback: "Alerts, progress, badges and loading states.",
  Layout: "Cards, rows, separators and the structure around content.",
  Data: "Tables, trees, charts and the toolbars around them.",
  Media: "Images, galleries, documents and chat messages.",
  "App UX": "Banners, page headers and the small parts of a product UI.",
  Marketing: "Pieces for landing pages, portfolios and long reads.",
  "Docs UI": "The parts this documentation is built with.",
};

export const BLOCK_CATEGORIES = {
  "App UX": "Dashboards, app shells, tables and settings screens.",
  Authentication: "Sign in, sign up, one-time codes and recovery.",
  Marketing: "Heroes, features, pricing, teams and footers.",
  Media: "Galleries and media layouts.",
};

/** Sort helper: listed groups in their order, other names after them alphabetically. */
export function byCategoryOrder(categories) {
  const order = Object.keys(categories);
  const rank = (title) => { const i = order.indexOf(title); return i < 0 ? order.length : i; };
  return (a, b) => rank(a) - rank(b) || a.localeCompare(b);
}
