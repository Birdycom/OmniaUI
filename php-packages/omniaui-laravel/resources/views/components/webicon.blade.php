{{-- File: resources/views/components/webicon.blade.php | Map: props -> Webicons::get (subset files, node_modules sets, built-in) -> svg.oc-icon | nothing
     OmniaUI webicon: an icon by name (mdi:home, flag:nl-4x3) as inline SVG in currentColor, read from the Iconify JSON
     sets installed in the app (node_modules/@iconify-json/<set>/icons.json) or a subset file (config
     omniacss.webicons.files, made with `npx omniaui webicons`). No network. Props: name, size (xs|sm|md|lg|xl),
     label (role="img" + <title>; else aria-hidden), bare (no oc-icon class: 1em high), fallback ('iconify': an unknown
     name becomes <iconify-icon> for apps that still load the Iconify runtime). Unknown name: nothing (and one log
     warning with APP_DEBUG). --}}
@props(['name', 'size' => null, 'label' => null, 'bare' => false, 'fallback' => null])
@php($icon = \Omniacss\Laravel\Webicons::get((string) $name))
@if ($icon)
@php($svg = \Omniacss\Laravel\Webicons::svg($icon, $label))
<svg {{ $attributes->class(['oc-icon' => ! $bare, 'oc-icon--'.$size => $size && ! $bare])->merge(array_filter([
    'xmlns' => 'http://www.w3.org/2000/svg',
    'viewBox' => $svg['viewBox'],
    'width' => $svg['ratio'].'em',
    'height' => '1em',
    'fill' => 'currentColor',
    'style' => $svg['ratio'] != 1 && ! $bare ? '--oc-icon-ratio: '.$svg['ratio'] : null,
    'data-webicon' => $name,
    'role' => $label ? 'img' : null,
    'aria-label' => $label ?: null,
    'aria-hidden' => $label ? null : 'true',
    'focusable' => 'false',
])) }}>{!! $svg['html'] !!}</svg>
@elseif ($fallback === 'iconify')
<iconify-icon {{ $attributes->merge(array_filter(['icon' => $name, 'aria-label' => $label ?: null, 'role' => $label ? 'img' : null, 'aria-hidden' => $label ? null : 'true'])) }}></iconify-icon>
@else
@php(\Omniacss\Laravel\Webicons::warnOnce((string) $name))
@endif
