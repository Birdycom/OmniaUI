<?php

declare(strict_types=1);

// File: src/Console/PublishComponentsCommand.php | Map: resolve names -> copy -> report

namespace Omniacss\Laravel\Console;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Omniacss\Laravel\OmniacssServiceProvider;
use Symfony\Component\Finder\Finder;

class PublishComponentsCommand extends Command
{
    protected $signature = 'omniacss:publish-components
        {names?* : Component names (button, modal, block.app-shell, accordion ...)}
        {--all : Publish every component and block}
        {--list : List available components and exit}
        {--force : Overwrite existing files}
        {--dry-run : Show what would be copied}';

    protected $description = 'Copy OmniaCSS Blade components into resources/views/components/oc so you own the code';

    public function handle(Filesystem $files): int
    {
        $available = $this->available();

        if ($this->option('list')) {
            foreach (array_keys($available) as $key) {
                $this->line($key);
            }

            return self::SUCCESS;
        }

        $names = (array) $this->argument('names');

        if (! $this->option('all') && $names === []) {
            $this->error('Pass component names or use --all (see --list).');

            return self::INVALID;
        }

        $selected = [];
        if ($this->option('all')) {
            $selected = array_keys($available);
        } else {
            foreach ($names as $name) {
                $key = trim(str_replace('/', '.', $name), '.');
                $matches = array_filter(
                    array_keys($available),
                    fn (string $k): bool => $k === $key || str_starts_with($k, $key.'.'),
                );

                if ($matches === []) {
                    $this->error("Unknown component [{$name}]. Use --list to see all names.");

                    return self::FAILURE;
                }

                $selected = array_merge($selected, $matches);
            }
        }

        $dry = (bool) $this->option('dry-run');
        $target = $this->targetPath();
        $copied = 0;

        foreach (array_unique($selected) as $key) {
            $destination = $target.'/'.str_replace('.', '/', $key).'.blade.php';

            if ($files->exists($destination) && ! $this->option('force')) {
                $this->line("  skip    {$key} (exists, use --force)");

                continue;
            }

            if (! $dry) {
                $files->ensureDirectoryExists(dirname($destination));
                $files->copy($available[$key], $destination);
            }

            $this->line('  '.($dry ? 'would copy ' : 'copied ').$key);
            $copied++;
        }

        $this->newLine();
        $this->info("{$copied} component(s) ".($dry ? 'would be ' : '').'published to resources/views/components/oc.');
        $this->line('Published files are used as <x-oc.button> and <x-oc.block.app-shell>; the package keeps serving <x-oc::button>.');

        return self::SUCCESS;
    }

    protected function targetPath(): string
    {
        return resource_path('views/components/oc');
    }

    /**
     * Component key (dot notation) => absolute source file.
     *
     * @return array<string, string>
     */
    protected function available(): array
    {
        $root = OmniacssServiceProvider::componentsPath();
        $out = [];

        foreach (Finder::create()->files()->in($root)->name('*.blade.php') as $file) {
            $relative = str_replace('\\', '/', $file->getRelativePathname());
            $out[str_replace('/', '.', substr($relative, 0, -strlen('.blade.php')))] = $file->getPathname();
        }

        ksort($out);

        return $out;
    }
}
