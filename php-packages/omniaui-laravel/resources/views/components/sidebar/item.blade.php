{{-- OmniaCSS sidebar item. Props: href, current, disabled, badge. Slots: default = label, icon (inline svg with class oc-sidebar-menu-icon),
     sub (nested <x-oc::sidebar.item> entries; renders an expandable details), tooltip (in a collapsed sidebar; default the
     text of the label, false for none). --}}
@props(['href' => '#', 'current' => false, 'disabled' => false, 'badge' => null, 'tooltip' => null])
@php($tip = $tooltip === false ? null : ($tooltip ?: (trim(strip_tags((string) $slot)) ?: null)))
<li>
    @if (isset($sub) && trim((string) $sub) !== '')
        <details class="oc-sidebar-collapsible" @if ($current) open @endif>
            <summary class="oc-sidebar-menu-button">@if (isset($icon)){{ $icon }}@endif<span class="oc-sidebar-menu-label">{{ $slot }}</span></summary>
            <ul class="oc-sidebar-menu-sub">{{ $sub }}</ul>
        </details>
    @else
        <a {{ $attributes->class(['oc-sidebar-menu-button', 'oc-tooltip oc-tooltip--right' => $tip])->merge(array_filter(['href' => $disabled ? null : $href, 'data-tooltip' => $tip])) }} @if ($current) aria-current="page" @endif @if ($disabled) aria-disabled="true" @endif>
            @if (isset($icon)){{ $icon }}@endif
            <span class="oc-sidebar-menu-label">{{ $slot }}</span>
            @if ($badge !== null)
                <span class="oc-sidebar-menu-badge">{{ $badge }}</span>
            @endif
        </a>
    @endif
</li>
