{{-- File: resources/views/components/table-actions.blade.php | Map: td.oc-table-actions -> icon actions (default slot) OR overflow trigger + popover menu (default slot = menu items)
     OmniaUI table actions (row actions cell). Needs @birdycom/omniaui CSS.
     Props: menu (accessible name of the three dots trigger; turns on menu mode), id (menu id, auto when empty).
     Slot: icon actions (a/button.oc-table-actions-icon, tones --primary/--success/--destructive), or .oc-dropdown-item entries in menu mode. --}}
@props(['menu' => null, 'id' => null])
@php($menuId = $id ?? 'oc-table-actions-menu-'.substr(md5((string) $menu.uniqid('', true)), 0, 8))
<td {{ $attributes->class(['oc-table-actions', 'oc-table-actions--icons' => ! $menu]) }}>
    @if ($menu)
        <button class="oc-table-actions-more" type="button" popovertarget="{{ $menuId }}" aria-label="{{ $menu }}"></button>
        <div class="oc-dropdown-menu" id="{{ $menuId }}" popover>
            {{ $slot }}
        </div>
    @else
        {{ $slot }}
    @endif
</td>
