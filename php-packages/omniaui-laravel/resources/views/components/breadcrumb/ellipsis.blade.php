{{-- OmniaCSS compound breadcrumb (0.17.1): the folded middle of a long trail. Props: items (the hidden levels, list of
     ['label' => ..., 'href' => ..., 'icon' => ...]: a menu under the "…" button, a native popover without script), label
     (accessible name, {count} = number of hidden levels), id (of the menu). Slot: your own menu content (.oc-dropdown-item
     links) instead of items. Without items or slot it is only a "…" mark. Put it in <x-oc::breadcrumb.item>.
     0.18.0: the "…" is inline SVG (no icon set or runtime needed). --}}
@props(['items' => null, 'label' => null, 'id' => null])
@php
    $menuId = $id ?: 'oc-bc-'.substr(md5(json_encode($items).spl_object_id($attributes)), 0, 8);
    $count = is_array($items) ? count($items) : 0;
    $name = str_replace('{count}', (string) $count, $label ?: ($count ? 'Show {count} more levels' : 'More levels'));
    $hasMenu = is_array($items) || trim((string) $slot) !== '';
@endphp
@if ($hasMenu)
<button {{ $attributes->class(['oc-breadcrumb-ellipsis'])->merge(['type' => 'button', 'popovertarget' => $menuId, 'aria-label' => $name]) }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:dots-horizontal"><path d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" /></svg></button>
<div class="oc-dropdown-menu" id="{{ $menuId }}" popover="auto" role="menu">
    @if (trim((string) $slot) !== '')
        {{ $slot }}
    @else
        @foreach ($items as $item)
            <a class="oc-dropdown-item" role="menuitem" @if (! empty($item['href'])) href="{{ $item['href'] }}" @endif>@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['label'] }}</a>
        @endforeach
    @endif
</div>
@else
<span {{ $attributes->class(['oc-breadcrumb-ellipsis'])->merge(['role' => 'img', 'aria-label' => $name]) }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:dots-horizontal"><path d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2" /></svg></span>
@endif
