{{-- OmniaCSS back link. Props: href, fallback-href (where it goes without a page of this site to go back to; with it
     the link gets data-oc-back and oc-back-link.js makes a click go back in the history when the visitor came from this
     site), fallback-label (label while it goes to fallback-href). Slot: label that names the destination. --}}
@props(['href' => '#', 'fallbackHref' => null, 'fallbackLabel' => null])
@if ($fallbackHref !== null)
<a {{ $attributes->class(['oc-back-link'])->merge(array_filter(['href' => $fallbackHref, 'data-oc-back' => '', 'data-oc-fallback-label' => $fallbackLabel], fn ($v) => $v !== null)) }}>{{ $slot }}</a>
@else
<a {{ $attributes->class(['oc-back-link'])->merge(['href' => $href]) }}>{{ $slot }}</a>
@endif
