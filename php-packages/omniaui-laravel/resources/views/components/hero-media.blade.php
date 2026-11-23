{{-- OmniaUI hero with background media (.oc-hero-media). Props: src, type (video|image; default video for .mp4/.webm/.ogv/.mov), poster, media-type (MIME of the video source), alt (image; empty = decorative), scrim (start|end|full|none; default start), align (start|center|end). The video source plays only without reduced motion; then the poster stays. Slot: text and buttons. --}}
@props(['src' => null, 'type' => null, 'poster' => null, 'mediaType' => null, 'alt' => '', 'scrim' => 'start', 'align' => 'start'])
@php
    $ext = preg_match('/\.(mp4|webm|ogv|mov)(\?.*)?$/i', (string) $src, $m) ? strtolower($m[1]) : null;
    $isVideo = ($type ?? ($ext ? 'video' : 'image')) === 'video';
    $sourceType = $mediaType ?? ($ext ? ['mp4' => 'video/mp4', 'webm' => 'video/webm', 'ogv' => 'video/ogg', 'mov' => 'video/quicktime'][$ext] : null);
    $scrimClass = match ($scrim) { 'full' => 'oc-hero-media--scrim', 'none' => null, default => 'oc-hero-media--scrim-'.$scrim };
@endphp
<section {{ $attributes->class(['oc-hero-media', $scrimClass => $scrimClass, 'oc-hero-media--'.$align => $align !== 'start']) }}>
    @if ($isVideo && ($src || $poster))
        <video class="oc-hero-media__media" @if ($poster) poster="{{ $poster }}" @endif autoplay muted loop playsinline preload="metadata" aria-hidden="true">@if ($src)<source src="{{ $src }}" @if ($sourceType) type="{{ $sourceType }}" @endif media="(prefers-reduced-motion: no-preference)">@endif</video>
    @elseif ($src)
        <img class="oc-hero-media__media" src="{{ $src }}" alt="{{ $alt }}">
    @endif
    <div class="oc-hero-media__content">{{ $slot }}</div>
</section>
