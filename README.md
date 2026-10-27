<!-- File: README.md | Map: intro -> versie -> packages -> install -> dev workflow -> vendored OmniaCSS -> PHP -> recente wijzigingen -->
# OmniaUI

CSS-first componenten en blocks, gebouwd op de utilities van [OmniaCSS](https://omniacss.eu).
Zo weinig mogelijk JavaScript: popover, dialog, details, `:has()` en anchor positioning doen het werk.
Wrappers voor React, Vue en Laravel (Blade + Livewire) gebruiken exact dezelfde markup en `oc-`-klassen.

**Versie:** `0.11.0` — zelfde waarde in `package.json` en alle `@birdycom/omniaui*` packages, en gelijk aan OmniaCSS (`MAJOR.MINOR.PATCH`).

Site: https://omniaui.eu · CSS-docs: https://omniacss.eu/docs/index.html (lokaal met Herd: https://omniaui.test)

## Packages

| Package | Map | Inhoud |
|---|---|---|
| `@birdycom/omniaui` | `packages/ui` | Component-CSS (`dist/components.css`), HTML-snippets, `manifest.json`, CLI `omniaui` (add/list) |
| `@birdycom/omniaui-blocks` | `packages/blocks` | Block-CSS (`dist/blocks.css`) en block-snippets (app-shell, hero, auth, ...) |
| `@birdycom/omniaui-react` | `packages/react` | React-componenten (`<Button>`, `<BlockHero>`) |
| `@birdycom/omniaui-vue` | `packages/vue` | Vue 3-componenten (`<OcButton>`, `<OcBlockHero>`) |
| `@birdycom/omniaui-site` (private) | `apps/site` | Astro-site met de componenten-, blocks- en webicons-pagina's |
| `birdycom/omniaui-laravel` (Composer) | `php-packages/omniaui-laravel` | Anonieme Blade-componenten `<x-oc::button>`, `<x-oc::block.hero>`, `@omniacss` directive |
| `birdycom/omniaui-livewire` (Composer) | `php-packages/omniaui-livewire` | Livewire 3-componenten met `wire:model`, modals, toasts, DataTable |

`@birdycom/omniaui` heeft `@birdycom/omniacss ^0.6.0` als peerDependency (de utilities en tokens).

**OmniaUI Pro** (34 app-blocks: CMS-dashboard, form builder, media manager, chat inbox, dashboards, kalenders, sidebars 06–16, …) staat in de **private** repo `../omniaUI-pro` met een commerciële licentie. Deze repo bevat alleen wat de site nodig heeft om ze te tonen: `vendor/omniaui-pro/pro.css` en de namenlijst (`npm run sync:site` in de pro-repo), en de demo-markup op de docs-pagina's (`<oc-demo pro>`: preview zonder code). `packages/blocks/pro.json` (alleen namen) laat de CLI melden dat een block Pro is.

## Installeren

```bash
npm i @birdycom/omniacss @birdycom/omniaui
# optioneel
npm i @birdycom/omniaui-blocks @birdycom/omniaui-react   # of @birdycom/omniaui-vue
```

Een component in je project kopiëren (HTML, React of Vue, afhankelijk van je framework):

```bash
npx omniaui list
npx omniaui add button card
```

De OmniaCSS-CLI (`npx omniacss build`) neemt de OmniaUI-CSS automatisch mee als het package geïnstalleerd is.

## Dev workflow

Node 22+, Windows/Git Bash of macOS/Linux.

| Wat | Commando |
|---|---|
| Installeren | `npm install` |
| Alles bouwen (packages, wrappers, site) | `npm run build` |
| Alleen CSS + manifests | `npm run build:packages` |
| React/Vue bouwen (genereert ook `index.ts`) | `npm run build:wrappers` |
| Site lokaal (Astro dev) | `npm run site:dev` |
| Site bouwen naar `public/` (Herd) | `npm run site:build` |
| Tests (build + CLI + React + Vue) | `npm test` |
| Blade-blocks opnieuw genereren | `npm run blade:blocks` |
| Code-syntax-thema bijwerken | `npm run code-syntax-theme` |
| Versie verhogen | `npm run release -- minor "Omschrijving"` |

Nieuwe componenten of blocks toevoegen: zie [CONTRIBUTING.md](CONTRIBUTING.md). Je maakt alleen nieuwe bestanden aan;
nav, routes, manifests, CSS-bundels en wrapper-indexes worden gegenereerd.

Herd serveert `public/`. `public/index.php` serveert de home en stuurt `/docs/` en `/pages/` door naar OmniaCSS.
De URL van de andere site staat op één plek: `OMNIACSS_URL` in `apps/site/src/lib/site.mjs`.

## Gevendorde OmniaCSS

De repo is privé en nog niet op npm. Daarom staat een kopie van de OmniaCSS-build in `vendor/omniacss`
(gecommit): `dist/omnia.css`, `dist/oc-colors.css`, `src/engine.mjs`, `src/variants.mjs`.
De site bouwt daarmee `public/css/omnia-site.css` (alleen de gebruikte utilities).

```bash
npm run sync:omniacss   # leest ../omniacss/packages/core (bouw daar eerst: npm run build:packages)
```

Omgekeerd vendort OmniaCSS onze `oc-components.css`, `oc-blocks.css` en `oc-code-syntax.css` (`npm run sync:omniaui` in die repo).

## PHP

```bash
cd php-packages/omniaui-laravel && composer install && vendor/bin/phpunit
cd php-packages/omniaui-livewire && composer install && vendor/bin/phpunit
```

Zie [php-packages/README.md](php-packages/README.md).

## Recente wijzigingen

| Versie | Datum | Wat |
|--------|-------|-----|
| `0.11.0` | 2026-10-24 | Chat, CMS-dashboard en zoeken in de docs |
| `0.10.0` | 2026-10-23 | Form builder, media manager en cookie consent |
| `0.9.0` | 2026-10-23 | Zelfde versie als OmniaCSS: CSS-functies en docs |
| `0.8.4` | 2026-10-23 | Zelfde versie als OmniaCSS: kleurdocs |
| `0.8.3` | 2026-10-23 | Zelfde versie als OmniaCSS: IntelliSense-beelden |
| `0.8.2` | 2026-10-23 | Zelfde versie als OmniaCSS: kleur-CSS in IntelliSense |
| `0.8.1` | 2026-10-23 | Linux-binaries van Rollup en esbuild blijven in de lockfile |
| `0.8.0` | 2026-10-18 | Zelfde versie als OmniaCSS: IntelliSense |
| `0.7.0` | 2026-10-16 | Lijsttabel van Korrekt en OmniaDesk, prijs- en barcodevelden links |
| `0.6.0` | 2026-10-15 | OmniaUI afgesplitst van OmniaCSS: componenten, blocks, React/Vue, Laravel/Livewire en webicons; npm-scope @birdycom. Nieuwe componenten voor forms, data/app UX, media en marketing, plus blocks status-page, faq, about-timeline, contact-grid, hero-orbit, profile-header, watch-layout en portfolio-grid. |
