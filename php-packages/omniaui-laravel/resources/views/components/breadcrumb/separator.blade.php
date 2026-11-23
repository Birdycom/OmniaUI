{{-- OmniaCSS compound breadcrumb (0.17.1): an explicit separator (.oc-breadcrumb-separator). Props: as (li|span).
     Slot: your own separator; empty = "/" or the chevron of separator="chevron" on <x-oc::breadcrumb>. Without separators the
     items get "/" or › by CSS. --}}
@aware(['separator' => 'slash'])
@props(['as' => 'li'])
<{{ $as }} {{ $attributes->class(['oc-breadcrumb-separator'])->merge(['role' => 'presentation', 'aria-hidden' => 'true']) }}>@if (trim((string) $slot) !== ''){{ $slot }}@elseif ($separator === 'chevron')<x-oc::webicon name="mdi:chevron-right" bare fallback="iconify" />@else/@endif</{{ $as }}>
