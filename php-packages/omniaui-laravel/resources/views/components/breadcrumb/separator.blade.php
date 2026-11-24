{{-- OmniaCSS compound breadcrumb (0.17.1): an explicit separator (.oc-breadcrumb-separator). Props: as (li|span).
     Slot: your own separator; empty = "/" or the chevron of separator="chevron" on <x-oc::breadcrumb>. Without separators the
     items get "/" or › by CSS. --}}
@aware(['separator' => 'slash'])
@props(['as' => 'li'])
<{{ $as }} {{ $attributes->class(['oc-breadcrumb-separator'])->merge(['role' => 'presentation', 'aria-hidden' => 'true']) }}>@if (trim((string) $slot) !== ''){{ $slot }}@elseif ($separator === 'chevron')<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:chevron-right"><path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" /></svg>@else/@endif</{{ $as }}>
