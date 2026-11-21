{{-- File: resources/views/components/sidebar/menu-action.blade.php | Map: props -> button.oc-sidebar-menu-action (webicon or slot)
     OmniaUI sidebar menu action (0.17.0): a small button on the right of a sidebar item (more, add). Use it in the
     `action` slot of <x-oc::sidebar.item>. Props: label (accessible name and tooltip), icon (webicon name, default
     mdi:dots-vertical), show-on-hover (only visible while the item is hovered or has focus). Slot: replaces the icon. --}}
@props(['label', 'icon' => 'mdi:dots-vertical', 'showOnHover' => false])
<button type="button" {{ $attributes->class(['oc-sidebar-menu-action', 'oc-sidebar-menu-action--hover' => $showOnHover])->merge(['aria-label' => $label, 'title' => $label]) }}>
    @if (trim((string) $slot) !== ''){{ $slot }}@else<x-oc::webicon :name="$icon" />@endif
</button>
