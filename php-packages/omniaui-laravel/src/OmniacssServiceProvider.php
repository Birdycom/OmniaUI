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
    public const VERSION = '0.12.4';

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
}
