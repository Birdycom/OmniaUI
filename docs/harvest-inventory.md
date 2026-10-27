<!-- File: docs/harvest-inventory.md | Map: sources -> group A forms -> group B app UX -> group C media -> group D marketing -->
All items listed below were implemented in OmniaUI 0.6.0.
affix-input is `.oc-input-group--affix`. accordion-accent and table-compact are their own pages. confirm-dialog is an alert-dialog variant.

# OmniaUI harvest inventory

UI candidates found in our other web apps (read-only scan, October 2026).
The OmniaDesk apps (React + Vue) were inventoried earlier in `docs/omniadesk-inventory.md`.

Status per item: **NEW** = not in OmniaUI yet, **variant** = extend an existing component with a modifier.
Paths are relative to the source app.

## Sources

| App | Stack | Worth harvesting |
|---|---|---|
| korrektinterieur | React 19 + Vite + shadcn | Yes: admin/ERP form controls and data-table extras |
| birdycom | Plain PHP + vanilla CSS/JS | Yes: marketing blocks |
| datashadow | Next.js 16 | Some: terminal log, language select, severity card |
| MySubStream | Vue 3 + Tauri + Laravel API | Yes: media library patterns |
| smartreceipt_v2 | Next.js 15 | Some: FAQ, price card, locale controls |
| thoth | React 19 + Vite + shadcn | Some: flip card, list toolbar, image zoom |
| historytabs | Python Tkinter | No (desktop only) |
| smartreceipt (v1) | React Native | No (no shared UI) |

## Group A — Forms and inputs

| Name | Source | What | Status |
|---|---|---|---|
| phone-input | korrektinterieur `src/components/ui/app-phone-input.tsx` | Country dial code + formatted national number | NEW |
| number-input | korrektinterieur `app-number-input.tsx` | Number field with - / + steppers | NEW |
| affix-input | korrektinterieur `app-affix-input.tsx`, `app-euro-input.tsx`, `app-percent-input.tsx`, `app-email-input.tsx` | Prefix/suffix zone (€, %, @) | variant of input-group |
| decimal-input | korrektinterieur `app-decimal-input.tsx` | Locale decimal formatting (1.234,56) | NEW |
| time-input | korrektinterieur `app-time-input.tsx` | 24h time field + slot list | NEW |
| barcode-input | korrektinterieur `app-barcode-input.tsx` | Barcode field + preview area | NEW |
| color-select | smartreceipt_v2 `components/ui/ColorSelectField.tsx`, korrektinterieur `app-color-picker.tsx` | Select with a swatch per option / swatch popover | NEW |
| language-select | datashadow `src/components/ui/LanguageSelector.tsx`, smartreceipt_v2 `LanguageDropdown.tsx`, `CurrencyDropdown.tsx`, thoth `app-header/languagemenu.tsx` | Header locale / currency switcher | NEW |
| toggle-field | smartreceipt_v2 `components/ui/ToggleField.tsx` | Switch + label + description row | variant of switch |
| password-requirements | korrektinterieur `src/components/auth/PasswordRequirementsList.tsx` | Live password rule checklist | NEW |
| chip-filter | datashadow `ScanModeSelector.tsx`, MySubStream `GroupFilter.vue` | Rounded filter chips | variant of segmented |
| filter-counts | smartreceipt_v2 `components/receipts/TransactionFilter.tsx` | Active / deleted / all filter with counts | NEW |

## Group B — Data and app UX

| Name | Source | What | Status |
|---|---|---|---|
| table-actions | korrektinterieur `table-action-buttons.tsx` | Row actions as icons or overflow menu | NEW |
| column-menu | korrektinterieur `app-kolommen-menu.tsx` | Column visibility checklist menu | NEW |
| sortable-row | korrektinterieur `app-sortable-table-row.tsx` | Table row with drag grip (styling) | NEW |
| tree | korrektinterieur `app-boom.tsx` | Tree list with sticky action column | NEW |
| top-progress | korrektinterieur `top-progress-bar.tsx` | Thin page-top loading bar | NEW |
| confirm-dialog | korrektinterieur `confirm-dialog.tsx` | Typed confirm with icon ring + discard action | variant of alert-dialog |
| list-toolbar | thoth `dictionary/DictionaryViewToolbar.tsx`, `ViewToggle.tsx` | Search + cards/table toggle + actions | NEW |
| alpha-tabs | thoth `dictionary/SectionTabs.tsx` | All + A–Z filter tabs | NEW |
| version-banner | korrektinterieur `layout/AppVersionBanner.tsx` | "New version — reload" chip | NEW |
| greeting | korrektinterieur `layout/DashboardHeader.tsx` | Time-of-day greeting + date | NEW |
| stat-card | korrektinterieur `layout/StatCard.tsx` | KPI tile with icon + accent | variant |
| severity-card | datashadow `findings/FindingCard.tsx` | Risk-coloured expandable card | NEW |
| upgrade-banner | MySubStream `FreePlanBanner.vue` | Soft plan / limits callout | NEW |
| page-header | korrektinterieur `layout/PageHeader.tsx`, thoth `app-page-layout/pageheader.tsx` | Title + subtitle + back + actions | variant of module-header |
| accordion accent | korrektinterieur `app-accordion.tsx` | Accordion card with coloured left accent | variant |
| table compact | korrektinterieur `app-table.tsx` | Compact striped table for cards | variant |
| status-page | korrektinterieur `status/StatusPage.tsx`, birdycom `pages/404.php` | 404 / 403 / 500 split page | block NEW |

## Group C — Media and content

| Name | Source | What | Status |
|---|---|---|---|
| lightbox | birdycom `partials/lightbox.php` + `assets/css/lightbox.css`, korrektinterieur `project/UpdateImageGallery.tsx` | `<dialog>` gallery with nav, counter, caption | NEW |
| image-zoom | thoth `translate/TranslateImageZoom.tsx` | Zoom / pan viewport | NEW |
| media-thumb | MySubStream `VideoPreviewThumb.vue` | 16:9 thumb + duration badge + watch progress | NEW |
| media-card | MySubStream `FeedVideoCard.vue` | Thumb + avatar + title/meta + menu | NEW |
| media-row | MySubStream `WatchSidebarVideo.vue`, `playlist/PlaylistVideoListItem.vue` | Compact horizontal media row (numbered variant) | NEW |
| stack-card | MySubStream `playlist/PlaylistStackCard.vue`, `CourseCard.vue` | Stacked "deck" card with count badge | NEW |
| flip-card | thoth `pages/FlashCardsPage.tsx` + `src/index.css` | 3D flip front / back card | NEW |
| entity-card | thoth `dictionary/SymbolFrame.tsx`, `*Card.tsx` | Framed media cell + detail column | NEW |
| emoji-picker | korrektinterieur `meldingen/ChatEmojiPicker.tsx` | Compact emoji grid popover | NEW |
| chat-composer | korrektinterieur `meldingen/ChatComposerField.tsx` | Chat textarea + toolbar + send | NEW |
| terminal-log | datashadow `scan/TerminalLog.tsx` | Live console with levels + blinking cursor | NEW |
| browser-frame | birdycom `assets/css/portfolio.css` | Fake browser chrome around a screenshot | NEW |

## Group D — Marketing blocks and small site parts

| Name | Source | What | Status |
|---|---|---|---|
| faq | smartreceipt_v2 `components/ui/FAQSection.tsx` | FAQ section (title + accordion) | block NEW |
| price-card | smartreceipt_v2 `components/ui/PriceCard.tsx` | Monthly / yearly toggle, discount, included / excluded features | variant of pricing |
| about-timeline | birdycom `sections/about.php` + `pages.css` | About split + vertical year timeline | block NEW |
| timeline | birdycom `pages.css` | Vertical timeline | component NEW |
| marquee | birdycom `pages.css` (process) | Looping chip strip | component NEW |
| product-mark | birdycom `partials/product-mark.php` | Squircle app icon tile (sm / lg / xl) | component NEW |
| project-card | birdycom `partials/project-card.php` | Portfolio card with browser-frame preview | component NEW |
| link-arrow | birdycom `assets/css/components.css` | Text link with animated arrow | component NEW |
| stack-list | birdycom `pages.css` | Tech stack pills | component NEW |
| fact-list | birdycom `pages.css` | Key / value product facts | variant of definition-list |
| next-teaser | birdycom `pages.css` | "Next product" teaser card | component NEW |
| contact-grid | birdycom `pages/contact.php` | Contact info cards | block NEW |
| hero-orbit | birdycom `sections/hero.php` | Hero with code window + orbiting product marks | variant of hero-code |
| profile-header | MySubStream `channel/ChannelHeader.vue`, `ChannelTabBar.vue` | Banner + overhanging avatar + tabs | block NEW |
| watch-layout | MySubStream `views/WatchView.vue` | Player column + related list | block NEW |
| portfolio-grid | birdycom `sections/portfolio.php` | Project card grid | block NEW |
