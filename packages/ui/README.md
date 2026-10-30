# @birdycom/omniaui

CSS-first components for OmniaCSS. Native HTML does the behaviour — **no JavaScript required**:

| Component | Markup |
|-----------|--------|
| Modal | `<dialog class="oc-modal">` + `command="show-modal" commandfor="id"` |
| Dropdown | `<div popover class="oc-dropdown-menu">` + `popovertarget` (anchor positioned) |
| Accordion | `<details class="oc-accordion-item" name="group">` |
| Tabs | `.oc-tabset` with radio inputs (`:has()`) |
| Theme switch | `.oc-theme-switch` (system / light / dark, `light-dark()` tokens) |
| Counter | `.oc-counter` (`@property`, optional start on scroll) |

Plus buttons, cards, badges, alerts, forms, avatar, progress, breadcrumb, pagination, skeleton, tooltip and the Code-block.

```bash
npm install @birdycom/omniaui      # import "@birdycom/omniaui"
npx omniaui add modal              # copy a component into your project (HTML, React, Vue or Blade)
npx omniaui copy-js                # the scripts (data table, carousel) to public/js/oc-*.js
```

MIT
