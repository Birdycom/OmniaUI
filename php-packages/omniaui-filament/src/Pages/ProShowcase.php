<?php

// File: src/Pages/ProShowcase.php | Map: availability (Pro package installed) -> navigation -> view (Pro blocks)

namespace Omniacss\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;

/** Example page with OmniaUI Pro blocks (charts, calendar, onboarding checklist, chat inbox). Registered only when Pro is installed. */
class ProShowcase extends Page
{
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-sparkles';

    protected static ?string $navigationLabel = 'Pro showcase';

    protected static ?string $title = 'OmniaUI Pro in Filament';

    protected static ?int $navigationSort = 91;

    protected string $view = 'omniaui-filament::pages.pro-showcase';

    public static function isAvailable(): bool
    {
        return class_exists(\Omniacss\LaravelPro\OmniauiProServiceProvider::class);
    }
}
