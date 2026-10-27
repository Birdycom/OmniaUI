{{-- OmniaCSS accordion. Props: flush. Slot: <x-oc::accordion.item> entries (same name => one open at a time). --}}
@props(['flush' => false])
<div {{ $attributes->class(['oc-accordion', 'oc-accordion--flush' => $flush]) }}>
    {{ $slot }}
</div>
