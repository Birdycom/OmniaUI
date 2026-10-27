{{-- OmniaCSS button. Props: variant (primary|secondary|outline|ghost|destructive|success|link), size (xs|sm|lg), icon (square icon button),
     href (renders an <a>), type (button|submit|reset). Slot: label. --}}
@props(['variant' => 'primary', 'size' => null, 'icon' => false, 'href' => null, 'type' => 'button'])
@php
    $classes = [
        'oc-btn',
        'oc-btn--'.$variant => ! in_array($variant, ['primary', 'default', null, ''], true),
        'oc-btn--'.$size => $size && $size !== 'md',
        'oc-btn--icon' => $icon,
    ];
@endphp
@if ($href)
    <a {{ $attributes->class($classes)->merge(['href' => $href]) }}>{{ $slot }}</a>
@else
    <button {{ $attributes->class($classes)->merge(['type' => $type]) }}>{{ $slot }}</button>
@endif
