# OmniaDesk UI inventory

Phase 1 of absorbing the UI of the two OmniaDesk apps into OmniaCSS. Sources were read-only.
Since the split (v0.6.0) this work belongs to OmniaUI. Paths `packages/components` are now `packages/ui`.

- **R** = `D:\webdev\omniadesk\resources\js\components\...` (React + Inertia, `.tsx`)
- **V** = `D:\webdev\omniadesk_vue\resources\js\components\...` (Vue + Inertia, `.vue`)
- The two apps mirror each other: almost every component exists in both with the same name and props. A path is
  listed once as `ui/app-button/AppButton` and means `R: ...tsx`, `V: ...vue`. The React app has a few extra inputs
  (see "Inputs") that the Vue app does not have yet. The Blade views in `omniadesk/resources/views` are only PDF/report
  templates and are not UI components.
- Status: **exists** (already in OmniaCSS), **NEW** (implemented in this phase), **TODO** (not done, reason given),
  **n/a** (framework or domain logic, no CSS to absorb).
- Classification: **component** = small UI primitive, **block** = composed section.
- All new CSS lives in `packages/ui/src/components.css` (section "APP COMPONENTS") and
  `packages/blocks/src/blocks.css` (section "APPLICATION BLOCKS"). Snippets in `packages/ui/snippets/` and
  `packages/blocks/blocks/`; docs pages in `apps/site/src/content/ui/{components,blocks}/`.
- Every snippet starts with a comment listing its class API (modifiers, states) and slots, so a wrapper can be
  generated from the snippet alone.

## Primitives

| Source component | What it does | Props / variants / slots | OmniaCSS | Class. | Status |
|---|---|---|---|---|---|
| `ui/app-button/AppButton` (+ `appButtonVariants`) | Button, can render as link (`as-child`) | variant default/primary/secondary/outline/ghost/link/destructive; size default/sm/lg/icon; `icon`, `disabled`, `type`; slots default, icon | `button` (`.oc-btn--*`) | component | exists |
| `ui/app-badge/AppBadge` | Pill badge, optional icon | variant default/secondary/destructive/outline/contactReadonly; `icon`, `title`, `uiModule`; slots default, icon | `badge`; added `.oc-badge--info` | component | exists (+info). `contactReadonly` is a module-specific style: use `.oc-badge--outline` + a scoped `--oc-primary` |
| `ui/app-card/*`, `ui/card/*` | Card: header, title, description, header actions, content, footer | slots per part; `AppCardHeaderActions` | `card` (`.oc-card-action`) | component | exists |
| `ui/app-alert-dialog/AppAlertDialog` | Confirm dialog with status icon | `type` success/error/warning/info/question; `title`, `message`, primary/secondary text; events primary/secondary | `alert-dialog` | component | **NEW** |
| `ui/dialog/*` | Modal (header, title, description, footer, scroll content) | trigger, content, header, footer, close | `modal` (`<dialog>`) | component | exists |
| `ui/sheet/*` | Side panel (left/right/top/bottom) | side; header, title, description, footer, close | `sheet` (`<dialog class="oc-sheet">`) | component | **NEW** |
| `ui/popover/*` | Floating panel | trigger, content, anchor | `popover` (`[popover]` + anchor positioning) | component | **NEW** |
| `ui/dropdown-menu/*` | Menu: items, label, separator, shortcut, checkbox/radio items, sub menus | trigger, content, group, item... | `dropdown` (`.oc-dropdown-menu[popover]`) | component | exists. Checkbox/radio items and nested sub menus: TODO (use `.oc-dropdown-item` + native inputs, nested popover) |
| `ui/command/*` | Command palette / searchable list | input, list, group, item, shortcut, empty, separator | `command` (styling only; filtering is wrapper logic) | component | **NEW** |
| `ui/navigation-menu/*` | Horizontal nav with flyouts | list, item, trigger, content, link, indicator | `navmenu` + dropdown | component | **NEW** |
| `components/AppHeader`, `ui/app-header/AppHeaderModuleNav`, `AppHeaderActionItems` | Header bar with module links, dropdown groups, actions | `section` (links, dropdowns) | `app-header` block + `navmenu` | block | **NEW** |
| `ui/app-sidebar/*` (24 parts), `NavMain`, `NavFooter`, `NavSidebarFlyout`, `NavUser`, `UserMenuContent` | Collapsible sidebar: header, groups, label, menu, menu button, badge, nested sub menu, footer, rail, icon-only mode, mobile sheet | `side`, `variant`, `collapsible`; `isActive`, `tooltip` per item | `sidebar` (`.oc-sidebar-*`, `--collapsed`, `<details>` sub menus) | component | **NEW**. Collapsed-state flyout of a sub menu: TODO (wrapper can use `popover`) |
| `components/AppShell`, `AppContent`, `layouts/AppLayout` | App frame: sidebar + header + breadcrumb strip + scroll area + toasts | slots header, default | `app-shell` | block | **NEW** |
| `ui/app-breadcrumb/*` (Trail, Item, Link, Page, Separator, Ellipsis) | Breadcrumb trail | `breadcrumbs[]` | `breadcrumb` | component | exists. Ellipsis (collapsed middle): TODO |
| `ui/app-back-link/AppBackLink` | "Back to {destination}" button | `fallbackHref`, `fallbackLabel`, `size` | `back-link` | component | **NEW** |
| `ui/app-tabs/*` (Tabs, List, Trigger, Content) | Tabs, variants default/line | `value`, `modelValue`, `disabled`, `icon` | `tabs` (radio + `:has()`) | component | exists |
| `ui/app-segmented-control`, `ui/app-radiobuttons/Radiobuttons` | Single-choice chips / pill switcher (`moduleStack` = stacked list) | `options[]`, `modelValue`, `groupLabel`, visualVariant | `segmented` (`--block` for the stacked variant) | component | **NEW** |
| `components/AppearanceTabs`, `LanguageSwitcher` | Theme (system/light/dark) and language switch | | `theme-switch`; language = `select`/`dropdown` | component | exists |
| `ui/app-wizard-step-nav/AppWizardStepNav` | Wizard steps: done / active / locked | `currentStep`, `totalSteps`, `stepLabels`, `stepPersistedDone`, `showStepFraction`; event select | `stepper` | component | **NEW** |
| `ui/app-notification/AppNotification`, `ToastContainer` (+ `useToast`) | Toast notifications | `variant` success/error/warning/info, `title`, `description`, close | `toast` (CSS auto-dismiss via `--auto`) | component | **NEW** |
| `ui/app-collapsible-form-section`, `ui/collapsible/*` | Card-style `<details>` section: icon, title, chevron | `title`, `icon`, `defaultOpen`, `dense` | `collapsible` | component | **NEW** |
| `ui/app-definition-list/AppDefinitionList` | Label/value rows in a panel | `title`, `description`, `rows[]`; slot footer | `definition-list` | component | **NEW** |
| `components/Heading`, `HeadingSmall` | Title + description | `title`, `description` | `heading` | component | **NEW** |
| `components/UserInfo`, `ui/avatar/*` | Avatar + name + e-mail | `user`, `showEmail`, `showAvatar`; image/fallback | `avatar` + `user` | component | exists (avatar) + **NEW** (`user`) |
| `components/TextLink`, `InputError` | Underlined link, field error | | `.oc-link`, `.oc-field-error` | component | exists |
| `ui/separator`, `ui/skeleton`, `ui/tooltip/*`, `ui/scroll-area/*` | Divider, loading shape, tooltip, scrollbar styling | | `separator`, `skeleton`, `tooltip`, `.oc-scrollbar` | component | exists |
| `ui/app-hub-launcher-card/AppHubLauncherCard` | Big clickable module/section tile | `title`, `description`, `href`, `asButton`, `disabled`, `active`, `module`; slots icon, titleTrailing, disabledFooter | `launcher-card` | component | **NEW** |
| (empty lists in tables/dashboards) | Empty state | | `empty-state` | component | **NEW** |
| `finance/InvoiceDropCard` | Drag/drop file card | `title`, `description`, `direction`, `compact`, accept | `dropzone` (label around a file input) | component | **NEW** |

## Form controls and inputs

| Source component | What it does | OmniaCSS | Class. | Status |
|---|---|---|---|---|
| `ui/app-input/AppInput` (+ `AppInputBase`, `appInputValidation`), `ui/input`, `ui/label` | Labeled input: tooltip, error, description, mask, validation types, ledger/title visual variants | `form-field` + `input` snippet (`.oc-input`, `--error`) | component | exists. Masks/validation = wrapper logic |
| `ui/app-textarea`, `ui/textarea` | Labeled textarea | `textarea` snippet | component | **NEW** (snippet; CSS existed) |
| `ui/app-select/AppSelect`, `AppSelectWithIcons`, `ui/select` | Select with search, icons, header size, ghost variant | `select` snippet (native `<select>`) | component | **NEW** snippet. Searchable/icon select: TODO (needs script; compose `popover` + `command`) |
| `ui/app-checkbox`, `ui/checkbox` | Checkbox | `checkbox` snippet (`.oc-checkbox`, `.oc-radio`) | component | **NEW** snippet |
| `ui/switch/*` | Toggle switch | `switch` snippet (`.oc-switch`) | component | **NEW** snippet |
| R `ui/app-affix-input`, `app-euro-input`, `app-percent-input`, `app-decimal-input`, `app-number-input` | Number field with prefix/suffix | `input-group` snippet (`.oc-input-addon`) | component | **NEW** snippet; number formatting = wrapper logic |
| R `ui/app-email-input`, `app-phone-input`, `app-time-input`, `app-barcode-input` | Typed inputs | `input` + native `type`, `inputmode` | component | n/a (native attributes + validation logic) |
| R `ui/app-password-input` | Password with show/hide | `password-input` | component | **NEW** (3 line optional script) |
| R `ui/app-otp-input` | One-time code boxes | `otp-input` (one real input drawn as cells) | component | **NEW** |
| R `ui/app-copy-field` | Read-only value + copy | `copy-field` | component | **NEW** (1 line optional script) |
| R `ui/app-password-requirements` | Live password rule list | `checklist` | component | **NEW** |
| R `ui/app-recovery-codes` | 2FA recovery codes, copy/download | `recovery-codes` | component | **NEW** |
| `ui/app-tagselector/AppTagSelector` | Tags + suggestions | `tag-input` | component | **NEW** |
| `ui/app-color-field/AppLedgerColorField` | Color picker + hex | `color-field` | component | **NEW** |
| `ui/app-collapsible-form-section` | see above | `collapsible` | component | **NEW** |

## Tables

| Source component | What it does | OmniaCSS | Class. | Status |
|---|---|---|---|---|
| `ui/app-table/AppTable`, `AppTableHead/Header/Body/Row/Cell/Footer/Caption`, `table.ts` | Table with fixed layout, sticky header, scroll wrapper | `table` (`.oc-table`, `.oc-table-wrap`; added `--compact`, `--striped`, `--sticky`, `--borderless`, `data-numeric`) | component | exists + **NEW** modifiers, `table` snippet |
| `AppTableSortLink` | Sortable header link with arrow | `.oc-table-sort` + `th[aria-sort]` | component | **NEW** |
| `AppTableActionsBar`, `AppTableRowAction` | Row actions (edit, view, toggle, destructive) | `.oc-table-actions`, `.oc-table-row-action--*` | component | **NEW** |
| `AppTableSkeleton` | Loading rows | `skeleton` | component | exists |
| `AppTablePagination` | Entries text, per-page, numbered pages | `.oc-table-footer` + `pagination` | component | **NEW** footer; pagination exists |
| `AppTableListToolbar`, `AppTableTrashedFilter` | Search + filter pills | `.oc-table-toolbar`, `.oc-filter-pills` | component | **NEW** |
| `AppTableListCard`, `AppDataTable` (+ `AppDataTableBulkMenu`, `AppTableColumnChooser`) | Complete list page: card, toolbar, selection, bulk actions, column chooser, pagination | `data-table` block | block | **NEW** |
| `AppTableColumnResizeHandle`, `AppTableDragHandle`, `AppTableSortSummaryHost` | Column resizing, row drag, sort summary | | component | TODO (pointer-event logic; CSS only needed for the handle) |
| `AppTableDesignSheet` | Per-user table design side panel | `sheet` + `checkbox` | block | covered by `sheet` |

## Blocks (composed sections)

| Source | What it does | OmniaCSS | Status |
|---|---|---|---|
| `layouts/AppLayout`, `components/core/OmniaDeskSidebar`, `OmniaDeskHeaderBar` | App shell | `app-shell`, `app-header` | **NEW** |
| `components/modules/*/…ModulePageShell` (9 modules) | Module page: hero band with icon, title, intro, actions | `module-header` | **NEW** (module tint = override `--oc-primary` on a wrapper) |
| `pages/Dashboard`, `modules/dashboard/ModuleDashboardQuickActionsLayout` | KPI cards + quick actions | `dashboard-stats`, `hub-launcher` | **NEW** |
| `pages/settings/ModulesHub`, `Global` | Grid of module/section tiles | `hub-launcher` | **NEW** |
| `layouts/auth/AuthSplitLayout`, `pages/auth/Login`, `Register`, `ForgotPassword`, `ResetPassword` | Split sign-in | `auth-split`; centered card = existing `auth` | **NEW** (+ exists) |
| `pages/auth` two-factor, `settings` security (OTP, recovery codes) | 2FA setup | `two-factor` | **NEW** |
| `layouts/settings/Layout`, `components/DeleteUser`, `AppearanceTabs` pages | Settings page: nav + sections + danger zone | `settings-page` | **NEW** |
| `onboarding/OwnerSetupChecklistCard` | Setup checklist with progress | `onboarding-checklist` | **NEW** |
| `onboarding/OwnerSetupCompanyWizardDialog`, `finance/FinanceInvoicingConfigDialogShell` | Wizard in a modal with stepper rail | `wizard-dialog` | **NEW** |
| `settings/SettingsTeamPanel`, `settings/team/*` (list, detail, create, identity/access/security/danger tabs) | Team members | `team-list` (+ `tabs`, `settings-page` for the detail tabs) | **NEW** (list); detail = composition of existing pieces |
| Create/edit pages built from `AppCollapsibleFormSection` | Form page with sticky actions | `form-page` | **NEW** |
| `layouts/auth/AuthCardLayout`, `AuthSimpleLayout` | Centered auth card | `auth` | exists |

## TODO / not absorbed

- **Domain components** (product catalog and business logic, built from the primitives above): `app-product-description-editor`
  (rich text editor), `app-product-documents-card`, `app-product-fee-section-picker`, `app-product-images-field`,
  `app-product-picker`, `app-product-serials-table`, `app-product-service-fees-picker`,
  `app-product-spec-sections-editor`, `contacts/*` (person form, persons panel, webapps panel, licenses, subscription
  dialog, invoice preview), `finance/AccountantExportLauncherNav`, `FinanceInvoicingCheckboxCard`,
  `microsoft365/*`, `workspace/*Switcher` (a `select` + tooltip; no new CSS).
- **JS-driven primitives**: searchable select/combobox, dropdown sub menus and checkbox/radio items, table column
  resize/drag, sidebar collapsed-state flyout, barcode display (SVG generator), `PdfJsCanvasPreview`,
  `PlaceholderPattern`, `AuthDashboardPreview` (decorative mock).
- **Module palettes**: both apps tint each module with `--od-mui-*` variables. In OmniaCSS re-tone a section by setting
  `--oc-primary` (and friends) on a wrapper; a documented `data-module` convention could follow.
- Kanban, ticket list: not present in either app.
- Optional follow-up: `.oc-btn--primary` alias, breadcrumb ellipsis, `oc-sheet` as automatic mobile host of the sidebar.
