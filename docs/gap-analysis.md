# OmniaCSS gap analysis: Tailwind CSS v4 + shadcn/ui

Internal planning document. NOT published (lives in `docs/`, not `apps/site`). The comparison names third-party projects on purpose.
Copied from OmniaCSS at the split (v0.6.0). Here the components and blocks parts apply. Paths `packages/components` are now `packages/ui`. The utilities part is tracked in the OmniaCSS repo.
Date: 2026-10-14. Sources: tailwindcss.com/docs sidebar (fetched), ui.shadcn.com/docs/components (64 components, fetched), ui.shadcn.com/blocks (rendered only partly; block IDs below follow known shadcn naming), plus a repo audit.

How "status" was measured
- Utilities: 300+ Tailwind class tokens were pushed through `packages/migrate/src/resolve.mjs` (`compileToken`, v4 mode) and looked up in `packages/core/dist/omnia.css` (11.8 MB, native classes). "have" = resolver or native class works; "partial" = family works but some forms, arbitrary values or modifiers fail; "missing" = nothing.
- Two delivery layers exist: (1) native Omnia classes (SCSS in `src/scss/utilities`, e.g. `.p-4`, `.cq-md`, `.w-perc-1/3`) and (2) the Tailwind-compat resolver (`@birdycom/omniacss-migrate`: PostCSS + Vite plugin, on demand; supports `@theme`, `@apply`, `@source inline()`, `theme()`, `--spacing()`, `@custom-variant`, prefix, important). Almost everything Tailwind has already resolves through layer 2. Layer 1 is the gap to close if "OmniaCSS has it natively" is the goal.
- Native viewport variants are only `sm: 36rem / md: 50rem / lg: 64rem` (docs/responsive); `xl` / `2xl` exist only through the resolver. Native state variants are limited (`hover/focus/active/focus-visible` for a fixed list in `_state_variants.scss`, `dark:`, `group-hover`, `starting`). There is no native `peer-*`, `has-*`, `aria-*`, `data-*`, `supports-*`, `motion-safe`, `print`, `open:` generation (grep of omnia.css gives 0).

---

## 1. Utilities

### 1.1 Families per Tailwind docs category

| Category (pages) | Families and Omnia equivalent | Have | Partial | Missing |
|---|---|---|---|---|
| Layout (19) | aspect-ratio `aspect-*`; columns `columns-*`; break-after/before/inside (native, resolver misses); box-decoration-break (native); box-sizing; display; float/clear (resolver lacks `clear-end`); isolation; object-fit; object-position (lacks `object-[a_b]`); overflow; overscroll; position; inset `top/right/bottom/left/inset-*` (lacks logical `inset-s-*`/`inset-e-*`); visibility; z-index | 17 | 2 | 0 |
| Flexbox & Grid (23) | flex-basis, direction, wrap, flex, grow, shrink, order, grid-template-cols/rows (incl. subgrid, `(--var)`), grid-column/row (span/start/end/negative), grid-auto-flow/cols/rows, gap(-x/-y), justify-*, align-*, place-*, `*-safe` | 23 | 0 | 0 |
| Spacing (2) | padding, margin: `p-*`, `px-*`, `ps/pe`, negative margins, arbitrary values ok; lacks block-axis logical `pbs-*`/`pbe-*`/`mbs-*`/`mbe-*` (v4.2). space-x/y and divide-x/y ok, `*-reverse` missing | 0 | 2 | 0 |
| Sizing (12) | width (lacks `w-3xs..`, `w-lh`), min-w, max-w, height, min-h, max-h ok (`h-dvh/svh/lvh`, `size-*`, fractions, `(--v)`); inline-size, min/max-inline, block-size, min/max-block only partly native (`min-inline-0`, `max-block-full` native; resolver lacks `inline-4`, `block-8`, `max-inline-md`) | 5 | 7 | 0 |
| Typography (31) | font-family, size (incl. `text-sm/6`, `text-[13px]`), smoothing, style, weight, variant-numeric, letter-spacing, line-clamp, line-height, list-style-position, text-align/color/decoration-*/underline-offset/transform/overflow/wrap/indent, white-space, word-break, overflow-wrap (`wrap-*`), hyphens, content ok. Partial: font-stretch (`font-stretch-50%`), font-feature-settings (`font-features-[]`), list-style-image/type arbitrary (`list-image-[]`, `list-[]`), tab-size (native only), vertical-align arbitrary (`align-[3px]`) | 25 | 6 | 0 |
| Backgrounds (8) | attachment, clip, color (`/50`, `(--v)`), origin, position, repeat, size ok; image/gradients `bg-linear-*`, `bg-gradient-to-*`, `bg-radial`, `bg-conic`, `from/via/to-*`, `bg-[url()]` ok; resolver misses gradient stop positions (`from-10%`), `bg-radial-[at_..]`, `bg-conic-180` (native has it) | 7 | 1 | 0 |
| Borders (8) | radius (incl. logical `rounded-ss`), width, color, style, outline-width/color/style/offset, ring / inset-ring / ring-offset, divide-* ok; resolver misses `border-bs` (logical, v4.2), `border-spacing-x` | 8 | 0 | 0 |
| Effects (14) | box-shadow, text-shadow, opacity, mix-blend, background-blend ok incl. colour and `/alpha`, `inset-shadow-*`. mask-*: 89 native classes exist but most Tailwind spellings do not resolve (`mask-add/alpha/center/cover/contain/no-repeat/linear-*/radial-*/t-from-*`, `mask-[url()]`) | 5 | 9 | 0 |
| Filters (18) | filter: blur, brightness, contrast, drop-shadow (lacks `drop-shadow-<color>`), grayscale, hue-rotate, invert, saturate, sepia; backdrop-* all 9 ok | 17 | 1 | 0 |
| Tables (4) | border-collapse, border-spacing, table-layout, caption-side | 4 | 0 | 0 |
| Transitions & Animation (6) | transition-property/behavior/duration/timing/delay, animate-* (spin, ping, pulse, bounce, arbitrary) | 6 | 0 | 0 |
| Transforms (11) | backface, perspective, skew, transform, transform-origin, transform-style ok; partial: perspective-origin (native only), rotate (`rotate-z-*`), scale (`scale-3d`, `scale-z-*`), translate (`translate-3d`), zoom (native only) | 6 | 5 | 0 |
| Interactivity (20) | appearance, caret-color, color-scheme, cursor, field-sizing, pointer-events, resize, scroll-behavior, snap-align/stop/type, user-select ok. Partial: accent-color (`accent-auto`), scrollbar-color/width/gutter (native has `scrollbar-thin/none/gutter-stable`, resolver does not), scroll-margin / scroll-padding (native only; `scroll-mt-2` fails in resolver), touch-action (`touch-pan-left`), will-change (`will-change-[a,b]`) | 12 | 8 | 0 |
| SVG (3) | fill, stroke, stroke-width | 3 | 0 | 0 |
| Accessibility (1) | forced-color-adjust, `sr-only`, `not-sr-only` | 1 | 0 | 0 |
| **Total (180 families)** | | **139** | **41** | **0** |

No family is entirely absent; every "partial" is a handful of forms. Concrete resolver misses found (fix list for work package A):
`pbs/pbe/mbs/mbe-*`, `inset-s/e-*`, `border-bs/be`, `w-3xs..7xl`, `w-lh/h-lh`, `inline-*`, `block-*`, `min/max-inline|block-*`, `space-x-reverse`, `divide-*-reverse`, `from-10%` / `via-30%` / `to-90%`, `bg-radial-[...]`, `bg-conic-<deg>`, all `mask-*` Tailwind spellings, `drop-shadow-<color>`, `rotate-z-*`, `scale-3d`, `scale-z-*`, `translate-3d`, `zoom-*`, `perspective-origin-*`, `scrollbar-*`, `scroll-m/p-*` family, `will-change-[..]`, `touch-pan-left`, `accent-auto`, `tab-*`, `clear-end`, `object-[..]`, `list-[..]`, `list-image-[..]`, `font-stretch-<pct>`, `font-features-[..]`, `align-[..]`, `object-top-left`, `container-type-*`, bare `@container/name`, `transform-cpu`.

### 1.2 Variants

| Tailwind variant | OmniaCSS native | Resolver (`variants.mjs`) | Status |
|---|---|---|---|
| hover, focus, active, focus-visible, focus-within, visited, target | partial (fixed list in `_state_variants.scss`; colours and text-decoration full) | yes | have (R) / partial (N) |
| disabled, enabled, checked, indeterminate, default, required, optional, valid, invalid, user-valid, user-invalid, in-range, out-of-range, read-only, placeholder-shown, autofill, empty | no | yes | have (R) / missing (N) |
| first, last, only, odd, even, first/last/only-of-type, nth-*, nth-last-*, nth-of-type-* | no | yes | have (R) |
| before, after, first-letter, first-line, marker, selection, file, placeholder, backdrop | partial | yes | have (R) |
| group-*, group-*/name, peer-*, peer-*/name | `.group` + `group-hover` only (16 rules) | yes, nested and named | have (R) / partial (N) |
| has-*, not-*, in-*, group-has-*, `*:`, `**:` | no | yes (`not-*` also for media) | have (R) |
| aria-* (boolean list and `aria-[x=y]`), data-* (`data-[x=y]`, `data-active`) | no | yes | have (R) |
| supports-[..], not-supports-[..] | no | yes | have (R) |
| starting: | yes (`_starting_style.scss`) | yes | have |
| motion-safe/reduce, print, portrait/landscape, contrast-more/less, forced-colors, pointer-fine/coarse/none, any-pointer-*, noscript | only a `prefers-reduced-motion` reset | yes | have (R) |
| rtl, ltr | `rtl` (2 rules) | yes (`[dir=..]`) | have (R) |
| dark: | yes (64 rules, `_dark_mode.scss`) and `auto-dark:` | yes (media or selector, configurable) | have |
| open: | no | yes (`[open], :popover-open, :open`) | have (R) |
| inert: | 3 rules | yes | have |
| Viewport sm/md/lg/xl/2xl, max-*, min-[..], max-[..], stacked `sm:max-lg:` | sm/md/lg only (36/50/64rem) | all five plus custom `--breakpoint-*` | have (R) / partial (N) |
| Container queries `@sm:`, `@max-md:`, `@min-[..]:`, named `@lg/name:` | `cq-*` helper classes (container-type plus a few size classes, about 76 rules), not variants | yes | have (R) / partial (N) |
| Arbitrary variants `[&>*]:`, `[&_p]:`, `[@media(..)]:` | no | yes | have (R) |
| `!` important (prefix and suffix), prefix option, negative values, `/opacity` modifiers, `(--var)` shorthand | no | yes | have (R) |
| Missing everywhere | | `details-content:`, `inverted-colors:`, `popover-open:`, `scroll-state` (`stuck:`, `snapped:`), `min-<screen>:`, bare `@container`, `hover` gated by `@media (hover:hover)` (Tailwind v4 behaviour; resolver emits plain `:hover`) | missing |

Variant count (about 100 distinct Tailwind variant forms): resolver have about 92, missing about 8; native have about 12, partial about 8, missing about 80.

### 1.3 Features

| Feature | Status | Where |
|---|---|---|
| Arbitrary values `w-[..]`, `bg-[#..]`, type hints `text-[length:..]`, `(--var)` | have (R) | `values.mjs` |
| Arbitrary properties `[mask-type:alpha]` | not tested, verify | `resolve.mjs` |
| `@theme` tokens (`--color-*`, `--spacing`, `--breakpoint-*`) | have (R, PostCSS) | `project.mjs`, `postcss.mjs` |
| Native `@theme`-style authoring for users who do not migrate (user tokens become generated utilities) | missing; the core engine tree-shakes a fixed utility set, no user-defined scale | gap |
| `@apply`, `@variant`, `@custom-variant`, `theme()`, `--spacing()`, `--alpha()`, `@source inline()` | have (R) | `postcss.mjs` |
| `@utility`, `@plugin`, `@config`, `@reference`, `@import "tailwindcss" layer()` | missing | gap |
| Opacity modifiers `bg-red-500/50`, `text-black/[.3]` | have (R); colours only resolve to Omnia tokens (golden colour rule) | `values.mjs` |
| Colour palette (22 families x 11 shades) | have via COLOR_MAP remap to Omnia tokens; native Omnia, HTML and RAL palettes | `COLOR_MAP` |
| Preflight | have | `preflight.mjs`, `src/scss/base/_reset.scss` |
| Source detection / content scanning | have | `scan.mjs`, `extract.mjs`, CLI `build` |
| Dark mode strategies (media, class, data-theme) | have | |
| IntelliSense / editor plugin, class sorter, `tailwind-merge` equivalent | missing | P3 |

Features: have 8, partial 1, missing 5.

---

## 2. Components: shadcn/ui (64) vs OmniaCSS

OmniaCSS manifest: 47 components and 30 blocks. Parity check: every component and every block exists in CSS (`packages/components`, `packages/blocks`), Vue (`OcX`), React and Blade (`resources/views/components`). Verified programmatically: 0 manifest items are missing from any wrapper.
Docs coverage: 7 components have no own docs page (`form-field, input, textarea, select, checkbox, switch, input-group`; they are covered inside `forms.html`), 3 blocks have none (`hero-split, page-hero, stats-counter`).

| shadcn component | OmniaCSS equivalent | CSS | Vue | React | Blade | Status |
|---|---|---|---|---|---|---|
| Accordion | accordion (`details name`) | y | y | y | y | have |
| Alert | alert | y | y | y | y | have |
| Alert Dialog | alert-dialog | y | y | y | y | have |
| Aspect Ratio | `aspect-*` utility | y | - | - | - | have (utility; no snippet or doc) |
| Attachment | none | n | n | n | n | missing |
| Avatar | avatar (+ group) | y | y | y | y | have |
| Badge | badge | y | y | y | y | have |
| Breadcrumb | breadcrumb | y | y | y | y | have |
| Bubble | none | n | n | n | n | missing |
| Button | button (`oc-btn`, variants, sizes, gradient/glass/pill) | y | y | y | y | have |
| Button Group | `.oc-btn-group` in CSS, not in manifest | y | n | n | n | partial |
| Calendar | none | n | n | n | n | missing |
| Card | card | y | y | y | y | have |
| Carousel | none (scroll-snap utilities exist) | n | n | n | n | missing |
| Chart | none | n | n | n | n | missing |
| Checkbox | checkbox | y | y | y | y | have |
| Collapsible | collapsible | y | y | y | y | have |
| Combobox | none (command + tag-input cover pieces) | n | n | n | n | missing |
| Command | command | y | y | y | y | have |
| Context Menu | none | n | n | n | n | missing |
| Data Table | table + block data-table (sort/filter/pagination wiring is manual) | y | y | y | y | partial |
| Date Picker | none | n | n | n | n | missing |
| Dialog | modal (`<dialog>`, invoker commands) | y | y | y | y | have |
| Direction | rtl variants + logical props, no provider | - | n | n | n | partial |
| Drawer | sheet (side only; no bottom drag drawer) | y | y | y | y | partial |
| Dropdown Menu | dropdown (popover + anchor; no sub-menus, checkbox/radio items) | y | y | y | y | partial |
| Empty | empty-state | y | y | y | y | have |
| Field | form-field + `.oc-field*` | y | y | y | y | have |
| Hover Card | none (popover/tooltip are close) | n | n | n | n | missing |
| Input | input | y | y | y | y | have |
| Input Group | input-group | y | y | y | y | have |
| Input OTP | otp-input | y | y | y | y | have |
| Item | none | n | n | n | n | missing |
| Kbd | none (no `.oc-kbd`) | n | n | n | n | missing |
| Label | `.oc-label` CSS only | y | n | n | n | partial |
| Marker | none | n | n | n | n | missing |
| Menubar | none | n | n | n | n | missing |
| Message | none | n | n | n | n | missing |
| Message Scroller | none | n | n | n | n | missing |
| Native Select | select (native) | y | y | y | y | have |
| Navigation Menu | navmenu (no mega-menu viewport) | y | y | y | y | have |
| Pagination | pagination | y | y | y | y | have |
| Popover | popover | y | y | y | y | have |
| Progress | progress | y | y | y | y | have |
| Questionnaire | none (stepper and wizard-dialog block are neighbours) | n | n | n | n | missing |
| Radio Group | `.oc-radio` CSS only, not in manifest | y | n | n | n | partial |
| Resizable | none | n | n | n | n | missing |
| Scroll Area | `.oc-scrollbar` utilities only | y | n | n | n | partial |
| Select | select (native; no custom listbox) | y | y | y | y | have |
| Separator | `.oc-separator` CSS + docs page, not in manifest | y | n | n | n | partial |
| Sheet | sheet | y | y | y | y | have |
| Sidebar | sidebar (collapsed, floating, right, menu, sub, badge) | y | y | y | y | have |
| Skeleton | skeleton | y | y | y | y | have |
| Slider | none (range input unstyled) | n | n | n | n | missing |
| Spinner | none (no `.oc-spinner`; `animate-spin` utility exists) | n | n | n | n | missing |
| Switch | switch | y | y | y | y | have |
| Table | table | y | y | y | y | have |
| Tabs | tabs | y | y | y | y | have |
| Textarea | textarea | y | y | y | y | have |
| Toast | toast (+ container) | y | y | y | y | have |
| Toggle | none (switch only) | n | n | n | n | missing |
| Toggle Group | segmented | y | y | y | y | partial |
| Tooltip | tooltip | y | y | y | y | have |
| Typography | typography utilities only, no `.oc-prose` | y | n | n | n | partial |

Counts (64): have 33, partial 11, missing 20.

Omnia-only components with no shadcn twin (keep): theme-switch, counter, back-link, user, stepper, definition-list, checklist, tag-input, password-input, copy-field, color-field, dropzone, launcher-card, recovery-codes, heading.
Cheapest wins (CSS exists, only needs manifest entry + wrappers + docs): button-group, label, radio-group, separator, scroll-area, toggle (from switch/segmented).
shadcn also ships Forms integrations (React Hook Form, TanStack Form, Formisch) and AI helpers (AI SDK, TanStack AI); no counterpart, React-package P3.

---

## 3. Blocks

OmniaCSS has 30 blocks: app and settings (auth, auth-split, two-factor, app-shell, app-header, module-header, dashboard-stats, data-table, settings-page, form-page, team-list, wizard-dialog, hub-launcher, onboarding-checklist) and 16 marketing blocks (hero, hero-split, hero-code, page-hero, features, pricing, cta, stats, stats-counter, footer, site-header, site-footer, process, spotlight, showcase, product-grid).

| shadcn block family | shadcn count | OmniaCSS equivalent | Status |
|---|---|---|---|
| dashboard-01 (sidebar + chart cards + data table) | 1 | app-shell + dashboard-stats + data-table (no charts) | partial |
| sidebar-01..16 | 16 | `sidebar` component variants + `app-shell`. Covered by props: 01 grouped nav, 02 collapsible groups, 03 submenus, 04 floating, 05 collapsible submenu, 07 icon-collapse, 14 right side. Missing demos: 06 dropdown footer, 08 inset + secondary nav, 09 nested sidebars, 10 popover, 11 file tree, 12 calendar, 13 in dialog, 15 left + right, 16 sticky header | partial (7 have, 9 missing) |
| login-01..05 | 5 | auth (centered), auth-split (image side); 03 muted bg, 04 image, 05 magic link not distinct | partial (2 have, 3 missing) |
| signup-01..05 | 5 | no signup block (auth block can be reused) | missing |
| otp-01..05 | 5 | two-factor + otp-input component | partial (1 have, 4 missing) |
| calendar-01..32 | 32 | none (Calendar component missing) | missing |
| authentication, products, settings, forms | few | settings-page, form-page, product-grid exist | partial |
| charts (area, bar, line, pie, radar, radial, tooltips; about 60 demos) | about 60 | none | missing |
| Marketing / landing blocks | not in shadcn core | 16 Omnia-only | advantage |
| Block gallery features: per-block preview, fullscreen view, copy code, responsive viewport toggle | | docs has preview + code per block (27 of 30 pages) | partial |

Counts (about 130 block ids excluding charts, about 190 with charts): have about 12, partial about 8 families, missing about 105 ids (calendar x32, charts x60, signup x5, otp x4, sidebar x9, login x3).

---

## 4. Docs-site features

| shadcn docs feature | OmniaCSS docs today (`apps/docs`, Astro, pages generated from `src/content/ui/**` HTML) | Status |
|---|---|---|
| Per-component page | yes, `/ui/components/<name>` (about 48 pages) with `<oc-demo>` preview + `<oc-code>` | have |
| Preview / Code tabs | demo shows preview with code block beneath; no tab switch | partial |
| Framework switcher (HTML / Vue / React / Blade) per example, remembered | none; framework info lives on 3 separate pages `frameworks-vue/react/laravel` | missing |
| Installation: CLI + Manual | CLI `omniacss add <name> -f css/vue/react/blade` and `list` exist (`packages/cli`) but component pages do not show them | partial |
| Usage section | partly (hero text + snippets) | partial |
| Examples (variants, sizes, icon, loading ...) | yes for most | have |
| Props / API table | CSS class tables on some pages (`oc-table-ref`); no Vue props, React props or Blade attribute tables | partial |
| Copy button on code | verify `oc-code`; `copy-field` component exists | partial (verify) |
| Theme customizer / editor (colour picker, radius, presets, copy CSS) | `theming.html` token reference + `theme-switch` (system/light/dark); no live customizer, no presets | missing |
| Dark-mode toggle | yes (`oc-theme-switch`, persisted in localStorage) | have |
| Search with Cmd+K | none; only a `command` component demo | missing |
| Component index / directory | `components.html`, `blocks.html` | partial |
| Blocks gallery with responsive viewport preview | `blocks.html` + 27 pages | partial |
| Charts gallery | none | missing |
| Registry (`registry.json`, `registry-item.json`, namespaces, MCP server, `llms.txt`, open-in) | `manifest.json` per package + CLI `add`/`list`; no public registry JSON schema, no `llms.txt`, no MCP | partial |
| `components.json` equivalent | `omnia.config.json` (init detects Laravel/Astro/Nuxt/Vite) | have |
| Utility reference docs | 213 astro pages under `/docs`, live demos per utility | have (advantage) |
| Tailwind migration guide | `migrate.astro` | have (advantage) |
| Changelog page, Figma kit, skills | none | missing (P3) |

Counts (19 rows): have 6, partial 9, missing 4 (counting changelog/Figma/skills as one).

---

## 5. Prioritised backlog

Packages have disjoint file ownership so they can run in parallel. Sizes (agent-days): S under 1, M 1-2, L 3-5, XL over 5.

### Package A: core utilities and variants (SCSS + resolver)
Files: `src/scss/utilities/**`, `src/scss/layout/**`, `packages/migrate/src/{utilities,variants,values,resolve}.mjs`, `packages/migrate/test/**`, `packages/core/src/**`, docs for new utilities under `apps/site/src/content/docs/**` and `apps/site/src/pages/docs/**`.
- P1 (M): close the resolver miss list in 1.1 (logical `pbs/mbs/border-bs/inset-s`, `inline-*/block-*`, `w-3xs`, `*-reverse`, gradient stop positions, `bg-radial-[..]`, mask-* spellings mapped onto the existing native mask classes, `drop-shadow-<color>`, 3D transform/rotate/scale/translate, scroll-m/p, scrollbar-*, will-change / touch-action / accent-auto / tab, arbitrary object/list/align/font-feature). One test per class.
- P1 (S): missing variants `details-content`, `inverted-colors`, `popover-open`, `scroll-state` (`stuck/snapped`), `min-<screen>`, bare `@container`; optional `@media (hover:hover)` gating for `hover:`.
- P2 (L): decide native vs on-demand. Either generate native state variants in SCSS (`peer-*`, `has-*`, `aria-*`, `data-*`, `open:`, `focus-within`, `disabled`, `motion-safe/reduce`, `print`, `supports`, xl/2xl; careful: size explosion) or promote the on-demand engine (`omniacss build` already tree-shakes) as the native path and document it. Recommended: on-demand.
- P2 (M): user-theme tokens outside the migrate plugin: `@theme` in plain CSS processed by `omniacss build` (spacing scale, breakpoints, colours to utilities), `@utility`, `@source`, `@custom-variant`.
- P3 (M): VS Code class IntelliSense from the omnia.css class set, class sorter, read-only `@plugin` / `@config` compat.

### Package B: CSS components (`packages/ui/src/components.css`, `snippets/*.html`, `manifest.json`)
- P1 (S): register what exists: button-group, label, radio-group, separator, scroll-area, toggle, toggle-group (via segmented), typography `.oc-prose`.
- P1 (M): new simple components: spinner, kbd, slider (styled range), toggle, item, hover-card, menubar, context-menu (popover + contextmenu), aspect-ratio snippet, carousel (scroll-snap + `::scroll-button`), resizable, combobox (command + popover), dropdown sub-menus and checkbox/radio items, drawer (bottom sheet).
- P2 (L): calendar and date-picker (native `<input type=date>` fallback + CSS grid month view), chart tokens (`--oc-chart-1..5`, pure CSS/SVG bar/line/area/pie/radial/radar classes), data-table enhancements.
- P3 (M): attachment, bubble, message, message-scroller, marker, questionnaire, direction helper.
B owns the components manifest, so B-P1 must land before D/E/F consume new names.

### Package C: blocks (`packages/blocks/**`)
- P1 (M): signup x3, login 03-05, otp x3, sidebar-01..16 demos as blocks (using the existing sidebar), page-hero / hero-split / stats-counter docs pages hooks.
- P2 (L): dashboard-01 (needs chart tokens from B), calendar blocks (after B calendar), charts gallery (about 30 cards to start), products and authentication variants.
- P3 (S): per-block `view` / responsive metadata in manifest.

### Package D: Vue (`packages/vue/**`)
- P1 (M): wrap the B-P1 list (`OcButtonGroup`, `OcLabel`, `OcRadioGroup`, `OcSeparator`, `OcScrollArea`, `OcToggle`, `OcSpinner`, `OcKbd`, `OcSlider` ...) plus tests; update manifest and snippet links.
- P2 (L): calendar, date-picker, carousel, combobox, context-menu, menubar, hover-card, resizable, drawer; new blocks (`OcBlock*`).
- P3 (M): v-model helpers, form integrations (VeeValidate / FormKit), chart components.

### Package E: React (`packages/react/**`)
Mirror D with the same names (kebab file names). P1 (M), P2 (L), P3 (M). P3 extras: React Hook Form and TanStack Form field adapters, AI SDK helper set for message / bubble / message-scroller.

### Package F: Blade / Livewire (`php-packages/omniaui-laravel/**`)
- P1 (M): Blade wrappers for the B-P1 list with the existing `x-oc-*` prefix convention; update `PublishComponentsCommand` file lists.
- P2 (L): Livewire/Alpine aware variants (wire:model on slider, calendar, combobox, toggle), signup/login/otp blocks.
- P3 (S): starter-kit docs, Filament/Flux bridge notes.

### Package G: docs gallery pages (`apps/site/src/**`, `scripts/routes.mjs`; never edit built `public/**` by hand)
- P1 (L): per-component page template with Preview | Code tabs, framework switch (HTML / Vue / React / Blade, persisted), Installation (CLI `npx omniacss add <name> -f <fw>` and manual), Usage, Examples, API/props table generated from `packages/*/manifest.json`. Add missing docs pages for 7 form components and 3 blocks. Generate all four framework snippets from one data source instead of hand-writing them.
- P1 (M): Cmd+K search (static index built at build time, rendered with the `command` component); copy buttons everywhere.
- P2 (L): theme customizer (live `--oc-*` tokens, radius, presets taken from the Omnia palette only per the golden colour rule, copy CSS), blocks gallery with responsive viewport toggle, charts gallery page.
- P3 (M): public registry JSON (`/r/<name>.json` + schema), `llms.txt`, changelog page, MCP server over the manifest.

### Order of work and total effort
1. A-P1 and B-P1 first, in parallel (disjoint files).
2. D/E/F-P1 after B-P1 (need final class names), in parallel; G-P1 in parallel (needs only manifests).
3. C-P1, then B/D/E/F-P2, then C-P2 and G-P2. P3 last.
Rough total in agent-days: A about 8, B about 12, C about 8, D/E/F about 8 each, G about 8; about 60 overall, each package splits further per component group.

---

## Summary counts

| Section | Have | Partial | Missing |
|---|---|---|---|
| Utility families (180) | 139 | 41 | 0 |
| Variants (about 100), resolver / native | 92 / 12 | 0 / 8 | 8 / 80 |
| Features (14) | 8 | 1 | 5 |
| shadcn components (64) | 33 | 11 | 20 |
| Blocks (about 130 ids excl. charts) | about 12 | about 8 families | about 105 (incl. 60 chart demos) |
| Docs-site features (19 rows) | 6 | 9 | 4 |
