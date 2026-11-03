{{-- OmniaCSS button. Props: variant (primary|secondary|outline|ghost|destructive|success|link|soft-primary|soft-success|
     soft-warning|soft-destructive|soft-info|plain|gradient|glass|neon), size (xs|sm|lg), icon (square icon button), href (renders an <a>),
     type (button|submit|reset), inline (link button inside running text), loading (spinner, aria-busy). Slot: label. --}}
@props(['variant' => 'primary', 'size' => null, 'icon' => false, 'href' => null, 'type' => 'button', 'inline' => false, 'loading' => false])
@php
    $classes = [
        'oc-btn',
        'oc-btn--'.$variant => ! in_array($variant, ['primary', 'default', null, ''], true),
        'oc-btn--'.$size => $size && $size !== 'md',
        'oc-btn--icon' => $icon,
        'oc-btn--inline' => $inline,
    ];
@endphp
@if ($href)
    <a {{ $attributes->class($classes)->merge(['href' => $href, 'aria-busy' => $loading ? 'true' : null]) }}>{{ $slot }}</a>
@else
    <button {{ $attributes->class($classes)->merge(['type' => $type, 'aria-busy' => $loading ? 'true' : null]) }} @disabled($loading)>{{ $slot }}</button>
@endif
