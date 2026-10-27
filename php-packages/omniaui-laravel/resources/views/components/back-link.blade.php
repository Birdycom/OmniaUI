{{-- OmniaCSS back link. Props: href. Slot: label that names the destination. --}}
@props(['href' => '#'])
<a {{ $attributes->class(['oc-back-link'])->merge(['href' => $href]) }}>{{ $slot }}</a>
