<?php

// File: src/Pages/OperationsCenter.php | Map: navigation -> view (free OmniaUI components inside a Filament page)

namespace Omniacss\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;

/** Example page: an operations center built only from free OmniaUI components, inside a Filament panel. */
class OperationsCenter extends Page
{
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-command-line';

    protected static ?string $navigationLabel = 'Operations';

    protected static ?string $title = 'Operations center';

    protected static ?int $navigationSort = 90;

    protected string $view = 'omniaui-filament::pages.operations-center';
}
