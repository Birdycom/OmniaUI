{{-- OmniaUI lazy image (fade-in by lazy.js). Props: src, alt, width, height, ratio ("16 / 10"), preview (URL of a tiny
     blurred copy), caption, loading (lazy|eager). --}}
@props(['src' => '', 'alt' => '', 'width' => null, 'height' => null, 'ratio' => null, 'preview' => null, 'caption' => null, 'loading' => 'lazy'])
@php
    $vars = trim(($ratio ? "--oc-lazy-ratio: {$ratio};" : '').($preview ? " --oc-lazy-preview: url({$preview});" : ''));
@endphp
<figure {{ $attributes->class(['oc-lazy']) }} @if($vars) style="{{ $vars }}" @endif><img src="{{ $src }}" alt="{{ $alt }}" @if($width) width="{{ $width }}" @endif @if($height) height="{{ $height }}" @endif loading="{{ $loading }}" decoding="async">@if ($caption)<figcaption>{{ $caption }}</figcaption>@endif</figure>
