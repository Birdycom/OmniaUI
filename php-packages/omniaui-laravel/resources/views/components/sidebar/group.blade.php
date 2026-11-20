{{-- OmniaCSS sidebar group. Props: label, separator (draw a divider before the group). Slot: <x-oc::sidebar.item> entries.
     In <x-oc::sidebar variant="docs">: a p.oc-sidebar-group-label followed by the ul.oc-sidebar-menu, no wrapper. --}}
@aware(['variant' => 'app'])
@props(['label' => null, 'separator' => false])
@if ($variant === 'docs')
    @if ($label)
        <p class="oc-sidebar-group-label">{{ $label }}</p>
    @endif
    <ul {{ $attributes->class(['oc-sidebar-menu']) }}>{{ $slot }}</ul>
@else
@if ($separator)
    <div class="oc-sidebar-separator"></div>
@endif
<div {{ $attributes->class(['oc-sidebar-group']) }}>
    @if ($label)
        <div class="oc-sidebar-group-label">{{ $label }}</div>
    @endif
    <ul class="oc-sidebar-menu">{{ $slot }}</ul>
</div>
@endif
