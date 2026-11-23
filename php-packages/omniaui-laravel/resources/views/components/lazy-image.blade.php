{{-- OmniaUI lazy image (fade-in by lazy.js). Props: src, alt, width, height, ratio ("16 / 10"), preview (URL of a tiny
     blurred copy), caption, loading (lazy|eager), thumb (.oc-lazy--thumb, a small square for a table row).
     Without src only the placeholder is shown (role="img", alt as its name). --}}
@props(['src' => '', 'alt' => '', 'width' => null, 'height' => null, 'ratio' => null, 'preview' => null, 'caption' => null, 'loading' => 'lazy', 'thumb' => false])
@php
    $vars = trim(($ratio ? "--oc-lazy-ratio: {$ratio};" : '').($preview ? " --oc-lazy-preview: url({$preview});" : ''));
@endphp
<figure {{ $attributes->class(['oc-lazy', 'oc-lazy--thumb' => $thumb])->merge(blank($src) ? ['role' => 'img', 'aria-label' => $alt] : []) }} @if($vars) style="{{ $vars }}" @endif>@if (filled($src))<img src="{{ $src }}" alt="{{ $alt }}" @if($width) width="{{ $width }}" @endif @if($height) height="{{ $height }}" @endif loading="{{ $loading }}" decoding="async">@endif @if ($caption)<figcaption>{{ $caption }}</figcaption>@endif</figure>
