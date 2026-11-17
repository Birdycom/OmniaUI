<?php

declare(strict_types=1);

// File: src/Webicons.php
// Map: lookup order (subset files from config -> Iconify sets in node_modules -> built-in set) -> resolve (aliases,
//      transforms) -> svg parts (viewBox, ratio, body with unique ids) -> warning once per name
// The webicons (Iconify sets MDI, MDI Light, Material Symbols, SVG Spinners, Flags, VSCode Icons) as inline SVG for
// <x-oc::webicon>. Read from files on disk only, never fetched; every file is read once per request (or worker).

namespace Omniacss\Laravel;

final class Webicons
{
    /** @var array<string, array<string, mixed>|null> decoded JSON per file */
    private static array $files = [];

    /** @var array<string, array<string, mixed>|null> resolved icons per name */
    private static array $icons = [];

    /** @var array<string, true> */
    private static array $warned = [];

    private static int $counter = 0;

    /** Forget everything that was read (tests, or after the icon files changed in a long-running worker). */
    public static function flush(): void
    {
        self::$files = [];
        self::$icons = [];
        self::$warned = [];
        self::$counter = 0;
    }

    /**
     * The icon with its box: ['body', 'width', 'height', 'left', 'top', 'rotate', 'hFlip', 'vFlip'], or null.
     *
     * @return array<string, mixed>|null
     */
    public static function get(string $name): ?array
    {
        if (array_key_exists($name, self::$icons)) {
            return self::$icons[$name];
        }

        return self::$icons[$name] = self::find($name);
    }

    /** @return array<string, mixed>|null */
    private static function find(string $name): ?array
    {
        $colon = strpos($name, ':');
        if ($colon === false || $colon === 0) {
            return null;
        }
        $prefix = substr($name, 0, $colon);
        $icon = substr($name, $colon + 1);

        // 1. Subset files (npx omniaui webicons --out resources/webicons.json) or whole Iconify JSON sets.
        foreach ((array) config('omniacss.webicons.files', []) as $file) {
            $json = self::read((string) $file);
            if ($json === null) {
                continue;
            }
            if (isset($json['prefix'], $json['icons'])) {
                if ($json['prefix'] === $prefix && ($found = self::fromSet($json, $icon)) !== null) {
                    return $found;
                }
            } elseif (isset($json[$name]) && is_array($json[$name])) {
                return self::complete($json[$name]);
            }
        }

        // 2. The Iconify JSON set in node_modules (or the configured folder).
        if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $prefix) === 1) {
            $dir = (string) (config('omniacss.webicons.path') ?: base_path('node_modules/@iconify-json'));
            $set = self::read(rtrim($dir, '/\\').DIRECTORY_SEPARATOR.$prefix.DIRECTORY_SEPARATOR.'icons.json');
            if ($set !== null && ($found = self::fromSet($set, $icon)) !== null) {
                return $found;
            }
        }

        // 3. The built-in set (the icons OmniaUI's components draw by default and a few flags).
        $builtin = self::read(dirname(__DIR__).'/resources/webicons/builtin.json');

        return isset($builtin[$name]) ? self::complete($builtin[$name]) : null;
    }

    /** @return array<string, mixed>|null */
    private static function read(string $file): ?array
    {
        if (! array_key_exists($file, self::$files)) {
            $json = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
            self::$files[$file] = is_array($json) ? $json : null;
        }

        return self::$files[$file];
    }

    /**
     * @param  array<string, mixed>  $set
     * @return array<string, mixed>|null
     */
    private static function fromSet(array $set, string $name): ?array
    {
        $extra = [];
        $rotate = 0;
        $hFlip = false;
        $vFlip = false;
        for ($depth = 0; $depth < 6; $depth++) {
            $icon = $set['icons'][$name] ?? null;
            if (is_array($icon)) {
                $out = array_merge(
                    ['left' => $set['left'] ?? 0, 'top' => $set['top'] ?? 0, 'width' => $set['width'] ?? 16, 'height' => $set['height'] ?? 16],
                    $icon,
                    $extra,
                );
                $out['rotate'] = ((int) ($icon['rotate'] ?? 0) + $rotate) % 4;
                $out['hFlip'] = ((bool) ($icon['hFlip'] ?? false)) !== $hFlip;
                $out['vFlip'] = ((bool) ($icon['vFlip'] ?? false)) !== $vFlip;

                return $out;
            }
            $alias = $set['aliases'][$name] ?? null;
            if (! is_array($alias) || ! isset($alias['parent'])) {
                return null;
            }
            $rotate += (int) ($alias['rotate'] ?? 0);
            $hFlip = $hFlip !== (bool) ($alias['hFlip'] ?? false);
            $vFlip = $vFlip !== (bool) ($alias['vFlip'] ?? false);
            $extra = array_merge(array_intersect_key($alias, array_flip(['left', 'top', 'width', 'height'])), $extra);
            $name = (string) $alias['parent'];
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $icon
     * @return array<string, mixed>
     */
    private static function complete(array $icon): array
    {
        return array_merge(['left' => 0, 'top' => 0, 'width' => 24, 'height' => 24, 'rotate' => 0, 'hFlip' => false, 'vFlip' => false], $icon);
    }

    /**
     * viewBox, ratio (width / height) and the inner markup (an escaped <title> for a label, then the body).
     *
     * @param  array<string, mixed>  $icon
     * @return array{viewBox: string, ratio: float, html: string}
     */
    public static function svg(array $icon, ?string $label = null): array
    {
        $l = (float) $icon['left'];
        $t = (float) $icon['top'];
        $w = (float) $icon['width'];
        $h = (float) $icon['height'];
        $transforms = [];
        if ((int) $icon['rotate']) {
            $transforms[] = 'rotate('.self::num((int) $icon['rotate'] * 90).' '.self::num($l + $w / 2).' '.self::num($t + $h / 2).')';
        }
        if ($icon['hFlip']) {
            $transforms[] = 'translate('.self::num(2 * $l + $w).' 0) scale(-1 1)';
        }
        if ($icon['vFlip']) {
            $transforms[] = 'translate(0 '.self::num(2 * $t + $h).') scale(1 -1)';
        }
        $body = (string) $icon['body'];
        if ($transforms) {
            $body = '<g transform="'.implode(' ', $transforms).'">'.$body.'</g>';
        }
        if (str_contains($body, ' id=')) {
            $suffix = 'wi'.(++self::$counter);
            preg_match_all('/\sid="([^"]+)"/', $body, $ids);
            foreach ($ids[1] as $id) {
                $body = (string) preg_replace('/([#;"])('.preg_quote($id, '/').')([")]|\.[a-z])/', '$1$2-'.$suffix.'$3', $body);
            }
        }

        return [
            'viewBox' => self::num($l).' '.self::num($t).' '.self::num($w).' '.self::num($h),
            'ratio' => round($w / $h, 4),
            'html' => ($label !== null && $label !== '' ? '<title>'.e($label).'</title>' : '').$body,
        ];
    }

    /** One warning in the log per unknown name, only with APP_DEBUG on. */
    public static function warnOnce(string $name): void
    {
        if (isset(self::$warned[$name]) || ! config('app.debug')) {
            return;
        }
        self::$warned[$name] = true;
        logger()->warning("[OmniaUI] Webicon \"{$name}\" not found. Install its set (npm i -D @iconify-json/<set>) or add it to a subset file (npx omniaui webicons {$name} --out resources/webicons.json) listed in config omniacss.webicons.files.");
    }

    private static function num(float|int $n): string
    {
        return rtrim(rtrim(number_format((float) $n, 4, '.', ''), '0'), '.');
    }
}
