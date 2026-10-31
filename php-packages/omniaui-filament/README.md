<!-- File: php-packages/omniaui-filament/README.md | Map: purpose -> install -> what changes -> your own pages -> demo pages -> limits -->
# birdycom/omniaui-filament

Run a [Filament](https://filamentphp.com) panel on [OmniaCSS](https://omniacss.eu) and [OmniaUI](https://omniaui.eu):

- **No Tailwind build.** Filament ships its own compiled stylesheet; your app no longer needs `tailwindcss`,
  `@tailwindcss/vite` or a custom Tailwind theme. Your pages and widgets use OmniaCSS utilities and OmniaUI components,
  built by the OmniaCSS PostCSS plugin (only what you use: the demo pages below come to about 78 kB, 14 kB gzip).
- **One look.** The panel's colors (primary, gray, danger, success, warning, info) come from the OmniaUI palette, and
  OmniaUI follows Filament's light/dark toggle, so Filament's tables and forms sit next to OmniaUI components naturally.
- **Free and Pro.** Every free OmniaUI component and block works in a Filament page; with an OmniaUI Pro license the
  Pro blocks (charts, calendars, inboxes, dashboards …) do too.

```bash
composer require birdycom/omniaui-filament
npm remove tailwindcss @tailwindcss/vite
npm install -D @birdycom/omniacss @birdycom/omniaui @birdycom/omniaui-blocks
php artisan vendor:publish --tag=omniaui-filament-css     # resources/css/filament.css with @omniaui; and @omnia;
```

```php
// app/Providers/Filament/AdminPanelProvider.php
use Omniacss\Filament\OmniaUIPlugin;

$panel->plugin(OmniaUIPlugin::make()->vite('resources/css/filament.css')->demoPages());
```

```js
// vite.config.js: add the stylesheet to the inputs and remove the tailwindcss() plugin
laravel({ input: ['resources/css/filament.css', 'resources/js/app.js'] })

// postcss.config.js
import omniacss from '@birdycom/omniacss/postcss';
export default {
    plugins: [omniacss({ content: [
        'app/Filament/**/*.php',
        'resources/views/filament/**/*.blade.php',
        'vendor/birdycom/omniaui-filament/resources/views/**/*.blade.php',
        // plus the OmniaUI Blade components you use, see the starter kits' postcss.config.js
    ] })],
};
```

## Your own pages and widgets

Write the view of a custom Filament page with OmniaUI Blade components (`<x-oc::stat-card>`, `<x-oc::tabs>`,
`<x-oc::chart-line>`, `<x-oc::block.charts>` …) and OmniaCSS utilities, inside `<x-filament-panels::page>`.
Filament keeps its own components (`fi-*` classes); OmniaUI never touches those.

**Keep Tailwind-written views out of `content`.** OmniaCSS and Tailwind share many class names with different values
(`w-5` is 5rem in OmniaCSS, 1.25rem in Tailwind). If a view written for Tailwind is scanned, its `w-5` becomes an
OmniaCSS utility, and Filament's own markup that uses the same name grows. Scan only the views you wrote for OmniaCSS.

## Demo pages

`demoPages()` adds:

- **Operations** (free components only): KPI tiles, CSS-only tabs with an area chart with three series, capacity bars
  with warning levels and a target marker, a release pipeline stepper, a live terminal log, incident filters and
  expandable severity cards, a service tree and an activity timeline.
- **Pro showcase** (only when `birdycom/omniaui-pro-laravel` is installed): dashboard stats, the charts gallery
  (bar, line, area, stacked, donut, radial, sparkline), a two-month range calendar, an onboarding checklist and a chat inbox.

## Limits

- Filament's own screens still use Filament's compiled CSS (made with Tailwind by the Filament team). This package does
  not restyle the `fi-*` components; it colors them and lets OmniaUI live next to them without a Tailwind toolchain.
- Filament custom themes (`->viteTheme()`) are Tailwind-based; with this package you do not need one.
- Requires `@birdycom/omniacss` 0.12.5 or later (keeps component modifiers that the Blade components build in code).

MIT. Version 0.12.5, in step with OmniaCSS and OmniaUI.
