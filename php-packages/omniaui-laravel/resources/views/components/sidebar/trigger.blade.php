{{-- File: resources/views/components/sidebar/trigger.blade.php | Map: props -> button.oc-sidebar-trigger[data-oc-sidebar-trigger] (webicon or slot)
     OmniaUI sidebar trigger (0.17.0): opens or collapses the sidebar of the surrounding <x-oc::sidebar.provider> (sidebar.js).
     Props: label (accessible name, default "Toggle sidebar"), icon (webicon name, default mdi:menu), expanded (initial
     aria-expanded, default true). Slot: replaces the icon. --}}
@props(['label' => 'Toggle sidebar', 'icon' => 'mdi:menu', 'expanded' => true])
<button type="button" {{ $attributes->class(['oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-sidebar-trigger'])->merge(['aria-label' => $label, 'title' => $label, 'aria-expanded' => $expanded ? 'true' : 'false']) }} data-oc-sidebar-trigger>
    @if (trim((string) $slot) !== ''){{ $slot }}@else<x-oc::webicon :name="$icon" />@endif
</button>
