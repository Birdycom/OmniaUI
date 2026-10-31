<?php

// File: src/OmniaUIPlugin.php | Map: options (vite entry, colors, demo pages) -> register (palette, pages) -> boot (head hook)

namespace Omniacss\Filament;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Foundation\Vite;
use Omniacss\Filament\Pages\OperationsCenter;
use Omniacss\Filament\Pages\ProShowcase;

/**
 * Runs a Filament panel on OmniaCSS + OmniaUI.
 *
 * - The panel colors come from the OmniaUI palette (primary vividblue, gray stormblue, danger red …), so Filament's own
 *   screens and your OmniaUI components share one look. Light and dark follow Filament's toggle: OmniaUI listens to
 *   the same `.dark` class.
 * - Your stylesheet (default resources/css/filament.css with `@omniaui;` and `@omnia;`) is added to every panel page.
 *   Write custom pages and widgets with OmniaCSS utilities and OmniaUI components; no Tailwind build is needed.
 * - demoPages() adds two example pages: an operations center (free components) and, when OmniaUI Pro is installed,
 *   a Pro showcase (charts, calendar, onboarding checklist, chat inbox).
 *
 *   ->plugin(OmniaUIPlugin::make()->vite('resources/css/filament.css')->demoPages())
 */
class OmniaUIPlugin implements Plugin
{
    /** OmniaUI base colors per Filament color role; Filament derives the 50–950 shades from each. */
    public const COLORS = [
        'primary' => '#175dbe', // --color-vividblue-95, = --oc-primary (light)
        'gray' => '#344570',    // --color-stormblue-50
        'danger' => '#e50000',  // --color-red-70, = --oc-destructive (light)
        'success' => '#007700', // --color-green-60, = --oc-success (light)
        'warning' => '#b15000', // --color-orange-95, = --oc-warning (light)
        'info' => '#67c3ee',    // --color-skycyan-60
    ];

    protected ?string $vite = 'resources/css/filament.css';

    protected bool $colors = true;

    protected bool $demoPages = false;

    public static function make(): static
    {
        return app(static::class);
    }

    public function getId(): string
    {
        return 'omniaui';
    }

    /** The Vite entry with `@omniaui;` and `@omnia;` (null: you load OmniaCSS yourself, e.g. with @omniacss). */
    public function vite(?string $entry): static
    {
        $this->vite = $entry;

        return $this;
    }

    /** Keep Filament's own colors instead of the OmniaUI palette. */
    public function keepFilamentColors(bool $keep = true): static
    {
        $this->colors = ! $keep;

        return $this;
    }

    /** Add the example pages (operations center; Pro showcase when birdycom/omniaui-pro-laravel is installed). */
    public function demoPages(bool $show = true): static
    {
        $this->demoPages = $show;

        return $this;
    }

    public function register(Panel $panel): void
    {
        if ($this->colors) {
            $panel->colors(array_map(fn (string $hex) => Color::hex($hex), self::COLORS));
        }

        if ($this->demoPages) {
            $panel->pages(array_filter([
                OperationsCenter::class,
                ProShowcase::isAvailable() ? ProShowcase::class : null,
            ]));
        }

        if ($this->vite) {
            $entry = $this->vite;
            $panel->renderHook(PanelsRenderHook::HEAD_END, fn () => app(Vite::class)([$entry])->toHtml());
        }
    }

    public function boot(Panel $panel): void
    {
        //
    }
}
