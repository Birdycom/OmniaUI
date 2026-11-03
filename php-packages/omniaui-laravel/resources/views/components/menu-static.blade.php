{{-- OmniaUI static menu (a tray menu, no popover). Props: flat (no frame). Slot = the items: button.oc-dropdown-item
     (role="menuitemcheckbox" aria-checked + a span.oc-dropdown-check column, a span.oc-dropdown-hint on the right),
     div.oc-dropdown-label, div.oc-dropdown-separator. --}}
@props(['flat' => false])
<div {{ $attributes->class(['oc-dropdown-menu oc-dropdown-menu--static', 'oc-dropdown-menu--flat' => $flat])->merge(['role' => 'menu']) }}>
    {{ $slot }}
</div>
