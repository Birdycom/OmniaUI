{{-- OmniaUI dropdown sub-menu (0.17.0): an item that opens a nested menu on hover and focus (.oc-dropdown-sub). Props: label
     (text of the item), icon (webicon name in front of it). Slot: the items of the sub-menu (<x-oc::dropdown.item>). --}}
@props(['label' => '', 'icon' => null])
<div {{ $attributes->class(['oc-dropdown-sub']) }}>
    <button class="oc-dropdown-item" type="button" role="menuitem" aria-haspopup="menu">@if ($icon)<span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon :name="$icon" bare fallback="iconify" /></span>@endif{{ $label }}</button>
    <div class="oc-dropdown-submenu" role="menu">{{ $slot }}</div>
</div>
