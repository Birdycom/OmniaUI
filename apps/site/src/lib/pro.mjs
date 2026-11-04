// File: apps/site/src/lib/pro.mjs
// One label for OmniaUI Pro everywhere on the site (sidebar, galleries, page title, search), from the page meta "pro":
// "all" = a Pro component or block, "some" = a free one with a Pro addition (tint card fill, data table widths).
// Map: PRO_LABELS -> proLabel(meta.pro)

export const PRO_LABELS = { all: "Pro", some: "Free + Pro" };

/** "Pro", "Free + Pro" or "" for the meta value of a page. */
export const proLabel = (pro) => PRO_LABELS[pro] || "";
