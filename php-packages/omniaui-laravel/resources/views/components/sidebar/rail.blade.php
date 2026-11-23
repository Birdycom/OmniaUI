{{-- File: resources/views/components/sidebar/rail.blade.php | Map: button.oc-sidebar-rail[data-oc-sidebar-rail]
     OmniaUI sidebar rail (0.17.0): a thin hit area on the sidebar edge that toggles it (sidebar.js). Put it right after
     <x-oc::sidebar> inside <x-oc::sidebar.provider>. Prop: label (default "Toggle sidebar"). --}}
@props(['label' => 'Toggle sidebar'])
<button type="button" tabindex="-1" {{ $attributes->class(['oc-sidebar-rail'])->merge(['aria-label' => $label, 'title' => $label]) }} data-oc-sidebar-rail></button>
