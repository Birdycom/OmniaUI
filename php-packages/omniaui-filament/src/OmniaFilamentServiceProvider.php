<?php

// File: src/OmniaFilamentServiceProvider.php | Map: views (omniaui-filament::) -> publishable example stylesheet

namespace Omniacss\Filament;

use Illuminate\Support\ServiceProvider;

class OmniaFilamentServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'omniaui-filament');

        $this->publishes([
            __DIR__.'/../resources/css/filament.css' => resource_path('css/filament.css'),
        ], 'omniaui-filament-css');
    }
}
