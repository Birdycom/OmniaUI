<?php

declare(strict_types=1);

// File: src/OmniacssServiceProvider.php | Map: config -> blade components -> directive -> publishing -> commands

namespace Omniacss\Laravel;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Omniacss\Laravel\Console\InstallCommand;
use Omniacss\Laravel\Console\PublishComponentsCommand;

class OmniacssServiceProvider extends ServiceProvider
{
    public const VERSION = '0.17.1';

    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/omniacss.php', 'omniacss');
    }

    public function boot(): void
    {
        $prefix = (string) config('omniacss.prefix', 'oc');

        // <x-oc::button>, <x-oc::block.app-shell>, <x-oc::accordion.item> ...
        Blade::anonymousComponentPath(self::componentsPath(), $prefix);

        // @omniacss  or  @omniacss('cdn')
        Blade::directive('omniacss', fn (string $expression): string => "<?php echo \\Omniacss\\Laravel\\Assets::render({$expression}); ?>");

        // <x-slot:icon>...</x-slot:icon>Dashboard: Blade turns the closing tag into " @endslot", and a word right after it
        // makes "@endslotDashboard", which is no directive, so the slot never closes (an open output buffer, broken page).
        Blade::precompiler(self::closeSlotsBeforeText(...));

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/omniacss.php' => config_path('omniacss.php'),
            ], 'omniacss-config');

            $this->publishes([
                self::componentsPath() => resource_path('views/components/oc'),
            ], 'omniacss-components');

            $this->commands([
                InstallCommand::class,
                PublishComponentsCommand::class,
            ]);
        }
    }

    public static function componentsPath(): string
    {
        return dirname(__DIR__).'/resources/views/components';
    }

    /** Ends " @endslot" before a word that follows it directly with an empty PHP tag (no extra space in the output). */
    public static function closeSlotsBeforeText(string $value): string
    {
        return (string) preg_replace('/(?<=\s)@endslot(?=[\w@])/', '@endslot<?php /* slot end */ ?>', $value);
    }
}
