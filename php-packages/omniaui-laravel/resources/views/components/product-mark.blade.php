{{-- File: resources/views/components/product-mark.blade.php | Map: props -> span.oc-product-mark + modifiers
     OmniaUI product mark (squircle app icon). Props: size (sm|default|lg|xl), accent (green, violet, ...), soft, glow, cover.
     Slot: glyph, <img alt=""> or SVG. Decorative: aria-hidden="true" (override with aria-hidden="false"). --}}
@props(['size' => 'default', 'accent' => null, 'soft' => false, 'glow' => false, 'cover' => false])
<span {{ $attributes->class([
    'oc-product-mark',
    'oc-product-mark--'.$size => in_array($size, ['sm', 'lg', 'xl'], true),
    'oc-product-mark--soft' => $soft,
    'oc-product-mark--glow' => $glow,
    'oc-product-mark--cover' => $cover,
    'oc-accent--'.$accent => (bool) $accent,
])->merge(['aria-hidden' => 'true']) }}>{{ $slot }}</span>
