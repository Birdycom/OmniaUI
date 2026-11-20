<?php

// File: src/Color.php
// Map: parse hex -> relative luminance -> contrast ratio (WCAG 2) -> pickOnColor (light or dark text on a color)
// The same colour checks as contrastRatio / pickOnColor in the React and Vue packages, for hex colors on the server.

declare(strict_types=1);

namespace Omniacss\Laravel;

final class Color
{
    /** "#3366cc" / "#36c" -> [51, 102, 204]; null when it is not a hex color (theme tokens resolve in the browser only). */
    public static function toRgb(string $color): ?array
    {
        if (! preg_match('/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i', trim($color), $m)) {
            return null;
        }
        $hex = strlen($m[1]) === 3 ? preg_replace('/(.)/', '$1$1', $m[1]) : $m[1];

        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    }

    /** Relative luminance (WCAG 2), 0 (black) to 1 (white). */
    public static function luminance(array $rgb): float
    {
        $lin = static function ($c): float {
            $s = $c / 255;

            return $s <= 0.03928 ? $s / 12.92 : (($s + 0.055) / 1.055) ** 2.4;
        };

        return 0.2126 * $lin($rgb[0]) + 0.7152 * $lin($rgb[1]) + 0.0722 * $lin($rgb[2]);
    }

    /** Contrast ratio of two hex colors, 1 to 21; null when one of them is not a hex color. */
    public static function contrastRatio(string $a, string $b): ?float
    {
        $x = self::toRgb($a);
        $y = self::toRgb($b);
        if (! $x || ! $y) {
            return null;
        }
        $l = [self::luminance($x), self::luminance($y)];

        return (max($l) + 0.05) / (min($l) + 0.05);
    }

    /** The text color for a background: light (#ffffff) or dark (#0b1020), whichever has the higher contrast. */
    public static function pickOnColor(string $background, string $light = '#ffffff', string $dark = '#0b1020'): string
    {
        $onLight = self::contrastRatio($background, $dark) ?? 0;
        $onDark = self::contrastRatio($background, $light) ?? 0;

        return $onDark >= $onLight ? $light : $dark;
    }
}
