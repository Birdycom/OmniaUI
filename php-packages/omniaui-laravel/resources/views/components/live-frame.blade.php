{{-- File: resources/views/components/live-frame.blade.php | Map: props -> div.oc-live-frame (virtual size) -> iframe and/or slot
     OmniaUI live frame: a live page at a virtual size, scaled down to the frame width in pure CSS.
     Props: src (iframe page), title, width (1280), height (720), static (clicks pass through), in-browser-frame (adds
     .oc-browser-frame__view), inert (only to look at: no focus, no clicks, hidden from screen readers), device (phone: 390 x 844
     unless width/height are given | tv | laptop: 1440 x 900, with a base). Slot: content instead of an iframe (<img>, <video> or .oc-live-frame__content); with src it comes after the iframe (a
     watermark on top). --}}
@props(['src' => null, 'title' => '', 'width' => null, 'height' => null, 'static' => false, 'inBrowserFrame' => false, 'inert' => false, 'device' => null])
@php($width = $width ?? ($device === 'phone' ? 390 : ($device === 'laptop' ? 1440 : 1280)))
@php($height = $height ?? ($device === 'phone' ? 844 : ($device === 'laptop' ? 900 : 720)))
<div {{ $attributes->class([
    'oc-browser-frame__view' => (bool) $inBrowserFrame,
    'oc-live-frame',
    'oc-live-frame--static' => (bool) $static,
    'oc-live-frame--'.$device => (bool) $device,
])->merge(['style' => '--oc-live-w: '.(int) $width.'; --oc-live-h: '.(int) $height]) }}>
@if ($src)
    <iframe src="{{ $src }}" title="{{ $title }}" loading="lazy" scrolling="no" @if ($static || $inert) tabindex="-1" @endif @if ($inert) inert aria-hidden="true" @endif></iframe>
@endif
    {{ $slot }}
</div>
