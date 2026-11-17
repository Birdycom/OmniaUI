{{-- File: resources/views/components/sidebar/meta.blade.php | Map: props -> div.oc-sidebar-meta (brand, version, copyright; the line as tooltip)
     Meta line for the footer slot of <x-oc::sidebar>: brand, version, copyright. Collapsed sidebar: only the version,
     the whole line as a tooltip. Props: brand, version, copyright. --}}
@props(['brand' => null, 'version' => null, 'copyright' => null])
@php($line = implode(' · ', array_filter([trim(($brand ?? '').' '.($version ?? '')), $copyright])))
<div {{ $attributes->class(['oc-sidebar-meta', 'oc-tooltip', 'oc-tooltip--right'])->merge(['data-tooltip' => $line, 'tabindex' => '0']) }}>
    @if ($brand)<span class="oc-sidebar-meta__brand">{{ $brand }}</span>@endif
    @if ($version)<span class="oc-sidebar-meta__version">{{ $version }}</span>@endif
    @if ($copyright)<span class="oc-sidebar-meta__copy">{{ $copyright }}</span>@endif
</div>
