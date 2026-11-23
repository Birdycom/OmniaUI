{{-- OmniaCSS button. Props: variant (primary|secondary|outline|ghost|destructive|success|link|soft-primary|soft-success|
     soft-warning|soft-destructive|soft-info|plain|gradient|glass|neon), size (xs|sm|lg), icon (square icon button), href (renders an <a>),
     type (button|submit|reset), inline (link button inside running text), loading (spinner, aria-busy),
     icon-start / icon-end (webicon names before / after the label), as (tag: a with href, span, label, summary …;
     disabled/loading then become aria-disabled), module (0.17.0: data-module, blue|green|purple|gold|cyan|pink|red|orange|teal|slate
     or your own name), float (0.17.0: small icons rise behind the label, .oc-btn--float: 'hearts' or a webicon name such as
     'mdi:star'), inherit (0.17.1: outline/ghost on a dark or coloured band follows the text colour around it). Slot: label. --}}
@props(['variant' => 'primary', 'size' => null, 'icon' => false, 'href' => null, 'type' => 'button', 'inline' => false, 'inherit' => false, 'loading' => false, 'iconStart' => null, 'iconEnd' => null, 'as' => null, 'module' => null, 'float' => null])
@php
    $classes = [
        'oc-btn',
        'oc-btn--'.$variant => ! in_array($variant, ['primary', 'default', null, ''], true),
        'oc-btn--'.$size => $size && $size !== 'md',
        'oc-btn--icon' => $icon,
        'oc-btn--inline' => $inline,
        'oc-btn--inherit' => $inherit,
        'oc-btn--float' => (bool) $float,
    ];
    $ocFloat = $float ? ($float === 'hearts' || $float === true ? 'mdi:heart' : (string) $float) : null;
    $ocFloatStyle = null;
    if ($ocFloat && ! in_array($ocFloat, ['mdi:heart', 'mdi:star'], true) && ($ocFloatIcon = \Omniacss\Laravel\Webicons::get($ocFloat))) {
        $ocFloatSvg = \Omniacss\Laravel\Webicons::svg($ocFloatIcon);
        $ocFloatStyle = '--oc-btn-float-icon: url("data:image/svg+xml,'.rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="'.$ocFloatSvg['viewBox'].'">'.$ocFloatSvg['html'].'</svg>').'")';
    }
    $ocExtra = array_filter(['data-module' => $module, 'data-float-icon' => $ocFloat, 'style' => $ocFloatStyle]);
    $ocFloatLayer = $ocFloat ? '<span class="oc-btn-float" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' : '';
    $tag = $as ? strtolower(preg_replace('/[^a-zA-Z0-9-]/', '', (string) $as)) : null;
@endphp
@if ($tag && $tag !== 'a' && $tag !== 'button')
    <{{ $tag }} {{ $attributes->class($classes)->merge($ocExtra)->merge(array_filter(['aria-busy' => $loading ? 'true' : null, 'aria-disabled' => $attributes->get('disabled') || $loading ? 'true' : null])) }}>{!! $ocFloatLayer !!}@if ($iconStart)<x-oc::webicon :name="$iconStart" fallback="iconify" />@endif{{ $slot }}@if ($iconEnd)<x-oc::webicon :name="$iconEnd" fallback="iconify" />@endif</{{ $tag }}>
@elseif ($href || $tag === 'a')
    <a {{ $attributes->class($classes)->merge($ocExtra)->merge(array_filter(['href' => $href, 'aria-busy' => $loading ? 'true' : null, 'aria-disabled' => $tag === 'a' && ($attributes->get('disabled') || $loading) ? 'true' : null])) }}>{!! $ocFloatLayer !!}@if ($iconStart)<x-oc::webicon :name="$iconStart" fallback="iconify" />@endif{{ $slot }}@if ($iconEnd)<x-oc::webicon :name="$iconEnd" fallback="iconify" />@endif</a>
@else
    <button {{ $attributes->class($classes)->merge($ocExtra)->merge(['type' => $type, 'aria-busy' => $loading ? 'true' : null]) }} @disabled($loading)>{!! $ocFloatLayer !!}@if ($iconStart)<x-oc::webicon :name="$iconStart" fallback="iconify" />@endif{{ $slot }}@if ($iconEnd)<x-oc::webicon :name="$iconEnd" fallback="iconify" />@endif</button>
@endif
