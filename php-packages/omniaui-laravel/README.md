<!-- File: php-packages/omniaui-laravel/README.md | Map: purpose -> install -> asset sources -> components -> blocks -> examples -> commands -> config -> tests -->
# birdycom/omniaui-laravel

OmniaUI for Laravel: every component and block of [OmniaUI](https://omniaui.eu) (`@birdycom/omniaui`, `@birdycom/omniaui-blocks`) as an anonymous Blade component under the `oc` prefix.

```blade
<x-oc::button variant="primary">Save</x-oc::button>
<x-oc::block.app-shell height="40rem">...</x-oc::block.app-shell>
```

The markup and classes are exactly those of the OmniaUI snippets. Props become modifiers (`variant`, `size`, boolean flags), slots become `$slot` and named slots, and `$attributes` are merged (`class`, `wire:*`, `x-*`, `data-*`). Dark mode works through `light-dark()` and `color-scheme` in the CSS; there are no colors in PHP.

- Version: `0.12.3` (same version as OmniaCSS and OmniaUI)
- Site: https://omniaui.eu · Source: https://github.com/Birdycom/OmniaUI (`php-packages/omniaui-laravel`)
- Livewire 3 extras: [`birdycom/omniaui-livewire`](https://packagist.org/packages/birdycom/omniaui-livewire)

## Requirements

- PHP `^8.2`
- Laravel `11`, `12` or `13` (`illuminate/*`)

## Install

```bash
composer require birdycom/omniaui-laravel
php artisan omniacss:install            # detects Vite, adds the npm packages and the CSS imports
npm install && npm run dev
```

Put `@omniacss` in the `<head>` of your layout:

```blade
<head>
    @omniacss
</head>
```

Without Vite: `php artisan omniacss:install --source=cdn` (or `OMNIACSS_SOURCE=cdn` in `.env`).

## Asset sources

| `source` | `@omniacss` outputs | Use |
|----------|---------------------|-----|
| `vite` (default) | `@vite(['resources/css/app.css'])` | `app.css` imports `@birdycom/omniacss`, `@birdycom/omniaui`, `@birdycom/omniaui-blocks` |
| `cdn` | `<link>` to `https://cdn.jsdelivr.net/npm/@birdycom/<pkg>@<version>/dist/<file>.min.css` | No build step |
| `public` | `<link>` to `asset('vendor/omniacss/<file>.min.css')` | CSS copied to `public/vendor/omniacss` yourself |

`@omniacss('cdn')` overrides the source for a single page.

## Components

All names live under `<x-oc::...>`. Sub-parts use a dot (`accordion.item`), blocks live under `block.`.

| Component | Props | Slots |
|-----------|-------|-------|
| `accordion` | `flush` | default: `accordion.item` |
| `accordion.item` | `title`, `name`, `open` | default |
| `alert` | `variant` (info, success, warning, danger), `title` | default |
| `alert-dialog` | `id`, `type`, `title`, `icon`, `cancel`, `confirm`, `confirmVariant`, `closedby` | default, `footer` |
| `avatar` | `size` (sm, lg, xl), `src`, `alt` | default (initials) |
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
| `empty-state` | `title`, `text`, `icon` | default (actions) |
| `form-field` | `label`, `for`, `description`, `error`, `name` | default (the field) |
| `heading` | `title`, `description`, `size`, `level` | default |
| `input` | `error` (also set automatically on a validation error for `name`) | |
| `input-group` | `prefix`, `suffix`, `error` | |
| `launcher-card` | `href`, `title`, `description`, `active`, `disabled` | `icon`, `badge`, `footer` |
| `modal` | `id`, `title`, `description`, `size`, `closedby` | default, `footer`, `trigger` |
| `navmenu` | `items`, `label` | default |
| `otp-input` | `length`, `label`, `description`, `id`, `name`, `error` | |
| `pagination` | `paginator` or `current` + `total` + `url`, `label`, `window` | |
| `password-input` | `label`, `id`, `name`, `error`, `show`, `hide` | |
| `popover` | `id`, `title`, `text`, `size`, `trigger`, `variant` | default |
| `progress` | `value`, `max`, `variant`, `label` | |
| `recovery-codes` | `codes`, `title`, `warning`, `copy`, `download` | default (actions) |
| `segmented` | `name`, `options`, `value`, `label`, `size`, `block` | default |
| `select` | `options`, `value`, `placeholder`, `error` | default |
| `sheet` | `id`, `side`, `wide`, `title`, `description`, `closedby`, `close` | default, `footer`, `trigger` |
| `sidebar` | `label`, `collapsed`, `right`, `floating` | default, `header`, `footer` |
| `sidebar.group` | `label`, `separator` | default |
| `sidebar.item` | `href`, `current`, `disabled`, `badge` | default, `icon`, `sub` |
| `skeleton` | `shape` (circle, title, text, rect) | |
| `stepper` | `steps`, `current`, `horizontal`, `label` | |
| `switch` | (attributes go to the checkbox) | |
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

`<x-oc::block.NAME>`: without slots a block renders exactly the snippet markup; a named slot replaces only its own region. `class` and other attributes go on the root element. The larger app blocks (CMS dashboard, form builder, calendars, …) are part of [OmniaUI Pro](https://omniaui.eu/ui/pro.html) (`birdycom/omniaui-pro-laravel`), on the same `oc` prefix.

| Block | Named slots (default slot last) |
|-------|----------------------------------|
| `app-header` | `toggle`, `nav`, `actions` |
| `app-shell` | `sidebar`, `header`, `breadcrumbs`, default (content); prop `height` |
| `auth` | `footer`, default (card) |
| `auth-split` | `logo`, `quote`, `title`, `subtitle`, `fields`; props `action`, `method` |
| `cta` | `title`, `text`, `actions` |
| `data-table` | `title`, `description`, `actions`, `toolbar`, `table`, `footer` |
| `features` | `title`, `text`, default (grid) |
| `footer` | default |
| `form-page` | default; props `action`, `method` (CSRF field added automatically) |
| `hero` | `badge`, `title`, `text`, `actions` |
| `hero-code`, `hero-split` | `hero-split`: `title`, `text`, `actions`, `visual`; `hero-code`: default |
| `module-header` | `icon`, `title`, `intro`, `meta`, `actions` |
| `page-hero` | `eyebrow`, `title`, `text`, `actions` |
| `pricing` | `title`, `text`, default (grid) |
| `process`, `product-grid`, `showcase`, `spotlight` | default |
| `site-footer` | default |
| `site-header` | `brand`, `nav` |
| `stats`, `stats-counter`, `team-list` | default |
| `two-factor` | `qr`, `key`, `code`, `recovery` |
| `wizard-dialog` | props `id`, `title`, `description`, `steps`, `current`, `trigger`, `back`, `next`; slots `rail`, default, `footer` |

### Examples

```blade
<x-oc::card title="New project" description="Put your project live in one click.">
    <x-oc::form-field label="Name" for="name" :error="$errors->first('name')">
        <x-oc::input id="name" name="name" placeholder="My project" />
    </x-oc::form-field>
    <x-slot:footer>
        <x-oc::button variant="outline">Cancel</x-oc::button>
        <x-oc::button type="submit">Save</x-oc::button>
    </x-slot:footer>
</x-oc::card>

<x-oc::modal id="delete" title="Are you sure?" size="sm">
    <x-slot:trigger>
        <button class="oc-btn" command="show-modal" commandfor="delete">Delete</button>
    </x-slot:trigger>
    This cannot be undone.
    <x-slot:footer>
        <x-oc::button variant="outline" command="close" commandfor="delete">Cancel</x-oc::button>
        <x-oc::button variant="destructive">Delete</x-oc::button>
    </x-slot:footer>
</x-oc::modal>

<x-oc::pagination :paginator="$users" />
```

## Commands

| Command | Purpose |
|---------|---------|
| `php artisan omniacss:install [--source=vite\|cdn\|public] [--blocks] [--dry-run]` | Detects Vite, adds the `@birdycom/*` packages to `package.json` (devDependencies), puts the `@import` lines at the top of `resources/css/app.css`, publishes the config and shows the next steps |
| `php artisan omniacss:publish-components {names*} [--all] [--list] [--force] [--dry-run]` | Copies Blade files to `resources/views/components/oc`, so the code is yours |

Published files are used as `<x-oc.button>` and `<x-oc.block.app-shell>`; the package keeps providing `<x-oc::button>` alongside. Names with sub-parts (`accordion`) take all their parts (`accordion.item`).

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

Orchestra Testbench + PHPUnit: classes per component, blocks compared with their snippet, `@omniacss`, the two artisan commands.

## Contributing

This package is developed in the [OmniaUI monorepo](https://github.com/Birdycom/OmniaUI) (`php-packages/omniaui-laravel`) and mirrored to its own repository for Packagist. Open issues and pull requests there. The block views are generated from `packages/blocks/blocks/*.html` with `node php-packages/omniaui-laravel/tools/build-blocks.mjs`.

## License

MIT — Serge Cools (Birdycom).
