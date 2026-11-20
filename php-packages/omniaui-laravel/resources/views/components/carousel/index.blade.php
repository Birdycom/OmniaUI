{{-- File: resources/views/components/carousel/index.blade.php | Map: props -> slides (number them "1 of 4", collect their ids) -> viewport -> loop buttons -> fallback dots
     OmniaUI carousel (0.17.0): CSS scroll-snap with ::scroll-button arrows and ::scroll-marker dots (same markup as
     packages/ui/snippets/carousel.html and carousel-loop.html). Props: label (aria-label of the viewport, default
     "Carousel"), per (halves|thirds), loop (prev / next buttons that wrap around; needs /js/oc-carousel.js), dots (fallback
     links, default true; carousel.js makes them scroll only the track), dots-label, previous, next (button labels), id.
     Slot: <x-oc::carousel.item> slides. --}}
@props(['label' => 'Carousel', 'per' => null, 'loop' => false, 'dots' => true, 'dotsLabel' => 'Choose a slide', 'previous' => 'Previous slide', 'next' => 'Next slide', 'id' => null])
@php
    $base = $id ?: 'oc-carousel-'.substr(md5(uniqid('', true)), 0, 6);
    $html = (string) $slot;
    $pattern = '/<div\b[^>]*\bdata-oc-slide\b[^>]*>/';
    $total = preg_match_all($pattern, $html, $tags);
    $ids = array_map(fn ($tag) => preg_match('/\bid="([^"]*)"/', $tag, $m) ? $m[1] : null, $tags[0]);
    $n = 0;
    $html = preg_replace_callback($pattern, function ($m) use (&$n, $total) {
        $n++;
        $label = str_contains($m[0], 'aria-label=') ? '' : 'aria-label="'.$n.' of '.$total.'"';
        return trim(preg_replace('/\s*\bdata-oc-slide\b/', $label === '' ? '' : ' '.$label, $m[0], 1));
    }, $html);
@endphp
<div {{ $attributes->class(['oc-carousel', 'oc-carousel--'.$per => $per, 'oc-carousel--loop' => $loop])->merge(['id' => $id]) }}>
    <div class="oc-carousel-viewport" id="{{ $base }}-viewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="{{ $label }}">{!! $html !!}</div>
    @if ($loop)
        <button class="oc-carousel-prev" type="button" aria-controls="{{ $base }}-viewport" aria-label="{{ $previous }}">&larr;</button>
        <button class="oc-carousel-next" type="button" aria-controls="{{ $base }}-viewport" aria-label="{{ $next }}">&rarr;</button>
    @endif
    @if ($dots && $total > 0)
        <nav class="oc-carousel-dots" aria-label="{{ $dotsLabel }}">
            @foreach ($ids as $i => $slideId)
                <a class="oc-carousel-dot" href="#{{ $slideId }}" aria-label="Slide {{ $i + 1 }}"></a>
            @endforeach
        </nav>
    @endif
</div>
