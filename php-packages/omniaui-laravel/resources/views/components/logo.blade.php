{{-- File: resources/views/components/logo.blade.php | Map: props -> span.oc-logo[data-plate] + img
     OmniaUI logo: a customer logo in its own colors and ratio, never filtered. Props: src, alt, fit (contain|box),
     plate (auto|light|dark|both|none; auto needs oc-logo.js: `npx omniaui copy-js logo`), height / max-width (CSS lengths). --}}
@props(['src' => '', 'alt' => '', 'fit' => 'contain', 'plate' => 'auto', 'height' => null, 'maxWidth' => null])
@php($style = trim(($height ? '--oc-logo-h: '.$height.';' : '').($maxWidth ? ' --oc-logo-w: '.$maxWidth.';' : '')))
<span {{ $attributes->class(['oc-logo', 'oc-logo--box' => $fit === 'box'])->merge(array_filter(['data-plate' => $plate, 'style' => $style ?: null])) }}>
    <img src="{{ $src }}" alt="{{ $alt }}">
</span>
