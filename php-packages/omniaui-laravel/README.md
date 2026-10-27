<!-- File: php-packages/omniaui-laravel/README.md | Map: purpose -> install -> usage -> components -> commands -> config -> tests -->
# birdycom/omniaui-laravel

## Version

- Version: `0.4.0`
- Status: `Beta` (Blade-componenten, `@omniacss`, artisan commands en tests aanwezig)

---

## Purpose

De Laravel-tegenhanger van OmniaCSS: elke component en elke block uit `@birdycom/omniaui` en `@birdycom/omniaui-blocks` is beschikbaar als anonieme Blade-component onder het prefix `oc`.

```blade
<x-oc::button variant="primary">Opslaan</x-oc::button>
<x-oc::block.app-shell height="40rem">...</x-oc::block.app-shell>
```

De markup en de klassen zijn exact die van de snippets (`packages/ui/snippets`, `packages/blocks/blocks`). Props worden modifiers (`variant`, `size`, boolean flags), slots worden `$slot` en named slots, en `$attributes` wordt gemerged (`class`, `wire:*`, `x-*`, `data-*`). Dark mode werkt via `light-dark()` en `color-scheme` in de CSS; er staan geen kleuren in PHP.

## Requirements

- PHP `^8.2`
- Laravel `11`, `12` of `13` (`illuminate/*`)

## Install

```bash
composer require birdycom/omniaui-laravel
php artisan omniacss:install            # detecteert Vite, voegt npm-dependencies en CSS-imports toe
npm install && npm run dev
```

Zet `@omniacss` in de `<head>` van je layout:

```blade
<head>
    @omniacss
</head>
```

Zonder Vite: `php artisan omniacss:install --source=cdn` (of `OMNIACSS_SOURCE=cdn` in `.env`).

## Asset sources

| `source` | `@omniacss` geeft | Gebruik |
|----------|-------------------|---------|
| `vite` (default) | `@vite(['resources/css/app.css'])` | `app.css` importeert `@birdycom/omniacss`, `@birdycom/omniaui`, `@birdycom/omniaui-blocks` |
| `cdn` | `<link>` naar `https://cdn.jsdelivr.net/npm/@omniacss/<pkg>@<versie>/dist/<bestand>.min.css` | Geen build-stap |
| `public` | `<link>` naar `asset('vendor/omniacss/<bestand>.min.css')` | CSS zelf gekopieerd naar `public/vendor/omniacss` |

`@omniacss('cdn')` overschrijft de bron voor een enkele pagina.

## Components

Alle namen onder `<x-oc::...>`. Sub-onderdelen gebruiken een punt (`accordion.item`), blocks staan onder `block.`.

| Component | Props | Slots |
|-----------|-------|-------|
| `accordion` | `flush` | default: `accordion.item` |
| `accordion.item` | `title`, `name`, `open` | default |
| `alert` | `variant` (info, success, warning, danger), `title` | default |
| `alert-dialog` | `id`, `type`, `title`, `icon`, `cancel`, `confirm`, `confirmVariant`, `closedby` | default, `footer` |
| `avatar` | `size` (sm, lg, xl), `src`, `alt` | default (initialen) |
| `avatar.group` | | default |
| `back-link` | `href` | default |
| `badge` | `variant` (secondary, outline, destructive, success, warning, info) | default |
| `breadcrumb` | `items`, `label` | default |
| `button` | `variant` (primary, secondary, outline, ghost, destructive, success, link), `size` (xs, sm, lg), `icon`, `href`, `type` | default |
| `card` | `title`, `description`, `size` | default, `header`, `footer` |
| `checkbox` | `radio`, `label` | default |
| `checklist` | `items`, `card`, `label` | default |
| `checklist.item` | `done`, `title`, `hint` | default |
| `collapsible` | `title`, `open`, `dense` | default, `icon` |
| `color-field` | `label`, `id`, `name`, `value` | |
| `command` | `items`, `placeholder`, `empty` | default |
| `copy-field` | `value`, `label`, `button` | |
| `counter` | `to`, `suffix`, `onView` | |
| `definition-list` | `title`, `description`, `items`, `label` | default, `footer` |
| `dropdown` | `label`, `variant`, `id`, `items` | default, `trigger` |
| `dropzone` | `title`, `hint`, `accept`, `multiple` | default |
| `empty-state` | `title`, `text`, `icon` | default (acties) |
| `form-field` | `label`, `for`, `description`, `error`, `name` | default (het veld) |
| `heading` | `title`, `description`, `size`, `level` | default |
| `input` | `error` (+ automatisch bij validatiefout op `name`) | |
| `input-group` | `prefix`, `suffix`, `error` | |
| `launcher-card` | `href`, `title`, `description`, `active`, `disabled` | `icon`, `badge`, `footer` |
| `modal` | `id`, `title`, `description`, `size`, `closedby` | default, `footer`, `trigger` |
| `navmenu` | `items`, `label` | default |
| `otp-input` | `length`, `label`, `description`, `id`, `name`, `error` | |
| `pagination` | `paginator` of `current` + `total` + `url`, `label`, `window` | |
| `password-input` | `label`, `id`, `name`, `error`, `show`, `hide` | |
| `popover` | `id`, `title`, `text`, `size`, `trigger`, `variant` | default |
| `progress` | `value`, `max`, `variant`, `label` | |
| `recovery-codes` | `codes`, `title`, `warning`, `copy`, `download` | default (acties) |
| `segmented` | `name`, `options`, `value`, `label`, `size`, `block` | default |
| `select` | `options`, `value`, `placeholder`, `error` | default |
| `sheet` | `id`, `side`, `wide`, `title`, `description`, `closedby`, `close` | default, `footer`, `trigger` |
| `sidebar` | `label`, `collapsed`, `right`, `floating` | default, `header`, `footer` |
| `sidebar.group` | `label`, `separator` | default |
| `sidebar.item` | `href`, `current`, `disabled`, `badge` | default, `icon`, `sub` |
| `skeleton` | `shape` (circle, title, text, rect) | |
| `stepper` | `steps`, `current`, `horizontal`, `label` | |
| `switch` | (attributen naar de checkbox) | |
| `table` | `caption`, `striped`, `compact`, `borderless`, `sticky` | default |
| `table.sort` | `href`, `direction`, `numeric` | default |
| `table.empty` | `colspan`, `title`, `text` | default |
| `tabs` | `name`, `tabs`, `active`, `variant` | default: `tabs.panel` |
| `tabs.panel` | | default |
| `tag-input` | `tags`, `name`, `placeholder`, `suggestions`, `label` | |
| `textarea` | `rows`, `error` | default |
| `theme-switch` | `name`, `value`, `label` | |
| `toast` | `variant`, `title`, `icon`, `dismissible`, `auto` | default |
| `toast.container` | `top`, `static` | default |
| `tooltip` | `text` | default |
| `user` | `name`, `email`, `initials`, `src`, `size` | |

### Blocks

`<x-oc::block.NAAM>`: zonder slots rendert een block exact de snippet-markup; een named slot vervangt alleen zijn eigen regio. `class` en andere attributen komen op het root-element.

| Block | Named slots (default slot als laatste) |
|-------|----------------------------------------|
| `app-header` | `toggle`, `nav`, `actions` |
| `app-shell` | `sidebar`, `header`, `breadcrumbs`, default (inhoud); prop `height` |
| `auth` | `footer`, default (kaart) |
| `auth-split` | `logo`, `quote`, `title`, `subtitle`, `fields`; props `action`, `method` |
| `cta` | `title`, `text`, `actions` |
| `dashboard-stats` | default |
| `data-table` | `title`, `description`, `actions`, `toolbar`, `table`, `footer` |
| `features` | `title`, `text`, default (grid) |
| `footer` | default |
| `form-page` | default; props `action`, `method` (CSRF-veld automatisch) |
| `hero` | `badge`, `title`, `text`, `actions` |
| `hero-code`, `hero-split` | `hero-split`: `title`, `text`, `actions`, `visual`; `hero-code`: default |
| `hub-launcher` | default |
| `module-header` | `icon`, `title`, `intro`, `meta`, `actions` |
| `onboarding-checklist` | default |
| `page-hero` | `eyebrow`, `title`, `text`, `actions` |
| `pricing` | `title`, `text`, default (grid) |
| `process`, `product-grid`, `showcase`, `spotlight` | default |
| `settings-page` | `nav`, default (body) |
| `site-footer` | default |
| `site-header` | `brand`, `nav` |
| `stats`, `stats-counter`, `team-list` | default |
| `two-factor` | `qr`, `key`, `code`, `recovery` |
| `wizard-dialog` | props `id`, `title`, `description`, `steps`, `current`, `trigger`, `back`, `next`; slots `rail`, default, `footer` |

### Voorbeelden

```blade
<x-oc::card title="Nieuw project" description="Zet je project in een klik live.">
    <x-oc::form-field label="Naam" for="name" :error="$errors->first('name')">
        <x-oc::input id="name" name="name" placeholder="Mijn project" />
    </x-oc::form-field>
    <x-slot:footer>
        <x-oc::button variant="outline">Annuleren</x-oc::button>
        <x-oc::button type="submit">Opslaan</x-oc::button>
    </x-slot:footer>
</x-oc::card>

<x-oc::modal id="delete" title="Zeker weten?" size="sm">
    <x-slot:trigger>
        <button class="oc-btn" command="show-modal" commandfor="delete">Verwijderen</button>
    </x-slot:trigger>
    Dit kan niet ongedaan worden gemaakt.
    <x-slot:footer>
        <x-oc::button variant="outline" command="close" commandfor="delete">Annuleren</x-oc::button>
        <x-oc::button variant="destructive">Verwijderen</x-oc::button>
    </x-slot:footer>
</x-oc::modal>

<x-oc::pagination :paginator="$users" />
```

## Commands

| Command | Doel |
|---------|------|
| `php artisan omniacss:install [--source=vite\|cdn\|public] [--blocks] [--dry-run]` | Detecteert Vite, voegt `@omniacss/*` toe aan `package.json` (devDependencies), zet `@import "@omniacss/..."` bovenaan `resources/css/app.css`, publiceert de config en toont de volgende stappen |
| `php artisan omniacss:publish-components {names*} [--all] [--list] [--force] [--dry-run]` | Kopieert Blade-bestanden naar `resources/views/components/oc`, zodat de code van jou is |

Gepubliceerde bestanden gebruik je als `<x-oc.button>` en `<x-oc.block.app-shell>`; de package blijft ondertussen `<x-oc::button>` leveren. Namen met sub-onderdelen (`accordion`) nemen alle onderdelen mee (`accordion.item`).

## Config

```bash
php artisan vendor:publish --tag=omniacss-config
```

`config/omniacss.php`: `source`, `packages` (`core`, `components`, `blocks`), `version` (CDN), `cdn.base`, `public.path`, `vite.entries`, `prefix`.

## Tests

```bash
composer install
vendor/bin/phpunit
```

Orchestra Testbench + PHPUnit: klassen per component, blocks vergeleken met hun snippet, `@omniacss`, de twee artisan commands.

## Regenerating blocks

De block-views worden gegenereerd uit `packages/blocks/blocks/*.html`:

```bash
node php-packages/omniaui-laravel/tools/build-blocks.mjs
```

## Related

- `birdycom/omniaui-livewire`: `wire:model`, modals, toasts en een DataTable voor Livewire 3
- Docs: `/ui/frameworks-laravel.html`

MIT
