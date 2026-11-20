{{-- File: resources/views/components/sortable-row.blade.php | Map: tr.oc-sortable-row -> grip cell (button) -> default slot (cells)
     OmniaUI sortable row (styling only; your script handles drag and drop). Needs @birdycom/omniaui CSS.
     Props: grip (accessible name, e.g. "Move Install"), dragging (bool), drop ('before'|'after'), locked (bool),
     grabbed (picked up with the keyboard: aria-pressed on the grip; leave null when not used), grip-attributes (extra attributes for the
     grip button, e.g. ['wire:keydown.arrow-up' => 'up(3)']).
     Slot: the normal row cells. --}}
@props(['grip' => 'Move row', 'dragging' => false, 'drop' => null, 'locked' => false, 'grabbed' => null, 'gripAttributes' => []])
@php
    $gripBag = (new \Illuminate\View\ComponentAttributeBag((array) $gripAttributes))->class(['oc-sortable-row-grip'])
        ->merge(array_filter(['type' => 'button', 'aria-label' => $grip, 'aria-pressed' => $grabbed === null ? null : ($grabbed ? 'true' : 'false')], fn ($v) => $v !== null));
@endphp
<tr {{ $attributes->class(['oc-sortable-row', 'is-dragging' => $dragging, 'is-drop-'.$drop => in_array($drop, ['before', 'after'], true)])->merge($locked ? [] : ['draggable' => 'true']) }}>
    <td class="oc-sortable-row-grip-cell"><button {{ $gripBag }} @disabled($locked)></button></td>
    {{ $slot }}
</tr>
