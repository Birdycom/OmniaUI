{{-- OmniaCSS sidebar item. Props: href, current, disabled, badge, active (the section that holds the current page: .is-active).
     Slots: default = label, icon (inline svg with class oc-sidebar-menu-icon),
     sub (nested <x-oc::sidebar.item> entries; renders an expandable details), tooltip (in a collapsed sidebar; default the
     text of the label, false for none). In <x-oc::sidebar variant="docs">: a plain text link, and `sub` becomes the
     ul.oc-sidebar-menu-sub right after it (always visible). --}}
@aware(['variant' => 'app'])
@props(['href' => '#', 'current' => false, 'disabled' => false, 'badge' => null, 'tooltip' => null, 'active' => false])
@if ($variant === 'docs')
<li>
    <a {{ $attributes->class(['oc-sidebar-menu-button', 'is-active' => $active])->merge(array_filter(['href' => $disabled ? null : $href])) }} @if ($current) aria-current="page" @endif @if ($disabled) aria-disabled="true" @endif>{!! trim((string) $slot) !!}</a>
    @if (isset($sub) && trim((string) $sub) !== '')
        <ul class="oc-sidebar-menu-sub">{{ $sub }}</ul>
    @endif
</li>
@else
@php($tip = $tooltip === false ? null : ($tooltip ?: (trim(strip_tags((string) $slot)) ?: null)))
<li>
    @if (isset($sub) && trim((string) $sub) !== '')
        <details class="oc-sidebar-collapsible" @if ($current) open @endif>
            <summary class="oc-sidebar-menu-button">@if (isset($icon)){{ $icon }}@endif<span class="oc-sidebar-menu-label">{{ $slot }}</span></summary>
            <ul class="oc-sidebar-menu-sub">{{ $sub }}</ul>
        </details>
    @else
        <a {{ $attributes->class(['oc-sidebar-menu-button', 'is-active' => $active, 'oc-tooltip oc-tooltip--right' => $tip])->merge(array_filter(['href' => $disabled ? null : $href, 'data-tooltip' => $tip])) }} @if ($current) aria-current="page" @endif @if ($disabled) aria-disabled="true" @endif>
            @if (isset($icon)){{ $icon }}@endif
            <span class="oc-sidebar-menu-label">{{ $slot }}</span>
            @if ($badge !== null)
                <span class="oc-sidebar-menu-badge">{{ $badge }}</span>
            @endif
        </a>
    @endif
</li>
@endif
