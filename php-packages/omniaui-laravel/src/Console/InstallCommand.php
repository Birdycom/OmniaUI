<?php

declare(strict_types=1);

// File: src/Console/InstallCommand.php | Map: detect vite -> package.json -> app.css -> config -> next steps

namespace Omniacss\Laravel\Console;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Omniacss\Laravel\Assets;
use Omniacss\Laravel\OmniacssServiceProvider;

class InstallCommand extends Command
{
    protected $signature = 'omniacss:install
        {--source= : vite, cdn or public (default: vite when Vite is detected, otherwise cdn)}
        {--blocks : Also install @birdycom/omniaui-blocks}
        {--dry-run : Show the changes without writing anything}';

    protected $description = 'Install OmniaCSS: npm packages, CSS imports and config';

    public function handle(Filesystem $files): int
    {
        $dry = (bool) $this->option('dry-run');
        $vite = $this->detectVite($files);
        $source = (string) ($this->option('source') ?: ($vite ? 'vite' : 'cdn'));

        if (! in_array($source, Assets::SOURCES, true)) {
            $this->error("Unknown source [{$source}]. Use vite, cdn or public.");

            return self::INVALID;
        }

        $packages = ['core', 'components'];
        if ($this->option('blocks')) {
            $packages[] = 'blocks';
        }

        $this->info('OmniaCSS install'.($dry ? ' (dry run)' : ''));
        $this->line('  Vite detected: '.($vite ? 'yes' : 'no'));
        $this->line("  Source: {$source}");
        $this->newLine();

        if ($source === 'vite' || $source === 'public') {
            $this->addNpmDependencies($files, $packages, $dry);
        }

        if ($source === 'vite') {
            $this->addCssImports($files, $packages, $dry);
        }

        $this->publishConfig($source, $dry);
        $this->nextSteps($source, $vite);

        return self::SUCCESS;
    }

    protected function detectVite(Filesystem $files): bool
    {
        foreach (['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.mts', 'vite.config.cjs'] as $name) {
            if ($files->exists(base_path($name))) {
                return true;
            }
        }

        $package = $this->readPackageJson($files);

        return isset($package['devDependencies']['vite']) || isset($package['dependencies']['vite']);
    }

    /** @return array<string, mixed> */
    protected function readPackageJson(Filesystem $files): array
    {
        $path = base_path('package.json');

        return $files->exists($path) ? (json_decode($files->get($path), true) ?: []) : [];
    }

    /** @param list<string> $packages */
    protected function addNpmDependencies(Filesystem $files, array $packages, bool $dry): void
    {
        $path = base_path('package.json');

        if (! $files->exists($path)) {
            $this->warn('  package.json not found - install manually: npm install -D '.implode(' ', array_map(fn ($p) => Assets::NPM[$p], $packages)));

            return;
        }

        $raw = $files->get($path);
        $data = json_decode($raw, true) ?: [];
        $range = '^'.OmniacssServiceProvider::VERSION;
        $added = [];

        foreach ($packages as $package) {
            $name = Assets::NPM[$package];
            if (isset($data['dependencies'][$name]) || isset($data['devDependencies'][$name])) {
                continue;
            }
            $data['devDependencies'][$name] = $range;
            $added[] = $name;
        }

        if ($added === []) {
            $this->line('  package.json: OmniaCSS/OmniaUI packages already present');

            return;
        }

        ksort($data['devDependencies']);

        $indent = preg_match('/^( +|\t+)"/m', $raw, $m) ? $m[1] : '    ';
        $json = (string) json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($indent !== '    ') {
            $json = (string) preg_replace_callback(
                '/^(?: {4})+/m',
                fn (array $match): string => str_repeat($indent, intdiv(strlen($match[0]), 4)),
                $json,
            );
        }

        if (! $dry) {
            $files->put($path, $json.PHP_EOL);
        }

        $this->line('  package.json: '.($dry ? 'would add ' : 'added ').implode(', ', $added));
    }

    /** @param list<string> $packages */
    protected function addCssImports(Filesystem $files, array $packages, bool $dry): void
    {
        $path = resource_path('css/app.css');
        $css = $files->exists($path) ? $files->get($path) : '';
        $missing = [];

        foreach ($packages as $package) {
            $name = Assets::NPM[$package];
            if (! preg_match('/@import\s+[\'"]'.preg_quote($name, '/').'[\'"]/', $css)) {
                $missing[] = "@import \"{$name}\";";
            }
        }

        if ($missing === []) {
            $this->line('  resources/css/app.css: imports already present');

            return;
        }

        if (! $dry) {
            $files->ensureDirectoryExists(dirname($path));
            $files->put($path, implode(PHP_EOL, $missing).PHP_EOL.($css !== '' ? PHP_EOL.$css : ''));
        }

        $this->line('  resources/css/app.css: '.($dry ? 'would add ' : 'added ').count($missing).' import(s)');
        foreach ($missing as $line) {
            $this->line("      {$line}");
        }
    }

    protected function publishConfig(string $source, bool $dry): void
    {
        if ($dry) {
            $this->line('  config/omniacss.php: would publish');

            return;
        }

        $this->callSilently('vendor:publish', ['--tag' => 'omniacss-config']);
        $this->line('  config/omniacss.php: published (set OMNIACSS_SOURCE='.$source.' in .env)');
    }

    protected function nextSteps(string $source, bool $vite): void
    {
        $this->newLine();
        $this->info('Next steps');

        $n = 1;
        if ($source === 'vite' || $source === 'public') {
            $this->line('  '.$n++.'. npm install');
        }
        if ($source === 'public') {
            $this->line('  '.$n++.'. Copy node_modules/@birdycom/<package>/dist/*.min.css to public/'.config('omniacss.public.path', 'vendor/omniacss'));
        }
        if ($source === 'vite' && ! $vite) {
            $this->line('  '.$n++.'. Vite was not detected: add vite + laravel-vite-plugin, or run with --source=cdn');
        }
        if ($source === 'vite') {
            $this->line('  '.$n++.'. npm run dev   (or npm run build)');
        }
        $this->line('  '.$n++.'. Put @omniacss in the <head> of your layout');
        $this->line('  '.$n++.'. Use components: <x-oc::button variant="primary">Save</x-oc::button>');
        $this->line('  '.$n++.'. Own the code: php artisan omniacss:publish-components button card');
    }
}
