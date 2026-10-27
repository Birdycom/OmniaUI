{{-- File: resources/views/components/media-thumb.blade.php | Map: props -> <a>/<div> -> picture -> badge -> duration -> progress
     OmniaUI media thumb (16:9 video thumbnail). Props: src, alt, art (placeholder variant 1-6), href (renders <a>), duration,
     badge, live, progress (0-100), watched, ratio (video|square|portrait). Slot: extra overlay content. --}}
@props(['src' => null, 'alt' => '', 'art' => null, 'href' => null, 'duration' => null, 'badge' => null, 'live' => false, 'progress' => null, 'watched' => false, 'ratio' => 'video'])
@php($tag = $href ? 'a' : 'div')
<{{ $tag }} {{ $attributes->class(['oc-media-thumb', 'oc-media-thumb--'.$ratio => $ratio !== 'video', 'is-watched' => $watched])->merge($href ? ['href' => $href] : []) }}>
    @if ($src)
        <img src="{{ $src }}" alt="{{ $alt }}">
    @else
        <div @class(['oc-media-art', 'oc-media-art--'.$art => $art > 1])></div>
    @endif
    @if ($badge)
        <span @class(['oc-media-thumb__badge', 'oc-media-thumb__badge--live' => $live])>{{ $badge }}</span>
    @endif
    @if ($duration)
        <span class="oc-media-thumb__duration">{{ $duration }}</span>
    @endif
    @if ($progress !== null)
        <progress class="oc-media-thumb__progress" value="{{ $progress }}" max="100" aria-label="Watched {{ $progress }}%">{{ $progress }}%</progress>
    @endif
    {{ $slot }}
</{{ $tag }}>
