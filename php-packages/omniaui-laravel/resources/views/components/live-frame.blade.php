{{-- File: resources/views/components/live-frame.blade.php | Map: props -> div.oc-live-frame (virtual size) -> iframe or slot
     OmniaUI live frame: a live page at a virtual size, scaled down to the frame width in pure CSS.
     Props: src (iframe page), title, width (1280), height (720), static (clicks pass through), in-browser-frame (adds
     .oc-browser-frame__view). Slot: content instead of an iframe (<img>, <video> or .oc-live-frame__content). --}}
@props(['src' => null, 'title' => '', 'width' => 1280, 'height' => 720, 'static' => false, 'inBrowserFrame' => false])
<div {{ $attributes->class([
    'oc-browser-frame__view' => (bool) $inBrowserFrame,
    'oc-live-frame',
    'oc-live-frame--static' => (bool) $static,
])->merge(['style' => '--oc-live-w: '.(int) $width.'; --oc-live-h: '.(int) $height]) }}>
@if ($src)
    <iframe src="{{ $src }}" title="{{ $title }}" loading="lazy" scrolling="no" @if ($static) tabindex="-1" @endif></iframe>
@else
    {{ $slot }}
@endif
</div>
