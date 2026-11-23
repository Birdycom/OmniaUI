{{-- OmniaCSS badge. Props: variant (default|secondary|outline|destructive|success|warning|info), icon (webicon name before
     the text), title (tooltip; on a badge without text also its accessible name: role="img" + aria-label), module (0.17.0: data-module,
     blue|green|purple|gold|cyan|pink|red|orange|teal|slate or your own name; a default badge takes the solid module colour,
     variant="module" the soft tint, also from a module on an ancestor). Slot: text. --}}
@props(['variant' => 'default', 'icon' => null, 'title' => null, 'module' => null])
@php($iconOnly = $icon && trim((string) $slot) === '')
<span {{ $attributes->class(['oc-badge', 'oc-badge--'.$variant => ! in_array($variant, ['default', 'primary', null, ''], true)])->merge(array_filter(['title' => $title, 'data-module' => $module, 'role' => $iconOnly && $title ? 'img' : null, 'aria-label' => $iconOnly && $title ? $title : null])) }}>@if ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif{{ $slot }}</span>
