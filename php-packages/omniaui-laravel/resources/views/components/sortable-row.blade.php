{{-- File: resources/views/components/sortable-row.blade.php | Map: tr.oc-sortable-row -> grip cell (button) -> default slot (cells)
     OmniaUI sortable row (styling only; your script handles drag and drop). Needs @birdycom/omniaui CSS.
     Props: grip (accessible name, e.g. "Move Install"), dragging (bool), drop ('before'|'after'), locked (bool).
     Slot: the normal row cells. --}}
@props(['grip' => 'Move row', 'dragging' => false, 'drop' => null, 'locked' => false])
<tr {{ $attributes->class(['oc-sortable-row', 'is-dragging' => $dragging, 'is-drop-'.$drop => in_array($drop, ['before', 'after'], true)])->merge($locked ? [] : ['draggable' => 'true']) }}>
    <td class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" aria-label="{{ $grip }}" @disabled($locked)></button></td>
    {{ $slot }}
</tr>
