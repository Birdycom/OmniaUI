<?php

declare(strict_types=1);

// File: src/Assets.php | Map: file names -> link list -> html

namespace Omniacss\Laravel;

use Illuminate\Support\HtmlString;

/**
 * Builds the stylesheet <link> tags behind the @omniacss Blade directive.
 */
final class Assets
{
    /** npm package => minified file inside its dist/ folder. */
    public const FILES = [
        'core' => 'omnia.starter.min.css',
        'components' => 'components.min.css',
        'blocks' => 'blocks.min.css',
    ];

    /** Short key => npm package name (OmniaCSS utilities, OmniaUI components and blocks; npm org @birdycom). */
    public const NPM = [
        'core' => '@birdycom/omniacss',
        'components' => '@birdycom/omniaui',
        'blocks' => '@birdycom/omniaui-blocks',
    ];

    public const SOURCES = ['vite', 'cdn', 'public'];

    /**
     * CDN URL for one package, e.g. https://cdn.jsdelivr.net/npm/@birdycom/omniaui@0.12.1/dist/components.min.css
     */
    public static function cdnUrl(string $package, ?string $version = null, ?string $base = null): string
    {
        $file = self::FILES[$package] ?? throw new \InvalidArgumentException("Unknown OmniaCSS package [{$package}].");
        $version ??= (string) config('omniacss.version', '0.12.1');
        $base ??= (string) config('omniacss.cdn.base', 'https://cdn.jsdelivr.net/npm');

        return rtrim($base, '/')."/".self::NPM[$package]."@{$version}/dist/{$file}";
    }

    /**
     * Enabled packages in load order (core, components, blocks).
     *
     * @return list<string>
     */
    public static function packages(): array
    {
        $enabled = (array) config('omniacss.packages', []);

        return array_values(array_filter(array_keys(self::FILES), fn (string $p) => ! empty($enabled[$p])));
    }

    /**
     * Stylesheet URLs for the cdn or public source.
     *
     * @return list<string>
     */
    public static function urls(string $source): array
    {
        return array_map(function (string $package) use ($source): string {
            if ($source === 'cdn') {
                return self::cdnUrl($package);
            }

            $path = trim((string) config('omniacss.public.path', 'vendor/omniacss'), '/');

            return asset($path.'/'.self::FILES[$package]);
        }, self::packages());
    }

    /**
     * HTML for the @omniacss directive. The optional argument overrides config('omniacss.source').
     */
    public static function render(?string $source = null): HtmlString
    {
        $source ??= (string) config('omniacss.source', 'vite');

        if (! in_array($source, self::SOURCES, true)) {
            throw new \InvalidArgumentException("Unknown OmniaCSS source [{$source}]. Use vite, cdn or public.");
        }

        if ($source === 'vite') {
            $entries = (array) config('omniacss.vite.entries', ['resources/css/app.css']);

            return class_exists(\Illuminate\Foundation\Vite::class)
                ? new HtmlString((string) app(\Illuminate\Foundation\Vite::class)($entries))
                : new HtmlString('');
        }

        $links = array_map(
            fn (string $url): string => '<link rel="stylesheet" href="'.e($url).'">',
            self::urls($source),
        );

        return new HtmlString(implode(PHP_EOL, $links));
    }
}
