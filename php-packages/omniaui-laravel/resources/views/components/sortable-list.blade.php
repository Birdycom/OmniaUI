{{-- File: resources/views/components/sortable-list.blade.php | Map: props -> ul/ol.oc-sortable-list[data-oc-sortable] -> li.oc-sortable-item[data-id] (grip, label or slot, arrows, hidden input)
     OmniaUI sortable list (0.18.0): reorder with a finger, pen or mouse or the keyboard (Space + arrows), by sortable-list.js
     (npx omniaui copy-js sortable-list). Props: items (id => label, or a list of labels), ordered (ol with positions),
     arrows (up / down buttons), name (hidden inputs name[] in the new order, for a plain form), reorder (Livewire: method
     called with the new order of ids), grip (grip name, ":label" is replaced). The list fires "oc-reorder" ({ from, to, order }).
     Slot `item` is not used: for rich rows write the li markup yourself (see the snippet). --}}
@props(['items' => [], 'ordered' => false, 'arrows' => false, 'name' => null, 'reorder' => null, 'grip' => 'Move :label', 'upLabel' => 'Move up', 'downLabel' => 'Move down'])
@php
    $tag = $ordered ? 'ol' : 'ul';
    $rows = array_is_list((array) $items) ? array_combine(array_map('strval', (array) $items), (array) $items) : (array) $items;
    $count = count($rows);
@endphp
<{{ $tag }} {{ $attributes->class(['oc-sortable-list'])->merge(array_filter(['data-oc-sortable' => '', 'data-oc-reorder-call' => $reorder], fn ($v) => $v !== null)) }}>
    @foreach ($rows as $id => $label)
        <li class="oc-sortable-item" data-id="{{ $id }}" data-label="{{ $label }}" wire:key="sortable-{{ $id }}">
            <button type="button" class="oc-sortable-row-grip" aria-label="{{ str_replace(':label', $label, $grip) }}"></button>
            <span class="oc-sortable-item__body">{{ $label }}</span>
            @if ($arrows)
                <span class="oc-sortable-item__arrows">
                    <button type="button" data-oc-move="up" aria-label="{{ $upLabel }}: {{ $label }}"><x-oc::webicon name="mdi:chevron-up" /></button>
                    <button type="button" data-oc-move="down" aria-label="{{ $downLabel }}: {{ $label }}"><x-oc::webicon name="mdi:chevron-down" /></button>
                </span>
            @endif
            @if ($name)
                <input type="hidden" name="{{ $name }}[]" value="{{ $id }}">
            @endif
        </li>
    @endforeach
</{{ $tag }}>
