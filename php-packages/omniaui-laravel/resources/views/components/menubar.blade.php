{{-- File: resources/views/components/menubar.blade.php | Map: props -> bar (role menubar, one trigger per menu) -> one popover menu per trigger (<x-oc::menubar.entries>)
     OmniaUI menubar (0.17.0): a horizontal menu bar built from popover dropdown menus, no JavaScript (same markup as
     packages/ui/snippets/menubar.html). Props: menus (list of ['label' => 'File', 'items' => [...], 'id' => optional];
     items as in menubar/entries.blade.php), label (aria-label of the bar), id (prefix of the menu ids). Attributes go to the bar. --}}
@props(['menus' => [], 'label' => null, 'id' => null])
@php
    $base = $id ?: 'oc-menubar-'.substr(md5(uniqid('', true)), 0, 6);
    $ids = array_map(fn ($menu, $i) => $menu['id'] ?? $base.'-'.($i + 1), $menus, array_keys(array_values($menus)));
    $menus = array_values($menus);
@endphp
<div {{ $attributes->class(['oc-menubar'])->merge(['role' => 'menubar', 'aria-label' => $label]) }}>
    @foreach ($menus as $i => $menu)
        <button class="oc-menubar-trigger" type="button" role="menuitem" popovertarget="{{ $ids[$i] }}" aria-haspopup="menu">{{ $menu['label'] ?? '' }}</button>
    @endforeach
</div>
@foreach ($menus as $i => $menu)
    <div class="oc-dropdown-menu" id="{{ $ids[$i] }}" popover role="menu">
        <x-oc::menubar.entries :items="$menu['items'] ?? []" />
    </div>
@endforeach
