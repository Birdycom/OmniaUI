<!-- File: php-packages/README.md | Map: purpose -> package list -> develop -> docs -->
# OmniaUI PHP Packages Workspace

## Version

- Version: `0.11.0` (zelfde als de npm-packages en OmniaCSS)
- Status: `Beta` (Laravel + Livewire packages met tests)

---

## Purpose

Deze map bevat de Composer packages voor Laravel en Livewire integratie van OmniaUI.

## Packages

| Package | Map | Inhoud |
|---------|-----|--------|
| `birdycom/omniaui-laravel` | `omniaui-laravel` | Anonieme Blade-componenten (`<x-oc::button>`, `<x-oc::block.app-shell>`), `@omniacss` directive, `omniacss:install` en `omniacss:publish-components` |
| `birdycom/omniaui-livewire` | `omniaui-livewire` | Livewire 3: `wire:model` componenten, modals/sheets via entangle, `WithOcModal`, `WithOcToast`, abstracte `DataTable` |

De PHP-namespaces (`Omniacss\Laravel`, `Omniacss\Livewire`), de config-key `omniacss`, de `@omniacss` directive en de
artisan-commando's zijn bewust niet hernoemd: bestaande projecten blijven werken.

## Develop

```bash
cd php-packages/omniaui-laravel && composer install && vendor/bin/phpunit
cd php-packages/omniaui-livewire && composer install && vendor/bin/phpunit
```

`omniaui-livewire` gebruikt `../omniaui-laravel` als path repository. De block-views van de Laravel-package worden
gegenereerd uit `packages/blocks`: `npm run blade:blocks`.

Nieuwe Blade-componenten hoeven niet geregistreerd te worden: `Blade::anonymousComponentPath()` laadt de hele map
`resources/views/components`.

## Docs

`/ui/frameworks-laravel.html`
