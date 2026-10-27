{{-- OmniaCSS sidebar group. Props: label, separator (draw a divider before the group). Slot: <x-oc::sidebar.item> entries. --}}
@props(['label' => null, 'separator' => false])
@if ($separator)
    <div class="oc-sidebar-separator"></div>
@endif
<div {{ $attributes->class(['oc-sidebar-group']) }}>
    @if ($label)
        <div class="oc-sidebar-group-label">{{ $label }}</div>
    @endif
    <ul class="oc-sidebar-menu">{{ $slot }}</ul>
</div>
