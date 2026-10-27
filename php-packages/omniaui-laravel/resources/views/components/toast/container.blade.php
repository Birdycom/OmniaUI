{{-- OmniaCSS toast container. Props: top (stack at the top), static (in-flow, for docs). Slot: <x-oc::toast> entries. --}}
@props(['top' => false, 'static' => false])
<div {{ $attributes->class(['oc-toast-container', 'oc-toast-container--top' => $top, 'oc-toast-container--static' => $static]) }}>
    {{ $slot }}
</div>
