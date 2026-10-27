{{-- OmniaCSS sidebar item. Props: href, current, disabled, badge. Slots: default = label, icon (inline svg with class oc-sidebar-menu-icon),
     sub (nested <x-oc::sidebar.item> entries; renders an expandable details). --}}
@props(['href' => '#', 'current' => false, 'disabled' => false, 'badge' => null])
<li>
    @if (isset($sub) && trim((string) $sub) !== '')
        <details class="oc-sidebar-collapsible" @if ($current) open @endif>
            <summary class="oc-sidebar-menu-button">@if (isset($icon)){{ $icon }}@endif<span class="oc-sidebar-menu-label">{{ $slot }}</span></summary>
            <ul class="oc-sidebar-menu-sub">{{ $sub }}</ul>
        </details>
    @else
        <a {{ $attributes->class(['oc-sidebar-menu-button'])->merge(['href' => $disabled ? null : $href]) }} @if ($current) aria-current="page" @endif @if ($disabled) aria-disabled="true" @endif>
            @if (isset($icon)){{ $icon }}@endif
            <span class="oc-sidebar-menu-label">{{ $slot }}</span>
            @if ($badge !== null)
                <span class="oc-sidebar-menu-badge">{{ $badge }}</span>
            @endif
        </a>
    @endif
</li>
